/**
 * View bet details and status
 */

const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x5334EE52CE87a20cdB14bBC6D9eaA8671FE23046";
  const BET_ID = process.env.BET_ID || 0;

  console.log("\n📊 Viewing Bet Details\n");
  console.log("═".repeat(80));

  const betFactory = await ethers.getContractAt("BetFactory", CONTRACT_ADDRESS);

  const [bet, title, creatorApi, acceptorApi] =
    await betFactory.getBetDetails(BET_ID);

  const statuses = ["Active", "Accepted", "Resolved", "Cancelled"];

  console.log("\n🎲 Bet #" + BET_ID);
  console.log("  Title:", title);
  console.log("  Status:", statuses[bet.status]);
  console.log("\n👥 Participants:");
  console.log("  Creator:", bet.creator);
  console.log(
    "  Acceptor:",
    bet.acceptor === ethers.constants.AddressZero ? "None" : bet.acceptor
  );
  console.log("\n💰 Amounts:");
  console.log(
    "  Creator Bet:",
    ethers.utils.formatEther(bet.creatorAmount),
    "ETH"
  );
  console.log(
    "  Acceptor Bet:",
    ethers.utils.formatEther(bet.acceptorAmount),
    "ETH"
  );
  console.log(
    "  Total Pot:",
    ethers.utils.formatEther(bet.creatorAmount.add(bet.acceptorAmount)),
    "ETH"
  );
  console.log("\n🎯 Target:");
  console.log(
    "  Target Value:",
    (bet.targetValue.toNumber() / 100).toFixed(0),
    "articles"
  );
  console.log("\n📅 Dates:");
  console.log(
    "  Accept By:",
    new Date(bet.acceptByDate.toNumber() * 1000).toLocaleString()
  );
  console.log(
    "  Expiration:",
    new Date(bet.expirationDate.toNumber() * 1000).toLocaleString()
  );
  console.log("\n🌐 API URLs:");
  console.log("  Creator:", creatorApi.substring(0, 80) + "...");

  if (bet.status === 2) {
    console.log("\n🏆 WINNER:", bet.winner);
    console.log(
      "  Payout:",
      ethers.utils.formatEther(bet.creatorAmount.add(bet.acceptorAmount)),
      "ETH"
    );
  }

  console.log("\n🔗 View on Etherscan:");
  console.log(`  https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);

  console.log("\n═".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
