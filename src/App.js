import './App.css';
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Home from './components/Index';
import CreateNFT from './components/CreateNFT';
import MyNFTs from './components/MyNFTs';
import Dashboard from './components/Dashboard';
import WalletConnect from "./components/ConnectWallet";

function App() {
  return (
    <div>
    <nav className="border-b p-6">
      <p className="text-4xl font-bold">NFT Marketplace</p>
      <div className="flex mt-4">
        <Link to="/" className="mr-4 text-pink-500">Home</Link>
        <Link to="/create-nft" className="mr-6 text-pink-500">Create NFT</Link>
        <Link to="/my-nfts" className="mr-6 text-pink-500">My NFTs</Link>
        <Link to="/dashboard" className="mr-6 text-pink-500">Dashboard</Link>
      </div>
      <WalletConnect />
    </nav>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-nft" element={<CreateNFT />} />
      <Route path="/my-nfts" element={<MyNFTs />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </div>
  );
}

export default App;