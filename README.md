Step to prepare environment
#1. Start The Graph docker
// Go to ./graph-node/docker folder and run
docker-compose up

#2. Start Ganache
// Bind ganache to port 0.0.0.0 and -d to preserve the blockchain data, -i 5777 is the block chain id
ganache-cli -h 0.0.0.0 -d -i 5777 --db ./ganache_data

#3. Deploy the contract
// Deploy the contract in network ganache
npx hardhat run --network ganache scripts/deploy.js

#4. Init The Graphql
// Change header in file ./graph-node/docker/data/ipfs/config
// "Access-Control-Allow-Origin": ["*"],
// "Access-Control-Allow-Methods": ["PUT", "POST", "GET"],
// "Access-Control-Allow-Headers": ["Authorization", "Content-Type"]
graph codegen && graph build
graph create --node http://localhost:8020/ nhnam112/nft-marketplace
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001/

#5. Start the app
npm start