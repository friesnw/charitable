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
  const migrate = nodePgMigrate.default || nodePgMigrate;

  await migrate({
    databaseUrl: dbConfig,
    dir: path.join(__dirname, '../migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: () => {},
  });

  console.log('Migrations complete');
}
