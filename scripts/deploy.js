const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();

  console.log("nftMarketplace deployed to:", nftMarketplace.target);

  fs.writeFileSync('./src/config.js', `
  export const marketplaceAddress = "${nftMarketplace.target}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });