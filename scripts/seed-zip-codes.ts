/**
 * Seed script: populate the zip_codes table from the simplemaps US ZIP code CSV.
 *
 * Usage:
 *   1. Download the free CSV from https://simplemaps.com/data/us-zips
 *      (file: uszips.csv — free basic database)
 *   2. Place it at scripts/uszips.csv
 *   3. Run against local DB:
 *        npx tsx scripts/seed-zip-codes.ts
 *   4. Run against a Render DB:
 *        DATABASE_URL=<render-url> npx tsx scripts/seed-zip-codes.ts
 *
 * The table must already exist (migration 013 creates it).
 * Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
const CSV_PATH = path.join(__dirname, 'uszips.csv');

if (!fs.existsSync(CSV_PATH)) {
  console.error(`CSV not found at ${CSV_PATH}`);
  console.error('Download from https://simplemaps.com/data/us-zips and place at scripts/uszips.csv');
  process.exit(1);
}

const client = DATABASE_URL
  ? new pg.Client({ connectionString: DATABASE_URL })
  : new pg.Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? 'app_db',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
    });

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

async function main() {
  await client.connect();

  const rl = readline.createInterface({ input: fs.createReadStream(CSV_PATH), crlfDelay: Infinity });
  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  let isFirst = true;

  for await (const line of rl) {
    if (isFirst) {
      headers = parseCSVLine(line);
      isFirst = false;
      continue;
    }
    if (!line.trim()) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    rows.push(row);
  }

  console.log(`Seeding ${rows.length} zip codes...`);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const params: unknown[] = [];
    const placeholders = batch.map((row, idx) => {
      const base = idx * 5;
      params.push(
        row['zip'],
        row['city'],
        row['state_id'],
        parseFloat(row['lat']),
        parseFloat(row['lng'])
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    });

    await client.query(
      `INSERT INTO zip_codes (zip, city, state, latitude, longitude)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT (zip) DO NOTHING`,
      params
    );
    inserted += batch.length;
    process.stdout.write(`\r${inserted}/${rows.length}`);
  }

  console.log('\nDone.');
  await client.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
