import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Function to connect to MetaMask
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }

  // Function to check if wallet is already connected
  async function checkWalletConnection() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    }
  }

  // Auto-check wallet connection on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <div className="flex justify-end p-4">
      {isConnected ? (
        <p className="text-green-500">Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}