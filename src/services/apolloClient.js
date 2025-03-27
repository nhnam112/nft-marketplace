// services/apolloClient.js
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8000/subgraphs/name/nhnam112/nft-marketplace',
  cache: new InMemoryCache(),
});

export default client;
