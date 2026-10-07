import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { config } from '../config/env';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: config.graphqlUrl }),
  cache: new InMemoryCache(),
});
