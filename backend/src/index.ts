import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { runMigrations } from './db.js';
import { env } from './env.js';
import { verifyToken, Context } from './auth.js';

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function main() {
  await runMigrations();
  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        // Extract JWT from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          return { user: null };
        }

        const token = authHeader.slice(7); // Remove 'Bearer '
        const user = verifyToken(token);
        return { user };
      },
    })
  );

  // Health check
  app.get('/health', (_req, res) => {
    res.send('OK');
  });

  app.listen(env.PORT, () => {
    console.log(`Server ready at http://localhost:${env.PORT}/graphql`);
  });
}

main().catch(console.error);
