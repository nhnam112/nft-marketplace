/* pages/index.js */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { createSigner } from '../services/provider';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import client from '../services/apolloClient';

import {
  marketplaceAddress
} from '../config';

import NFTMarketplace from '../abis/NFTMarketplace.json';

// GraphQL query to get unsold market items
const GET_UNSOLD_NFTS = gql`
  query {
    marketItems(where: { sold: false }) {
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

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  // Use Apollo Client to fetch market items
  const { data, loading, error } = useQuery(GET_UNSOLD_NFTS, {
    client,
  });
  
  useEffect(() => {
    if (data) {
      loadNFTs(data.marketItems);
    }
  }, [data]);

  async function loadNFTs(marketItems) {
    const items = await Promise.all(
      marketItems.map(async (item) => {
        const tokenURI = await fetchTokenURI(item.tokenId);
        const meta = await fetchMetadata(tokenURI);
        let price = ethers.formatUnits(item.price.toString(), 'ether');
        return {
          price,
          tokenId: item.tokenId,
          seller: item.seller,
          owner: item.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
      })
    );

    setNfts(items);
    setLoadingState('loaded');
  }

  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const signer = await createSigner();
    if (!signer) {
      return;
    }
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer);

    /* user will be prompted to pay the asking price to complete the transaction */
    const price = ethers.parseUnits(nft.price.toString(), 'ether');   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    });
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>);

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} alt="NFT" />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
