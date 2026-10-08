import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { config } from '../config/env';

console.log('[Apollo Client] Connecting to:', config.graphqlUrl);

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, path }) =>
      console.warn(
        `[GraphQL error]: Operation: ${operation.operationName}, Message: ${message}, Path: ${JSON.stringify(path)}`
      )
    );
  } else {
    console.warn(
      `[Network/General error]: Failed connecting to ${config.graphqlUrl} (${operation.operationName}):`,
      error
    );
  }
});

const httpLink = new HttpLink({
  uri: () => config.graphqlUrl,
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

