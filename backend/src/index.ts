import { createYoga, createSchema } from 'graphql-yoga';
import { createServer } from 'node:http';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
});

const server = createServer(yoga);

server.listen(4000, '0.0.0.0', () => {
  console.log('GraphQL server running on port 4000 at /graphql');
});