import pg from 'pg';
import migrate from 'node-pg-migrate';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabaseConfig } from './env.js';

const { Pool } = pg;

const dbConfig = getDatabaseConfig();

export const pool = new Pool(dbConfig);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  console.log('Running migrations...');

  await migrate({
    databaseUrl: dbConfig,
    dir: path.join(__dirname, '../migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: () => {},
  });

  console.log('Migrations complete');
}
