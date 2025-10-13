const { getNamedAccounts, deployments, network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../helper-functions");
const fs = require("fs");
const path = require("path");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Set log level to ignore non errors
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

  // Chainlink Functions configuration
  let functionsRouter;
  let donId;
  let subscriptionId;

  if (chainId == 31337) {
    // For local development, we'll need to mock Chainlink Functions
    // This is a placeholder - in reality, you'd need a mock router
    functionsRouter = "0x0000000000000000000000000000000000000000";
    donId = ethers.utils.formatBytes32String("local-don");
    subscriptionId = 1;
    log("WARNING: Using placeholder values for local development");
    log("Chainlink Functions is not available on local networks");
  } else if (chainId == 11155111) {
    // Sepolia testnet
    functionsRouter = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
    donId =
      "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000"; // "fun-ethereum-sepolia-1"
    subscriptionId = process.env.FUNCTIONS_SUBSCRIPTION_ID || 0;

    if (subscriptionId == 0) {
      log("WARNING: FUNCTIONS_SUBSCRIPTION_ID not set in .env");
      log("You'll need to create a subscription at functions.chain.link");
    }
  } else {
    functionsRouter = networkConfig[chainId]?.functionsRouter;
    donId = networkConfig[chainId]?.donId;
    subscriptionId = process.env.FUNCTIONS_SUBSCRIPTION_ID || 0;
  }

  // Load JavaScript source code
  const sourcePath = path.join(__dirname, "../scripts/functions-source.js");
  const source = fs.readFileSync(sourcePath, "utf8");

  // BetFactory configuration
  const minimumBetAmount = ethers.utils.parseEther("0.001"); // 0.001 ETH
  const serviceFeePercentage = 500; // 5% in basis points (500/10000 = 0.05)
  const gasLimit = 300000; // Gas limit for Functions callback
  const treasury = deployer; // Use deployer as treasury for now

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  const args = [
    minimumBetAmount,
    serviceFeePercentage,
    functionsRouter,
    donId,
    subscriptionId,
    gasLimit,
    source,
    treasury,
  ];

  log("----------------------------------------------------");
  log("Deploying BetFactory...");

  const betFactory = await deploy("BetFactory", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  log(`BetFactory deployed at ${betFactory.address}`);

  // Verify on Etherscan
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying on Etherscan...");
    await verify(betFactory.address, args);
  }

  log("----------------------------------------------------");
  log("BetFactory deployment complete!");
  log("");
  log("Configuration:");
  log(`  Minimum Bet: ${ethers.utils.formatEther(minimumBetAmount)} ETH`);
  log(`  Service Fee: ${serviceFeePercentage / 100}%`);
  log(`  Functions Router: ${functionsRouter}`);
  log(`  DON ID: ${donId}`);
  log(`  Subscription ID: ${subscriptionId}`);
  log(`  Gas Limit: ${gasLimit}`);
  log(`  Treasury: ${treasury}`);
  log("");
  log("IMPORTANT: Next Steps for Chainlink Functions:");
  log("  1. Create a subscription at https://functions.chain.link");
  log("  2. Fund the subscription with LINK tokens");
  log("  3. Add this contract as a consumer to your subscription");
  log("  4. Set FUNCTIONS_SUBSCRIPTION_ID in your .env file");
  log("  5. Call updateFunctionsConfig() if you need to update settings");
  log("");
  log("Contract Functions:");
  log("  - createBet(): Create a new bet");
  log("  - acceptBet(): Accept an existing bet");
  log(
    "  - checkBet(): Manually check and resolve a bet (calls Chainlink Functions)"
  );
  log("  - cancelExpiredBet(): Cancel bet if not accepted by deadline");
  log("  - getActiveBets(): View all active bets");
  log("  - getAcceptedBets(): View all accepted bets");
  log("  - getUserBets(): View bets for a specific user");
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "betfactory", "main"];
