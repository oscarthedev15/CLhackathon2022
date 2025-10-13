/**
 * Accept a bet
 * Note: You should use a DIFFERENT wallet than the creator to accept
 */

const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x5334EE52CE87a20cdB14bBC6D9eaA8671FE23046";
  const BET_ID = process.env.BET_ID || 0;

  console.log("\n🤝 Accepting Bet on Sepolia\n");
  console.log("═".repeat(80));

  const [signer] = await ethers.getSigners();
  console.log("👤 Acceptor:", signer.address);

  const betFactory = await ethers.getContractAt("BetFactory", CONTRACT_ADDRESS);

  // Get bet details
  const bet = await betFactory.getBet(BET_ID);

  if (bet.creator === signer.address) {
    console.log("\n⚠️  WARNING: You are the creator of this bet!");
    console.log("   It's better to use a different wallet to accept.");
    console.log("   But continuing anyway for testing...\n");
  }

  console.log("\n📊 Bet Details:");
  console.log("  Creator:", bet.creator);
  console.log(
    "  Required Amount:",
    ethers.utils.formatEther(bet.acceptorAmount),
    "ETH"
  );

  // Calculate total amount (acceptor amount + 5% service fee)
  const SERVICE_FEE = 500; // 5% in basis points
  const totalAmount = bet.acceptorAmount.add(
    bet.acceptorAmount.mul(SERVICE_FEE).div(10000)
  );

  console.log(
    "  Service Fee (5%):",
    ethers.utils.formatEther(totalAmount.sub(bet.acceptorAmount)),
    "ETH"
  );
  console.log("  Total to Send:", ethers.utils.formatEther(totalAmount), "ETH");

  const balance = await signer.getBalance();
  console.log("\n💰 Your Balance:", ethers.utils.formatEther(balance), "ETH");

  if (balance.lt(totalAmount)) {
    console.log("\n❌ Insufficient balance!");
    return;
  }

  console.log("\n📤 Accepting bet...");

  // API URL for acceptor
  const SEARCH_QUERY = "trump AND israel"; // Match the creator's query
  const NEWS_API_KEY = process.env.NEWS_API_KEY;

  if (!NEWS_API_KEY) {
    console.error("\n❌ ERROR: NEWS_API_KEY environment variable not set!");
    console.error("   Please set it before running this script:");
    console.error("   export NEWS_API_KEY=your_api_key_here\n");
    process.exit(1);
  }

  const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(SEARCH_QUERY)}&apiKey=${NEWS_API_KEY}&pageSize=1`;

  const tx = await betFactory.acceptBet(BET_ID, apiUrl, {
    value: totalAmount,
    gasLimit: 300000,
  });

  console.log("⏳ Transaction sent:", tx.hash);
  const receipt = await tx.wait();

  console.log("\n✅ BET ACCEPTED SUCCESSFULLY!");
  console.log("═".repeat(80));
  console.log("\n🔗 View on Etherscan:");
  console.log(`  https://sepolia.etherscan.io/tx/${tx.hash}`);

  console.log("\n📋 Next Step - Test Chainlink Functions:");
  console.log(
    `  BET_ID=${BET_ID} npx hardhat run scripts/check-bet.js --network sepolia`
  );

  console.log("\n═".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
