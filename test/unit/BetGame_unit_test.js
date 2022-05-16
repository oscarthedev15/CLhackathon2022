const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { numToBytes32 } = require("@chainlink/test-helpers/dist/src/helpers")
const { assertServiceAgreementEmpty } = require("@chainlink/test-helpers/dist/src/contracts/coordinator")

let betGame, linkToken, accounts

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BetGame Unit Tests -- successfull story ", async function () {
    
      before(async () => {
        const chainId = network.config.chainId
        await deployments.fixture(["mocks", "api"])
        linkToken = await ethers.getContract("LinkToken")
        linkTokenAddress = linkToken.address
        additionalMessage = ` --linkaddress  ${linkTokenAddress}`
        betGame = await ethers.getContract("BetGame")
        accounts = await ethers.getSigners();
        mockOracle = await ethers.getContract("MockOracle")
      
        await hre.run("fund-link", { contract: betGame.address, linkaddress: linkTokenAddress })
      })

      it("cannot make a bet less than minimum bet (.001 eth)", async () => {
        const now = Date.now()
        const _apiURL = "https://newsapi.org/v2/everything?q=+rocky,+arrest&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265"
        const _acceptValue = ethers.utils.parseEther("0.01")
        const _countArts = 25
        const _endDate = now + 5000
        const _acceptDate = now + 3000
        try {
          await betGame.createBet(_apiURL, _acceptValue, _countArts, _endDate, _acceptDate, {
            value: ethers.utils.parseEther("0.0001"),
            from: accounts[0].address
        })
          assert(false);
        } catch (err) {
            assert(err);
        }
      })

      it("Should successfully create a bet", async () => {
        const now = Date.now()
        const _apiURL = "https://newsapi.org/v2/everything?q=+rocky,+arrest&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265"
        const _acceptValue = ethers.utils.parseEther("0.01")
        const _countArts = 25
        const _endDate = now + 5000
        const _acceptDate = now + 3000
        await betGame.createBet(_apiURL, _acceptValue, _countArts, _endDate, _acceptDate, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[0].address
        })
        const activeBet = await betGame.activeBets(0);
        const bet = await betGame.allBets(activeBet);
        assert.equal(bet["creator"], accounts[0].address)
        assert.equal(bet["active"], true);
        assert.equal(bet["accepted"], false);
      })

      it("Should successfully accept a bet", async () => {
        await betGame.connect(accounts[1]).acceptBet(0, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[1].address
        })
        const acceptedBetCount = await betGame.acceptedBets(0);
        const bet = await betGame.allBets(acceptedBetCount);
        assert.equal(bet["acceptor"], accounts[1].address);
        assert.equal(bet["active"], true);
        assert.equal(bet["accepted"], true);
        
      })
    
      it("Should successfully make an api request", async () => {
        const transaction = await betGame.connect(accounts[1]).checkBet(0, {
            from: accounts[1].address
        });
        const transactionReceipt = await transaction.wait(1);
        const requestId = transactionReceipt.events[0].topics[1];
        console.log("requestId: ", requestId);
        expect(requestId).to.not.be.null;
      })


      it("Should successfully make an API request and close a bet", async () => {
        const preBalance = await accounts[0].getBalance()
        const transaction = await betGame.connect(accounts[1]).checkBet(0, {
          from: accounts[1].address
      });
        const transactionReceipt = await transaction.wait(1)
        const requestId = transactionReceipt.events[0].topics[1]
        const callbackValue = 2600
        await mockOracle.fulfillOracleRequest(requestId, numToBytes32(callbackValue))
        const mybet = await betGame.allBets(0);
        const postBalance = await accounts[0].getBalance();
        const difference = postBalance - preBalance;
        assert(difference > ethers.utils.parseEther("0.019")); //allows for some gas lossage
        assert.equal(mybet["closed"], true)
        assert.equal(mybet["active"], false)
        try {
          await betGame.activeBets(0)
          await betGame.acceptedBets(0)
          assert(false);
        } catch (err) {
            assert(err);
        }
      })


    it("should be able to call checkUpkeep", async () => {
      const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
      await betGame.setInterval(200);
      const { upkeepNeeded } = await betGame.callStatic.checkUpkeep(checkData)
      assert.equal(upkeepNeeded, false)
    })

    it("should not be able to call performUpkeep before time passes", async () => {
      const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
      const interval = await betGame.interval()
      await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
      await betGame.performUpkeep(checkData)
      await expect(betGame.performUpkeep(checkData)).to.be.revertedWith("Time interval not met")
    })

    it("should be able to call performUpkeep after time passes", async () => {
      const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
      const interval = await betGame.interval()
      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
      await betGame.performUpkeep(checkData)

    })

    it("should update the lastTimeStamp correctly", async () => {
      const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
      const interval = await betGame.interval()
      const before = await betGame.lastTimeStamp()
      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
      await betGame.performUpkeep(checkData)
      const after = await betGame.lastTimeStamp();
      assert.isTrue(after > before);

    })
})
