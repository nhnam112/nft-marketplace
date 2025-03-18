// src/provider.js
import { ethers } from 'ethers';

/**
 * This function creates and returns an ethers Web3Provider connected to MetaMask.
 * @returns {ethers.providers.Web3Provider} The provider connected to MetaMask.
 */
export const createProvider = async () => {
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed!');
  }

  // Request account access if not granted
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Create a provider using the MetaMask provider (window.ethereum)
  const provider = new ethers.BrowserProvider(window.ethereum); // Corrected this line

  return provider;
};

/**
 * This function creates and returns a signer using the MetaMask account.
 * @returns {ethers.Signer} The signer connected to the MetaMask account.
 */
export const createSigner = async () => {
  const provider = await createProvider();
  const signer = provider.getSigner();
  return signer;
};
