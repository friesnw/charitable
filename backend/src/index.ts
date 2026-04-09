import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { runMigrations } from './db.js';
import { env } from './env.js';
import { verifyToken, Context } from './auth.js';
import analyticsRoutes from './routes/analytics.js';


const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function main() {
  await runMigrations();
  await server.start();

  app.use('/api', cors(), express.json(), analyticsRoutes);

  app.get('/.well-known/apollo/server-health', (_req, res) => {
    res.status(200).json({ status: 'pass' });
  });

  app.get('/api/favicon', cors(), async (req, res) => {
    const domain = req.query.domain as string;
    if (!domain) { res.status(400).json({ error: 'domain required' }); return; }
    try {
      const upstream = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`);
      if (!upstream.ok) { res.status(502).json({ error: 'upstream failed' }); return; }
      const contentType = upstream.headers.get('content-type') ?? 'image/png';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.send(buffer);
    } catch {
      res.status(502).json({ error: 'favicon fetch failed' });
    }
  });

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

  app.listen(env.PORT, () => {
    console.log(`Server ready at http://localhost:${env.PORT}/graphql`);
  });
}

main().catch(console.error);
