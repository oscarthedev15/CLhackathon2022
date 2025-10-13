const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const fs = require("fs");
const path = require("path");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BetFactory - Functions-Based Test Suite", function () {
      let betFactory;
      let deployer, creator, acceptor, user3;

      const MINIMUM_BET = ethers.utils.parseEther("0.001");
      const SERVICE_FEE_PERCENTAGE = 500; // 5% in basis points
      const GAS_LIMIT = 300000;
      const MOCK_FUNCTIONS_ROUTER =
        "0x0000000000000000000000000000000000000001";
      const MOCK_DON_ID = ethers.utils.formatBytes32String("mock-don-id");
      const MOCK_SUBSCRIPTION_ID = 1;

      beforeEach(async () => {
        [deployer, creator, acceptor, user3] = await ethers.getSigners();

        // Load JavaScript source
        const sourcePath = path.join(
          __dirname,
          "../scripts/functions-source.js"
        );
        const source = fs.readFileSync(sourcePath, "utf8");

        const BetFactoryFactory = await ethers.getContractFactory("BetFactory");

        betFactory = await BetFactoryFactory.deploy(
          MINIMUM_BET,
          SERVICE_FEE_PERCENTAGE,
          MOCK_FUNCTIONS_ROUTER,
          MOCK_DON_ID,
          MOCK_SUBSCRIPTION_ID,
          GAS_LIMIT,
          source,
          deployer.address // treasury
        );

        await betFactory.deployed();
      });

      describe("Deployment", function () {
        it("Should set the correct initial values", async () => {
          expect(await betFactory.minimumBetAmount()).to.equal(MINIMUM_BET);
          expect(await betFactory.serviceFeePercentage()).to.equal(
            SERVICE_FEE_PERCENTAGE
          );
          expect(await betFactory.donId()).to.equal(MOCK_DON_ID);
          expect(await betFactory.subscriptionId()).to.equal(
            MOCK_SUBSCRIPTION_ID
          );
          expect(await betFactory.gasLimit()).to.equal(GAS_LIMIT);
          expect(await betFactory.treasury()).to.equal(deployer.address);
        });

        it("Should have JavaScript source code set", async () => {
          const source = await betFactory.source();
          expect(source.length).to.be.gt(0);
          expect(source).to.include("Functions.makeHttpRequest");
        });
      });

      describe("Bet Creation", function () {
        it("Should create a bet successfully", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600; // 1 hour from now
          const expirationDate = now + 7200; // 2 hours from now

          const betAmount = ethers.utils.parseEther("0.01");
          const acceptorAmount = ethers.utils.parseEther("0.01");

          const tx = await betFactory.connect(creator).createBet(
            "Test Bet",
            "https://api.example.com/data",
            acceptorAmount,
            100, // target value
            acceptByDate,
            expirationDate,
            { value: betAmount }
          );

          const receipt = await tx.wait();
          const event = receipt.events?.find((e) => e.event === "BetCreated");

          expect(event).to.not.be.undefined;
          expect(event.args.betId).to.equal(0);
          expect(event.args.creator).to.equal(creator.address);

          const bet = await betFactory.getBet(0);
          expect(bet.creator).to.equal(creator.address);
          expect(bet.status).to.equal(0); // Active
        });

        it("Should fail if bet amount is less than minimum", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600;
          const expirationDate = now + 7200;

          const lowAmount = ethers.utils.parseEther("0.0001");

          await expect(
            betFactory
              .connect(creator)
              .createBet(
                "Test Bet",
                "https://api.example.com/data",
                MINIMUM_BET,
                100,
                acceptByDate,
                expirationDate,
                { value: lowAmount }
              )
          ).to.be.revertedWithCustomError(betFactory, "InsufficientBetAmount");
        });

        it("Should fail if acceptor amount is less than minimum", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600;
          const expirationDate = now + 7200;

          const betAmount = ethers.utils.parseEther("0.01");
          const lowAcceptorAmount = ethers.utils.parseEther("0.0001");

          await expect(
            betFactory
              .connect(creator)
              .createBet(
                "Test Bet",
                "https://api.example.com/data",
                lowAcceptorAmount,
                100,
                acceptByDate,
                expirationDate,
                { value: betAmount }
              )
          ).to.be.revertedWithCustomError(betFactory, "InvalidAcceptValue");
        });

        it("Should fail if dates are invalid", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const expirationDate = now + 7200;
          const invalidAcceptDate = expirationDate + 3600; // After expiration

          const betAmount = ethers.utils.parseEther("0.01");

          await expect(
            betFactory
              .connect(creator)
              .createBet(
                "Test Bet",
                "https://api.example.com/data",
                betAmount,
                100,
                invalidAcceptDate,
                expirationDate,
                { value: betAmount }
              )
          ).to.be.revertedWithCustomError(betFactory, "InvalidDates");
        });

        it("Should deduct service fee correctly", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600;
          const expirationDate = now + 7200;

          const betAmount = ethers.utils.parseEther("1.0");
          const expectedFee = betAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000);
          const expectedBetAmount = betAmount.sub(expectedFee);

          const treasuryBalanceBefore = await ethers.provider.getBalance(
            deployer.address
          );

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet",
              "https://api.example.com/data",
              betAmount,
              100,
              acceptByDate,
              expirationDate,
              { value: betAmount }
            );

          const bet = await betFactory.getBet(0);
          expect(bet.creatorAmount).to.equal(expectedBetAmount);

          const treasuryBalanceAfter = await ethers.provider.getBalance(
            deployer.address
          );
          expect(treasuryBalanceAfter.sub(treasuryBalanceBefore)).to.equal(
            expectedFee
          );
        });

        it("Should add bet to active bets array", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600;
          const expirationDate = now + 7200;

          const betAmount = ethers.utils.parseEther("0.01");

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet",
              "https://api.example.com/data",
              betAmount,
              100,
              acceptByDate,
              expirationDate,
              { value: betAmount }
            );

          const activeBets = await betFactory.getActiveBets();
          expect(activeBets.length).to.equal(1);
          expect(activeBets[0]).to.equal(0);
        });

        it("Should add bet to user's bet list", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600;
          const expirationDate = now + 7200;

          const betAmount = ethers.utils.parseEther("0.01");

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet",
              "https://api.example.com/data",
              betAmount,
              100,
              acceptByDate,
              expirationDate,
              { value: betAmount }
            );

          const userBets = await betFactory.getUserBets(creator.address);
          expect(userBets.length).to.equal(1);
          expect(userBets[0]).to.equal(0);
        });
      });

      describe("Bet Acceptance", function () {
        const betAmount = ethers.utils.parseEther("0.01");
        const acceptorAmount = ethers.utils.parseEther("0.01");

        beforeEach(async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600;
          const expirationDate = now + 7200;

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet",
              "https://api.example.com/data",
              acceptorAmount,
              100,
              acceptByDate,
              expirationDate,
              { value: betAmount }
            );
        });

        it("Should accept a bet successfully", async () => {
          // Calculate total amount with service fee
          const acceptTotalAmount = acceptorAmount.add(
            acceptorAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          const tx = await betFactory
            .connect(acceptor)
            .acceptBet(0, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });

          const receipt = await tx.wait();
          const event = receipt.events?.find((e) => e.event === "BetAccepted");

          expect(event).to.not.be.undefined;
          expect(event.args.betId).to.equal(0);
          expect(event.args.acceptor).to.equal(acceptor.address);

          const bet = await betFactory.getBet(0);
          expect(bet.acceptor).to.equal(acceptor.address);
          expect(bet.status).to.equal(1); // Accepted
        });

        it("Should move bet from active to accepted array", async () => {
          const acceptTotalAmount = acceptorAmount.add(
            acceptorAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          await betFactory
            .connect(acceptor)
            .acceptBet(0, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });

          const activeBets = await betFactory.getActiveBets();
          const acceptedBets = await betFactory.getAcceptedBets();

          expect(activeBets.length).to.equal(0);
          expect(acceptedBets.length).to.equal(1);
          expect(acceptedBets[0]).to.equal(0);
        });

        it("Should fail if bet is not active", async () => {
          const acceptTotalAmount = acceptorAmount.add(
            acceptorAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          await betFactory
            .connect(acceptor)
            .acceptBet(0, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });

          await expect(
            betFactory
              .connect(user3)
              .acceptBet(0, "https://api.user3.com/data", {
                value: acceptTotalAmount,
              })
          ).to.be.revertedWithCustomError(betFactory, "BetNotActive");
        });

        it("Should fail if accept amount is incorrect", async () => {
          const wrongAmount = ethers.utils.parseEther("0.02");

          await expect(
            betFactory
              .connect(acceptor)
              .acceptBet(0, "https://api.acceptor.com/data", {
                value: wrongAmount,
              })
          ).to.be.revertedWithCustomError(betFactory, "IncorrectAcceptAmount");
        });

        it("Should fail if accept deadline has passed", async () => {
          // Fast forward time past accept deadline
          await network.provider.send("evm_increaseTime", [3700]);
          await network.provider.send("evm_mine");

          await expect(
            betFactory
              .connect(acceptor)
              .acceptBet(0, "https://api.acceptor.com/data", {
                value: acceptorAmount,
              })
          ).to.be.revertedWithCustomError(betFactory, "AcceptDeadlinePassed");
        });

        it("Should collect service fee on acceptance", async () => {
          const acceptTotalAmount = acceptorAmount.add(
            acceptorAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          const expectedFee = acceptorAmount
            .mul(SERVICE_FEE_PERCENTAGE)
            .div(10000);
          const treasuryBalanceBefore = await ethers.provider.getBalance(
            deployer.address
          );

          await betFactory
            .connect(acceptor)
            .acceptBet(0, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });

          const treasuryBalanceAfter = await ethers.provider.getBalance(
            deployer.address
          );
          expect(treasuryBalanceAfter.sub(treasuryBalanceBefore)).to.equal(
            expectedFee
          );
        });

        it("Should add bet to acceptor's bet list", async () => {
          const acceptTotalAmount = acceptorAmount.add(
            acceptorAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          await betFactory
            .connect(acceptor)
            .acceptBet(0, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });

          const userBets = await betFactory.getUserBets(acceptor.address);
          expect(userBets.length).to.equal(1);
          expect(userBets[0]).to.equal(0);
        });
      });

      describe("Manual Bet Resolution", function () {
        const betAmount = ethers.utils.parseEther("0.01");
        const acceptorAmount = ethers.utils.parseEther("0.01");
        const targetValue = 100;

        beforeEach(async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 3600;
          const expirationDate = now + 7200;

          const acceptTotalAmount = acceptorAmount.add(
            acceptorAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet",
              "https://api.example.com/data",
              acceptorAmount,
              targetValue,
              acceptByDate,
              expirationDate,
              { value: betAmount }
            );

          await betFactory
            .connect(acceptor)
            .acceptBet(0, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });
        });

        it("Should allow participants to call checkBet", async () => {
          // Note: This will fail in local testing without a proper Functions router
          // In production, this would trigger a Chainlink Functions request
          await expect(betFactory.connect(creator).checkBet(0)).to.be.reverted;
        });

        it("Should fail if non-participant tries to check bet", async () => {
          await expect(
            betFactory.connect(user3).checkBet(0)
          ).to.be.revertedWith("Only participants can check bet");
        });

        it("Should fail to check bet if not accepted", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now2 = block.timestamp;
          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet 2",
              "https://api.example.com/data",
              betAmount,
              100,
              now2 + 3600,
              now2 + 7200,
              { value: betAmount }
            );

          await expect(
            betFactory.connect(creator).checkBet(1)
          ).to.be.revertedWithCustomError(betFactory, "BetNotActive");
        });
      });

      describe("Manual Bet Cancellation", function () {
        const betAmount = ethers.utils.parseEther("0.01");

        beforeEach(async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const acceptByDate = now + 100; // Very short window
          const expirationDate = now + 200;

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet",
              "https://api.example.com/data",
              betAmount,
              100,
              acceptByDate,
              expirationDate,
              { value: betAmount }
            );
        });

        it("Should allow creator to cancel expired active bet", async () => {
          const creatorBalanceBefore = await ethers.provider.getBalance(
            creator.address
          );

          // Fast forward past accept deadline
          await network.provider.send("evm_increaseTime", [150]);
          await network.provider.send("evm_mine");

          const tx = await betFactory.connect(creator).cancelExpiredBet(0);
          const receipt = await tx.wait();
          const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

          const bet = await betFactory.getBet(0);
          expect(bet.status).to.equal(3); // Cancelled

          const activeBets = await betFactory.getActiveBets();
          expect(activeBets.length).to.equal(0);

          const creatorBalanceAfter = await ethers.provider.getBalance(
            creator.address
          );
          const expectedRefund = betAmount.sub(
            betAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );
          expect(
            creatorBalanceAfter.sub(creatorBalanceBefore).add(gasUsed)
          ).to.equal(expectedRefund);
        });

        it("Should fail if deadline not passed", async () => {
          await expect(
            betFactory.connect(creator).cancelExpiredBet(0)
          ).to.be.revertedWith("Accept deadline not passed");
        });

        it("Should fail if not creator", async () => {
          await network.provider.send("evm_increaseTime", [150]);
          await network.provider.send("evm_mine");

          await expect(
            betFactory.connect(acceptor).cancelExpiredBet(0)
          ).to.be.revertedWith("Only creator can cancel");
        });

        it("Should fail if bet already accepted", async () => {
          const acceptTotalAmount = betAmount.add(
            betAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          await betFactory
            .connect(acceptor)
            .acceptBet(0, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });

          await network.provider.send("evm_increaseTime", [150]);
          await network.provider.send("evm_mine");

          await expect(
            betFactory.connect(creator).cancelExpiredBet(0)
          ).to.be.revertedWith("Bet not active");
        });
      });

      describe("Configuration Updates", function () {
        it("Should update config successfully (owner only)", async () => {
          const newMinBet = ethers.utils.parseEther("0.002");
          const newServiceFee = 1000; // 10%
          const newTreasury = user3.address;

          await betFactory.updateConfig(newMinBet, newServiceFee, newTreasury);

          expect(await betFactory.minimumBetAmount()).to.equal(newMinBet);
          expect(await betFactory.serviceFeePercentage()).to.equal(
            newServiceFee
          );
          expect(await betFactory.treasury()).to.equal(newTreasury);
        });

        it("Should fail to update config if not owner", async () => {
          await expect(
            betFactory
              .connect(creator)
              .updateConfig(
                ethers.utils.parseEther("0.002"),
                1000,
                user3.address
              )
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should update functions config successfully", async () => {
          const newDonId = ethers.utils.formatBytes32String("new-don-id");
          const newSubId = 999;
          const newGasLimit = 400000;
          const newSource = "new source code";

          await betFactory.updateFunctionsConfig(
            newDonId,
            newSubId,
            newGasLimit,
            newSource
          );

          expect(await betFactory.donId()).to.equal(newDonId);
          expect(await betFactory.subscriptionId()).to.equal(newSubId);
          expect(await betFactory.gasLimit()).to.equal(newGasLimit);
          expect(await betFactory.source()).to.equal(newSource);
        });
      });

      describe("View Functions", function () {
        it("Should return user bets correctly", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const betAmount = ethers.utils.parseEther("0.01");

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet 1",
              "https://api.example.com/data",
              betAmount,
              100,
              now + 3600,
              now + 7200,
              { value: betAmount }
            );

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet 2",
              "https://api.example.com/data",
              betAmount,
              100,
              now + 3600,
              now + 7200,
              { value: betAmount }
            );

          const userBets = await betFactory.getUserBets(creator.address);
          expect(userBets.length).to.equal(2);
          expect(userBets[0]).to.equal(0);
          expect(userBets[1]).to.equal(1);
        });

        it("Should return bet details correctly", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const betAmount = ethers.utils.parseEther("0.01");

          await betFactory
            .connect(creator)
            .createBet(
              "Test Bet",
              "https://api.example.com/data",
              betAmount,
              100,
              now + 3600,
              now + 7200,
              { value: betAmount }
            );

          const [bet, title, creatorApi, acceptorApi] =
            await betFactory.getBetDetails(0);

          expect(bet.creator).to.equal(creator.address);
          expect(title).to.equal("Test Bet");
          expect(creatorApi).to.equal("https://api.example.com/data");
          expect(acceptorApi).to.equal("");
        });
      });

      describe("Emergency Functions", function () {
        it("Should allow owner to emergency withdraw ETH", async () => {
          // Send some ETH to contract
          await creator.sendTransaction({
            to: betFactory.address,
            value: ethers.utils.parseEther("1.0"),
          });

          const balanceBefore = await ethers.provider.getBalance(
            deployer.address
          );

          const tx = await betFactory.emergencyWithdraw();
          const receipt = await tx.wait();
          const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

          const balanceAfter = await ethers.provider.getBalance(
            deployer.address
          );
          expect(balanceAfter.sub(balanceBefore).add(gasUsed)).to.be.gt(0);
        });
      });

      describe("Gas Optimization Tests", function () {
        it("Should handle multiple bets efficiently", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const betAmount = ethers.utils.parseEther("0.01");

          // Create 10 bets
          for (let i = 0; i < 10; i++) {
            await betFactory
              .connect(creator)
              .createBet(
                `Test Bet ${i}`,
                "https://api.example.com/data",
                betAmount,
                100,
                now + 3600,
                now + 7200,
                { value: betAmount }
              );
          }

          const activeBets = await betFactory.getActiveBets();
          expect(activeBets.length).to.equal(10);
        });

        it("Should efficiently remove bets from middle of array", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;
          const betAmount = ethers.utils.parseEther("0.01");

          // Create 5 bets
          for (let i = 0; i < 5; i++) {
            await betFactory
              .connect(creator)
              .createBet(
                `Test Bet ${i}`,
                "https://api.example.com/data",
                betAmount,
                100,
                now + 3600,
                now + 7200,
                { value: betAmount }
              );
          }

          // Accept bet in the middle (bet 2)
          const acceptTotalAmount = betAmount.add(
            betAmount.mul(SERVICE_FEE_PERCENTAGE).div(10000)
          );

          await betFactory
            .connect(acceptor)
            .acceptBet(2, "https://api.acceptor.com/data", {
              value: acceptTotalAmount,
            });

          const activeBets = await betFactory.getActiveBets();
          expect(activeBets.length).to.equal(4);

          // Verify no gaps in array - convert to numbers for comparison
          const betIds = activeBets.map((id) => id.toNumber());
          expect(betIds).to.include(0);
          expect(betIds).to.include(1);
          expect(betIds).to.include(3);
          expect(betIds).to.include(4);
        });
      });

      describe("Edge Cases & Security", function () {
        it("Should handle zero value bets correctly", async () => {
          const block = await ethers.provider.getBlock("latest");
          const now = block.timestamp;

          await expect(
            betFactory
              .connect(creator)
              .createBet(
                "Test Bet",
                "https://api.example.com/data",
                MINIMUM_BET,
                100,
                now + 3600,
                now + 7200,
                { value: 0 }
              )
          ).to.be.revertedWithCustomError(betFactory, "InsufficientBetAmount");
        });

        it("Should handle non-existent bet queries gracefully", async () => {
          const bet = await betFactory.getBet(999);
          expect(bet.creator).to.equal(ethers.constants.AddressZero);
        });
      });

      describe("NOTE: Integration Testing Required", function () {
        it("Chainlink Functions integration must be tested on testnet", async () => {
          console.log("\n");
          console.log("=== IMPORTANT: INTEGRATION TESTING REQUIRED ===");
          console.log(
            "The following scenarios require testing on Sepolia testnet:"
          );
          console.log("1. checkBet() triggering Chainlink Functions request");
          console.log("2. fulfillRequest() callback with API response");
          console.log("3. Bet resolution based on actual API data");
          console.log("4. Creator winning when target value is reached");
          console.log("5. Acceptor winning when expiration date passes");
          console.log("6. Functions subscription management");
          console.log("7. Gas limit and DON ID configuration");
          console.log(
            "\nDeploy to Sepolia and use the BetFactory-E2E test suite"
          );
          console.log("===============================================\n");
        });
      });
    });
