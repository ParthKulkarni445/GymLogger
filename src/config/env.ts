import Constants from 'expo-constants';

function getGraphqlUrl(): string {
  // In development, hostUri is the host/IP where Metro is serving the bundle.
  // This ensures physical devices and emulators connect to the computer's current IP automatically.
  const hostUri = Constants.expoConfig?.hostUri;
  const metroHost = hostUri ? hostUri.split(':')[0] : null;

  if (metroHost) {
    return `http://${metroHost}:4000/graphql`;
  }

  if (process.env.EXPO_PUBLIC_GRAPHQL_URL) {
    return process.env.EXPO_PUBLIC_GRAPHQL_URL;
  }

  return 'http://localhost:4000/graphql';
}

export const config = {
  get graphqlUrl() {
    return getGraphqlUrl();
  },
} as const;

