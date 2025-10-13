/**
 * Create a News API bet on Sepolia
 *
 * This script creates a bet that checks if certain keywords appear in news headlines
 */

const { ethers } = require("hardhat");

async function main() {
  // Configuration
  const CONTRACT_ADDRESS = "0x5334EE52CE87a20cdB14bBC6D9eaA8671FE23046";

  // Bet parameters
  const SEARCH_QUERY = "trump AND israel"; // News API search query
  const TARGET_ARTICLES = 100; // Number of articles needed to win (will be divided by 100 in contract)
  const BET_AMOUNT = ethers.utils.parseEther("0.001"); // 0.001 ETH (actual bet after fees)
  const ACCEPTOR_AMOUNT = ethers.utils.parseEther("0.001"); // 0.001 ETH
  const ACCEPT_BY_HOURS = 24; // 24 hours to accept
  const EXPIRATION_HOURS = 168; // 7 days to resolve

  // Calculate total amount to send (bet + 5% service fee)
  // Formula: total = bet / (1 - fee%) = bet / 0.95
  const TOTAL_TO_SEND = BET_AMOUNT.mul(10000).div(9500); // Add 5% for service fee

  console.log("\n🎲 Creating News API Bet on Sepolia\n");
  console.log("═".repeat(80));

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("📝 Creator:", signer.address);

  const balance = await signer.getBalance();
  console.log("💰 Balance:", ethers.utils.formatEther(balance), "ETH");

  // Get contract
  const betFactory = await ethers.getContractAt("BetFactory", CONTRACT_ADDRESS);

  // Calculate dates using blockchain timestamp
  const latestBlock = await ethers.provider.getBlock("latest");
  const now = latestBlock.timestamp;
  const acceptByDate = now + ACCEPT_BY_HOURS * 3600;
  const expirationDate = now + EXPIRATION_HOURS * 3600;

  console.log("\n📰 Bet Details:");
  console.log("  Search Query:", SEARCH_QUERY);
  console.log("  Target Articles:", TARGET_ARTICLES / 100, "articles");
  console.log(
    "  Bet Amount (after fee):",
    ethers.utils.formatEther(BET_AMOUNT),
    "ETH"
  );
  console.log(
    "  Total Sending (with 5% fee):",
    ethers.utils.formatEther(TOTAL_TO_SEND),
    "ETH"
  );
  console.log("  Accept By:", new Date(acceptByDate * 1000).toLocaleString());
  console.log(
    "  Expiration:",
    new Date(expirationDate * 1000).toLocaleString()
  );

  console.log("\n📤 Creating bet...");

  // Create the bet
  // API URL format for News API (with API key included)
  const NEWS_API_KEY = process.env.NEWS_API_KEY;

  if (!NEWS_API_KEY) {
    console.error("\n❌ ERROR: NEWS_API_KEY environment variable not set!");
    console.error("   Please set it before running this script:");
    console.error("   export NEWS_API_KEY=your_api_key_here\n");
    process.exit(1);
  }

  const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(SEARCH_QUERY)}&apiKey=${NEWS_API_KEY}&pageSize=1`;

  console.log("  API URL:", apiUrl.substring(0, 80) + "...");

  const tx = await betFactory.createBet(
    `News Bet: "${SEARCH_QUERY}" in headlines`,
    apiUrl,
    ACCEPTOR_AMOUNT,
    TARGET_ARTICLES,
    acceptByDate,
    expirationDate,
    {
      value: TOTAL_TO_SEND, // Send bet amount + service fee
      gasLimit: 500000,
    }
  );

  console.log("⏳ Transaction sent:", tx.hash);
  const receipt = await tx.wait();

  // Get bet ID from event
  const event = receipt.events?.find((e) => e.event === "BetCreated");
  const betId = event.args.betId;

  console.log("\n✅ BET CREATED SUCCESSFULLY!");
  console.log("═".repeat(80));
  console.log("\n📊 Bet Information:");
  console.log("  Bet ID:", betId.toString());
  console.log("  Contract:", CONTRACT_ADDRESS);
  console.log("  Transaction:", tx.hash);
  console.log("  Block:", receipt.blockNumber);

  console.log("\n🔗 View on Etherscan:");
  console.log(`  https://sepolia.etherscan.io/tx/${tx.hash}`);
  console.log(`  https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);

  console.log("\n📋 Next Steps:");
  console.log("  1. Wait for someone to accept your bet");
  console.log(`     - Use another wallet to accept the bet`);
  console.log("\n  2. Check the bet result");
  console.log(
    `     - BET_ID=${betId} npx hardhat run scripts/check-bet.js --network sepolia`
  );

  console.log("\n═".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
