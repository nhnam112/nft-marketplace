/* pages/dashboard.js */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import client from '../services/apolloClient';
import axios from 'axios';

// GraphQL query to get market items listed by the current seller
const GET_LISTED_NFTS = gql`
  query($seller: Bytes!) {
    marketItems(where: { sold: false, seller: $seller }) {
      id
      tokenId
      tokenURI
      seller
      owner
      price
      sold
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    loadNFTs();
  }, []);
  
  async function loadNFTs() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const ownerAddress = accounts[0];
      if (!ownerAddress) {
        return;
      }

      setIsConnected(true);
      // Query the subgraph for NFTs listed by the current user
      const { data, loading, error } = await client.query({
        query: GET_LISTED_NFTS,
        variables: { seller: ownerAddress.toLowerCase() },
      });

      if (loading) {
        setLoadingState('loading');
        return;
      }

      if (error) {
        console.error("Error fetching NFTs:", error);
        setLoadingState('error');
        return;
      }

      // Fetch metadata for each listed NFT
      const items = await Promise.all(
        data.marketItems.map(async (item) => {
          const tokenURI = item.tokenURI;
          const meta = await axios.get(tokenURI);
          let price = ethers.formatUnits(item.price.toString(), 'ether');
          return {
            price,
            tokenId: item.tokenId,
            seller: item.seller,
            owner: item.owner,
            image: meta.image,
          };
        })
      );

      setNfts(items);
      setLoadingState('loaded');
    } catch(error) {
      console.error("Error while interacting with MetaMask or loading NFTs:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  }
  
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>);
  
  return (
    <div>
      <div className="p-4">
        {errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (isConnected ? (
              <h2 className="text-2xl py-2">Items Listed</h2>
            ) : (
              <h2 className="text-2xl py-2">Not Logged In</h2>
            )
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" alt="NFT" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
