/* pages/resell-nft.js */
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from 'axios';
import { createSigner } from '../services/provider';

import {
  marketplaceAddress
} from '../config';

import NFTMarketplace from '../abis/NFTMarketplace.json';

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const tokenURI = searchParams.get("tokenURI");
  const { image, price } = formInput;

  useEffect(() => {
    fetchNFT();
  }, [id]);

  async function fetchNFT() {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI);
    updateFormInput(state => ({ ...state, image: meta.data.image }));
  }

  async function listNFTForSale() {
    if (!price) return;
    const signer = await createSigner();
    if (!signer) {
      return;
    }

    const priceFormatted = ethers.parseUnits(formInput.price, 'ether');
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer);
    let listingPrice = await contract.getListingPrice();

    listingPrice = listingPrice.toString();
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice });
    await transaction.wait();

    navigate("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          image && (
            <img className="rounded mt-4" width="350" src={image} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          List NFT
        </button>
      </div>
    </div>
  );
}
