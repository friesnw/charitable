import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { runMigrations } from './db.js';
import { env } from './env.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function main() {
  await runMigrations();

  const { url } = await startStandaloneServer(server, {
    listen: { port: env.PORT },
  });

  console.log(`Server ready at ${url}`);
}

main().catch(console.error);
