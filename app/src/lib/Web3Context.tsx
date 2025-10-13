"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import web3 from "./web3";
import detectEthereumProvider from "@metamask/detect-provider";

interface Web3ContextType {
  account: string | null;
  isAuthenticated: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  isAuthenticated: false,
  connect: async () => {},
  disconnect: () => {},
  chainId: null,
});

export const useWeb3 = () => useContext(Web3Context);

const DISCONNECTED_KEY = "wallet_disconnected";

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkConnection();

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      // Check if user explicitly disconnected
      const wasDisconnected = localStorage.getItem(DISCONNECTED_KEY);
      if (wasDisconnected === "true") {
        return;
      }

      const provider = await detectEthereumProvider();
      if (provider) {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsAuthenticated(true);
          const id = await web3.eth.getChainId();
          setChainId(Number(id));
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const connect = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (!provider) {
        alert("Please install MetaMask to use this application");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsAuthenticated(true);
        const id = await web3.eth.getChainId();
        setChainId(Number(id));
        // Clear the disconnected flag when connecting
        localStorage.removeItem(DISCONNECTED_KEY);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsAuthenticated(false);
    setChainId(null);
    // Set flag to prevent auto-reconnection
    localStorage.setItem(DISCONNECTED_KEY, "true");
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    // Check if user explicitly disconnected
    const wasDisconnected = localStorage.getItem(DISCONNECTED_KEY);

    if (accounts.length > 0) {
      // Only update if not explicitly disconnected or if accounts changed (wallet switch)
      if (wasDisconnected !== "true" || (account && accounts[0] !== account)) {
        setAccount(accounts[0]);
        setIsAuthenticated(true);
        // Clear disconnected flag when account changes (wallet switch)
        localStorage.removeItem(DISCONNECTED_KEY);
        // Update chainId
        try {
          const id = await web3.eth.getChainId();
          setChainId(Number(id));
        } catch (error) {
          console.error("Error getting chain ID:", error);
        }
      }
    } else {
      // User disconnected from MetaMask
      disconnect();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        isAuthenticated,
        connect,
        disconnect,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
