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
        const now = Date.now();
        const _apiURL = "https://newsapi.org/v2/everything?q=+rocky,+arrest&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265";
        const _acceptValue = ethers.utils.parseEther("0.01");
        const _countArts = 25;
        const _endDate = now + 5000;
        const _acceptDate = now + 3000;
        await betGame.createBet(_apiURL, _acceptValue, _countArts, _endDate, _acceptDate, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[0].address
        });
        const activeBet = await betGame.activeBets(0);
        const bet = await betGame.allBets(activeBet);
        assert.equal(bet["creator"], accounts[0].address)
        assert.equal(bet["active"], true);
        assert.equal(bet["accepted"], false);
        assert.equal(bet.id, 0);
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
        try {
          await betGame.activeBets(0)
          assert(false);
        } catch (err) {
            assert(err);
        }
        
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

      it("Should successfully create a second bet", async () => {
        const now = Date.now();
        const _apiURL = "https://newsapi.org/v2/everything?q=+rocky,+arrest&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265";
        const _acceptValue = ethers.utils.parseEther("0.01");
        const _countArts = 24;
        const _endDate = now + 5000;
        const _acceptDate = now + 3000;
        await betGame.connect(accounts[2]).createBet(_apiURL, _acceptValue, _countArts, _endDate, _acceptDate, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[2].address
        });
        const activeBet = await betGame.activeBets(0);
        const bet = await betGame.allBets(activeBet);
        assert.equal(bet["creator"], accounts[2].address)
        assert.equal(bet["active"], true);
        assert.equal(bet["accepted"], false);
        assert.equal(bet["countArts"], 24);
        assert.equal(bet["id"], 1);
      })

      it("Should successfully accept second bet", async () => {
        await betGame.connect(accounts[3]).acceptBet(1, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[3].address
        })
        const acceptedBetCount = await betGame.acceptedBets(0);
        const bet = await betGame.allBets(acceptedBetCount);
        assert.equal(bet["acceptor"], accounts[3].address);
        assert.equal(bet["active"], true);
        assert.equal(bet["accepted"], true);
        try {
          await betGame.activeBets(0)
          assert(false);
        } catch (err) {
            assert(err);
        }
      })

      it("Should successfully make an API request and not close bet as check incompleted", async () => {
        const preBalance = await accounts[2].getBalance()
        const transaction = await betGame.connect(accounts[2]).checkBet(1, {
          from: accounts[2].address
      });
        const transactionReceipt = await transaction.wait(1)
        const requestId = transactionReceipt.events[0].topics[1]
        const callbackValue = 2300
        await mockOracle.fulfillOracleRequest(requestId, numToBytes32(callbackValue))
        const mybet = await betGame.allBets(1);
        const postBalance = await accounts[2].getBalance();
        const difference = postBalance - preBalance;
        assert(difference < ethers.utils.parseEther("0.00")); //allows for some gas lossage
        assert.equal(mybet["closed"], false);
        const betId = await betGame.acceptedBets(0);
        assert.equal(betId, 1);
      })

      it("Should successfully close a expired bet -- acceptor winning", async () => {
        const now = Math.floor(Date.now() / 1000);
        const _apiURL = "https://newsapi.org/v2/everything?q=+rocky,+arrest&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265";
        const _acceptValue = ethers.utils.parseEther("0.01");
        const _countArts = 24;
        const _endDate = now+21;
        const _acceptDate = now+20;
        await betGame.connect(accounts[2]).createBet(_apiURL, _acceptValue, _countArts, _endDate, _acceptDate, {
            value: ethers.utils.parseEther("0.01"),
            from: accounts[2].address
        });
        const betId = await betGame.activeBets(0);
        assert.equal(betId, 2);
        await betGame.connect(accounts[4]).acceptBet(2, {
          value: ethers.utils.parseEther("0.01"),
          from: accounts[4].address
        })  
        const preBalance = await accounts[4].getBalance();
        const transaction = await betGame.connect(accounts[2]).checkBet(2, {
          from: accounts[2].address
        });
        const transactionReceipt = await transaction.wait(1)
        const requestId = transactionReceipt.events[0].topics[1]
        const callbackValue = 2200 //acceptor wins bet 
        await mockOracle.fulfillOracleRequest(requestId, numToBytes32(callbackValue))
        const postBalance = await accounts[4].getBalance();
        const mybet = await betGame.allBets(2);
        console.log(mybet)
        const difference = postBalance - preBalance;
        console.log(difference)
        assert(difference > ethers.utils.parseEther("0.018")); //allows for some gas lossage
        assert.equal(mybet["closed"], true); //bet is closed due to timeout
        assert.equal(mybet["accepted"], true);
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
