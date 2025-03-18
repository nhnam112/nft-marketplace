/* test/sample-test.js */
describe("NFTMarket", function() {
    it("Should create and execute market sales", async function() {
      // Deploy the marketplace contract
      const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
      const nftMarketplace = await NFTMarketplace.deploy();
  
      // Get listing price
      let listingPrice = await nftMarketplace.getListingPrice();
      listingPrice = listingPrice.toString();
  
      // Set auction price
      const auctionPrice = ethers.parseUnits('1', 'ether');
  
      // Create two tokens
      await nftMarketplace.createToken("https://www.mytokenlocation.com", auctionPrice, { value: listingPrice });
      await nftMarketplace.createToken("https://www.mytokenlocation2.com", auctionPrice, { value: listingPrice });
  
      const [_, buyerAddress] = await ethers.getSigners();
  
      // Execute sale of token to another user
      await nftMarketplace.connect(buyerAddress).createMarketSale(1, { value: auctionPrice });
  
      // Resell a token
      await nftMarketplace.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice });
  
      // Query for and return the unsold items
      let items = await nftMarketplace.fetchMarketItems();
      items = await Promise.all(items.map(async i => {
        const tokenUri = await nftMarketplace.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri
        };
        return item;
      }));
  
      console.log('items: ', items);
    });
  });