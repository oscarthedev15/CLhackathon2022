const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { numToBytes32 } = require("@chainlink/test-helpers/dist/src/helpers")

let betGame, linkToken, accounts

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BetGame Unit Tests", async function () {
    
      before(async () => {
        const chainId = network.config.chainId
        await deployments.fixture(["mocks", "api"])
        linkToken = await ethers.getContract("LinkToken")
        linkTokenAddress = linkToken.address
        additionalMessage = ` --linkaddress  ${linkTokenAddress}`
        betGame = await ethers.getContract("BetGame")
        accounts = await ethers.getSigners();
      

        await hre.run("fund-link", { contract: betGame.address, linkaddress: linkTokenAddress })
      })

      it("Should successfully create a bet", async () => {
        const _apiURL = "https://newsapi.org/v2/everything?q=+rocky,+arrest&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265"
        const _acceptValue = 1
        const _countArts = 25
        const _startdate = 0
        const _endDate = 0
        const _acceptDate = 0
        await betGame.createBet(_apiURL, _acceptValue, _countArts, _startdate, _endDate, _acceptDate, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[0].address
        })
        const activeBet = await betGame.activeBets(0);
        const bet = await betGame.allBets(activeBet);
        console.log(bet);
        assert.equal(bet["active"], true);
        assert.equal(bet["accepted"], false);
        expect(activeBet).to.not.be.null
      })

      it("Should successfully accept a bet", async () => {
        await betGame.connect(accounts[1]).acceptBet(0, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[1].address
        })
        const acceptedBetCount = await betGame.acceptedBets(0);
        const bet = await betGame.allBets(acceptedBetCount);
        assert.equal(bet["active"], true);
        assert.equal(bet["accepted"], true);
        expect(acceptedBetCount).to.not.be.null
      })
    
      //TEST IS FAILING BECAUSE I THINK WE NEED TO MOCK THE ORACLE
      it("Should successfully check a bet with bettor winning", async () => {
        await betGame.connect(accounts[1]).checkBet(0, {
            from: accounts[1].address
        })
        const bet = await betGame.allBets(0);
        assert.equal(bet["closed"], true);
      })

    //   it("Should successfully make an API request", async () => {
    //     const transaction = await apiConsumer.requestVolumeData()
    //     const transactionReceipt = await transaction.wait(1)
    //     const requestId = transactionReceipt.events[0].topics[1]
    //     console.log("requestId: ", requestId)
    //     expect(requestId).to.not.be.null
    //   })

    //   it("Should successfully make an API request and get a result", async () => {
    //     const transaction = await apiConsumer.requestVolumeData()
    //     const transactionReceipt = await transaction.wait(1)
    //     const requestId = transactionReceipt.events[0].topics[1]
    //     const callbackValue = 777
    //     await mockOracle.fulfillOracleRequest(requestId, numToBytes32(callbackValue))
    //     const volume = await apiConsumer.volume()
    //     assert.equal(volume.toString(), callbackValue.toString())
    //   })

    //   it("Our event should successfully fire event on callback", async () => {
    //     const callbackValue = 777
    //     // we setup a promise so we can wait for our callback from the `once` function
    //     await new Promise(async (resolve, reject) => {
    //       // setup listener for our event
    //       apiConsumer.once("DataFullfilled", async () => {
    //         console.log("DataFullfilled event fired!")
    //         const volume = await apiConsumer.volume()
    //         // assert throws an error if it fails, so we need to wrap
    //         // it in a try/catch so that the promise returns event
    //         // if it fails.
    //         try {
    //           assert.equal(volume.toString(), callbackValue.toString())
    //           resolve()
    //         } catch (e) {
    //           reject(e)
    //         }
    //       })
    //       const transaction = await apiConsumer.requestVolumeData()
    //       const transactionReceipt = await transaction.wait(1)
    //       const requestId = transactionReceipt.events[0].topics[1]
    //       await mockOracle.fulfillOracleRequest(requestId, numToBytes32(callbackValue))
    //     })
    //   })
    })
