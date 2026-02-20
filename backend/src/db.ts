import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabaseConfig } from './env.js';

const { Pool } = pg;

const dbConfig = getDatabaseConfig();

export const pool = new Pool(dbConfig);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  console.log('Running migrations...');

  // Dynamic import to handle ESM/CJS interop
  const nodePgMigrate = await import('node-pg-migrate');
  // tsx (dev) unwraps __esModule automatically; plain node (prod) does not,
  // so the runner may be at .default.default
  const mod = nodePgMigrate.default as any;
  const migrate = typeof mod === 'function' ? mod : mod.default;

  await migrate({
    databaseUrl: dbConfig,
    dir: path.join(__dirname, '../migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: () => {},
  });

  console.log('Migrations complete');
}
