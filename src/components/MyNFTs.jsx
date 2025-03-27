/* pages/my-nfts.js */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createSigner } from '../services/provider';
import { gql } from '@apollo/client';
import client from '../services/apolloClient';

// GraphQL query to get NFTs owned by a specific address
const GET_NFTS_BY_OWNER = gql`
  query($owner: Bytes!) {
    marketItems(where: { owner: $owner }) {
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

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const navigate = useNavigate();
  
  useEffect(() => {
    loadNFTs();
  }, []);
  
  async function loadNFTs() {
    const signer = await createSigner();
    if (!signer) {
      return;
    }

    const ownerAddress = await signer.getAddress();

    // Make a GraphQL query to fetch NFTs owned by the current address
    try {
      const { data } = await client.query({
        query: GET_NFTS_BY_OWNER,
        variables: { owner: ownerAddress.toLowerCase() }, // Ensure the address is in lowercase format
      });

      // Map over the data to retrieve metadata and format the items
      const items = await Promise.all(data.marketItems.map(async (item) => {
        // Fetch token URI metadata
        const tokenURI = item.tokenURI;
        const meta = await axios.get(tokenURI);
        let price = ethers.formatUnits(item.price.toString(), 'ether');
        
        return {
          price,
          tokenId: item.tokenId,
          seller: item.seller,
          owner: item.owner,
          image: meta.data.image,
          tokenURI
        };
      }));

      setNfts(items);
      setLoadingState('loaded');
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setLoadingState('error');
    }
  }
  
  function listNFT(nft) {
    navigate(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  }
  
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>);
  
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" alt="NFT" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
