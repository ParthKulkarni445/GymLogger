const DEFAULT_GRAPHQL_URL = 'http://localhost:4000/graphql';

export const config = {
  graphqlUrl: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? DEFAULT_GRAPHQL_URL,
} as const;
