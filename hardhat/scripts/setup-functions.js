/**
 * One-time setup script to configure Chainlink Functions
 *
 * Run this script when:
 * 1. First deploying the contract
 * 2. Updating the JavaScript source code
 * 3. Changing Chainlink Functions configuration
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const CONTRACT_ADDRESS = "0x5334EE52CE87a20cdB14bBC6D9eaA8671FE23046";

  console.log("\n⚙️  Chainlink Functions Setup\n");
  console.log("═".repeat(80));

  const [signer] = await ethers.getSigners();
  console.log("👤 Signer:", signer.address);

  const betFactory = await ethers.getContractAt("BetFactory", CONTRACT_ADDRESS);

  // Read the JavaScript source code
  const sourcePath = path.join(__dirname, "functions-news-api.js");
  const sourceCode = fs.readFileSync(sourcePath, "utf8");

  console.log("\n📝 JavaScript Source Code:");
  console.log("─".repeat(80));
  console.log(sourceCode);
  console.log("─".repeat(80));

  console.log("\n📤 Updating contract configuration...");

  // Get current config
  const donId = await betFactory.donId();
  const subscriptionId = await betFactory.subscriptionId();
  const gasLimit = await betFactory.gasLimit();

  console.log("\n📊 Current Configuration:");
  console.log("  DON ID:", donId);
  console.log("  Subscription ID:", subscriptionId.toString());
  console.log("  Gas Limit:", gasLimit.toString());

  // Update the source code
  const tx = await betFactory.updateFunctionsConfig(
    donId,
    subscriptionId,
    gasLimit,
    sourceCode
  );

  console.log("\n⏳ Transaction sent:", tx.hash);
  await tx.wait();

  console.log("\n✅ CHAINLINK FUNCTIONS CONFIGURED!");
  console.log("═".repeat(80));
  console.log("\n🔗 View on Etherscan:");
  console.log(`  https://sepolia.etherscan.io/tx/${tx.hash}`);

  console.log("\n📋 Next: Create bets using the configured source code");
  console.log("  npx hardhat run scripts/create-news-bet.js --network sepolia");

  console.log("\n═".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
