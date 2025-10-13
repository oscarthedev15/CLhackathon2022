# TeaLink Frontend

This is the Next.js frontend for TeaLink, a decentralized news betting protocol on Ethereum.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Sepolia testnet ETH

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your configuration:

```
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
NEXT_PUBLIC_NEWS_API_KEY=your-news-api-key
```

3. Update the contract address in `/public/contracts/BetGame.json` with your deployed contract address on Sepolia.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Create Bets**: Create custom bets on future news events using keywords
- **Bet Marketplace**: Browse and accept open bets
- **Chainlink Oracle**: Uses Chainlink to verify news headlines via NewsAPI
- **Sepolia Testnet**: Deployed on Ethereum Sepolia testnet

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Material-UI** - UI components
- **Web3.js** - Ethereum interactions
- **Formik & Yup** - Form handling and validation

## Project Structure

```
app/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and configurations
│   │   ├── web3.ts      # Web3 setup
│   │   ├── betgame.ts   # Contract instance
│   │   ├── theme.ts     # MUI theme
│   │   └── Web3Context.tsx  # Web3 context provider
│   └── public/
│       └── contracts/   # Contract ABIs and addresses
```

## Learn More

To learn more about TeaLink, see the main project README.
