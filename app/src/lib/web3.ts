import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

// Use Sepolia instead of Kovan (Kovan is deprecated)
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

// Create a placeholder web3 instance (will be replaced when provider is detected)
let web3: Web3;

if (typeof window !== "undefined" && window.ethereum) {
  web3 = new Web3(window.ethereum);

  (async () => {
    const provider = (await detectEthereumProvider()) as any;
    if (provider) {
      web3 = new Web3(Web3.givenProvider as any);
      const chainId = (await provider.request({
        method: "eth_chainId",
      })) as string;

      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          // Try to switch to Sepolia
          await window.ethereum?.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (error: any) {
          // If Sepolia is not added, add it
          if (error.code === 4902) {
            try {
              await window.ethereum?.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: SEPOLIA_CHAIN_ID,
                    chainName: "Sepolia Testnet",
                    nativeCurrency: {
                      name: "Sepolia ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc.sepolia.org"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
            } catch (addError) {
              console.error(addError);
            }
          }
          console.error(error);
        }
      }

      provider.on("chainChanged", handleChainChanged);
    }
  })();
} else {
  // Server-side: create a minimal instance (won't be used for actual transactions)
  web3 = new Web3();
}

async function handleChainChanged(_chainId: string) {
  if (_chainId !== SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum?.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum?.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  } else {
    web3 = new Web3(Web3.givenProvider as any);
  }
  window.location.reload();
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default web3;
