/* pages/dashboard.js */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { createSigner } from '../services/provider';
import { gql } from '@apollo/client';
import client from '../services/apolloClient';

// GraphQL query to get market items listed by the current seller
const GET_LISTED_NFTS = gql`
  query($seller: Bytes!) {
    marketItems(where: { sold: false, seller: $seller }) {
      id
      tokenId
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
  
  useEffect(() => {
    loadNFTs();
  }, []);
  
  async function loadNFTs() {
    const signer = await createSigner();
    if (!signer) {
      return;
    }

    const ownerAddress = await signer.getAddress();

    // Query the subgraph for NFTs listed by the current user
    const { data, loading, error } = await client.query({
      query: GET_LISTED_NFTS,
      variables: { seller: ownerAddress.toLowerCase() }, // Convert to lowercase if needed
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
        const tokenURI = await fetchTokenURI(item.tokenId);
        const meta = await fetchMetadata(tokenURI);
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
  }
  
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>);
  
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Listed</h2>
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
