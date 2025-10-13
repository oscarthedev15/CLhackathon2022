# Setup Guide

## Environment Variables

Before running the scripts, you need to set the following environment variables:

### Required

```bash
export NEWS_API_KEY=your_news_api_key_here
```

Get your free News API key at: https://newsapi.org/register

### Optional

If deploying or using a custom RPC:

```bash
export PRIVATE_KEY=your_private_key_here
export SEPOLIA_RPC_URL=your_infura_or_alchemy_url_here
```

## Available Scripts

### 0. Setup Chainlink Functions (One-Time Only)

Run this **once** after deployment or when updating JavaScript source code:

```bash
npx hardhat run scripts/setup-functions.js --network sepolia
```

### 1. Create a News Bet

```bash
NEWS_API_KEY=your_key npx hardhat run scripts/create-news-bet.js --network sepolia
```

### 2. Accept a Bet

```bash
BET_ID=0 NEWS_API_KEY=your_key npx hardhat run scripts/accept-bet.js --network sepolia
```

### 3. Check/Resolve a Bet (Triggers Chainlink Functions)

```bash
BET_ID=0 npx hardhat run scripts/check-bet.js --network sepolia
```

### 4. View Bet Details

```bash
BET_ID=0 npx hardhat run scripts/view-bet.js --network sepolia
```

## Quick Start

1. **Setup Chainlink Functions (One-Time)**

   ```bash
   npx hardhat run scripts/setup-functions.js --network sepolia
   ```

2. **Get News API Key**
   - Register at https://newsapi.org/register
   - Set environment variable:
     ```bash
     export NEWS_API_KEY=your_key_here
     ```

3. **Create a Bet**

   ```bash
   npx hardhat run scripts/create-news-bet.js --network sepolia
   ```

4. **Accept the Bet** (use different wallet or same for testing)

   ```bash
   BET_ID=0 npx hardhat run scripts/accept-bet.js --network sepolia
   ```

5. **Trigger Chainlink Functions to Resolve**

   ```bash
   BET_ID=0 npx hardhat run scripts/check-bet.js --network sepolia
   ```

6. **Wait ~90 seconds and View Result**
   ```bash
   BET_ID=0 npx hardhat run scripts/view-bet.js --network sepolia
   ```
