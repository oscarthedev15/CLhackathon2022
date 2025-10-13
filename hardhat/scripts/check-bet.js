/**
 * Check and resolve a News API bet
 *
 * This triggers Chainlink Functions to fetch the news data and resolve the bet
 */

const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x5334EE52CE87a20cdB14bBC6D9eaA8671FE23046";
  const BET_ID = process.env.BET_ID || 0;

  console.log("\n🔍 Checking News Bet on Sepolia\n");
  console.log("═".repeat(80));

  const [signer] = await ethers.getSigners();
  console.log("👤 Caller:", signer.address);

  const betFactory = await ethers.getContractAt("BetFactory", CONTRACT_ADDRESS);

  // Get bet details
  const [bet, title, creatorApi, acceptorApi] =
    await betFactory.getBetDetails(BET_ID);

  console.log("\n📊 Bet Details:");
  console.log("  Title:", title);
  console.log("  Creator:", bet.creator);
  console.log("  Acceptor:", bet.acceptor);
  console.log(
    "  Status:",
    ["Active", "Accepted", "Resolved", "Cancelled"][bet.status]
  );
  console.log("  Target Value:", bet.targetValue.toString());
  console.log(
    "  Creator Amount:",
    ethers.utils.formatEther(bet.creatorAmount),
    "ETH"
  );
  console.log(
    "  Acceptor Amount:",
    ethers.utils.formatEther(bet.acceptorAmount),
    "ETH"
  );
  console.log("  API URL:", creatorApi);

  if (bet.status != 1) {
    console.log("\n⚠️  Bet must be in 'Accepted' status to check");
    return;
  }

  console.log("\n🚀 Sending Chainlink Functions request...");

  const tx = await betFactory.checkBet(BET_ID, {
    gasLimit: 500000,
  });

  console.log("⏳ Transaction sent:", tx.hash);
  const receipt = await tx.wait();

  const event = receipt.events?.find((e) => e.event === "OracleRequestSent");
  if (event) {
    const requestId = event.args.requestId;
    console.log("✅ Chainlink Functions request sent!");
    console.log("📝 Request ID:", requestId);
  }

  console.log("\n🔗 View on Etherscan:");
  console.log(`  https://sepolia.etherscan.io/tx/${tx.hash}`);

  console.log("\n⏳ Waiting for Chainlink Functions response...");
  console.log("  This usually takes 1-2 minutes");
  console.log("\n📊 Monitor on Functions UI:");
  console.log("  https://functions.chain.link/sepolia/5735");

  console.log("\n💡 To check if bet is resolved:");
  console.log(`  npx hardhat run scripts/view-bet.js --network sepolia`);

  console.log("\n═".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
