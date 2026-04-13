/**
 * Geocode charity_locations rows that are missing lat/lng using Nominatim
 * (OpenStreetMap). Free, no API key required — rate-limited to 1 req/sec.
 *
 * Only updates rows where latitude IS NULL or longitude IS NULL.
 *
 * Usage:
 *   cd backend && npx tsx scripts/geocode-locations.ts
 *
 * Dry run (print what would be updated, no writes):
 *   cd backend && npx tsx scripts/geocode-locations.ts --dry-run
 *
 * Single location by ID:
 *   cd backend && npx tsx scripts/geocode-locations.ts --id 42
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { getDatabaseConfig } from '../src/env.js';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const idArg = args.includes('--id') ? Number(args[args.indexOf('--id') + 1]) : null;

// ---------------------------------------------------------------------------
// DB
// ---------------------------------------------------------------------------

const pool = new Pool(getDatabaseConfig());

// ---------------------------------------------------------------------------
// Nominatim
// ---------------------------------------------------------------------------

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

async function geocode(address: string): Promise<{ lat: number; lng: number; display: string } | null> {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
    countrycodes: 'us',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      // Nominatim requires a meaningful User-Agent identifying your app
      'User-Agent': 'GoodLocal/1.0 (goodlocal.org)',
    },
  });

  if (!res.ok) {
    console.error(`  Nominatim error ${res.status} for: ${address}`);
    return null;
  }

  const results = (await res.json()) as NominatimResult[];
  if (!results.length) return null;

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    display: results[0].display_name,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface LocationRow {
  id: number;
  label: string;
  address: string;
  charity_name: string;
}

async function main() {
  const whereClause = idArg
    ? 'l.id = $1'
    : '(l.latitude IS NULL OR l.longitude IS NULL) AND l.address IS NOT NULL';

  const queryParams = idArg ? [idArg] : [];

  const { rows } = await pool.query<LocationRow>(
    `SELECT l.id, l.label, l.address, c.name AS charity_name
     FROM charity_locations l
     JOIN charities c ON c.id = l.charity_id
     WHERE ${whereClause}
     ORDER BY c.name, l.id`,
    queryParams,
  );

  if (!rows.length) {
    console.log('No locations need geocoding.');
    await pool.end();
    return;
  }

  console.log(`Found ${rows.length} location(s) to geocode${dryRun ? ' (dry run)' : ''}\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const loc = rows[i];
    console.log(`[${i + 1}/${rows.length}] ${loc.charity_name} — ${loc.label}`);
    console.log(`  Address: ${loc.address}`);

    const result = await geocode(loc.address);

    if (!result) {
      console.log(`  ✗ No result found\n`);
      failed++;
    } else {
      console.log(`  → ${result.lat}, ${result.lng}`);
      console.log(`  → ${result.display}`);

      if (!dryRun) {
        await pool.query(
          'UPDATE charity_locations SET latitude = $1, longitude = $2 WHERE id = $3',
          [result.lat, result.lng, loc.id],
        );
        console.log(`  ✓ Updated\n`);
        updated++;
      } else {
        console.log(`  (dry run — no write)\n`);
      }
    }

    // Nominatim rate limit: 1 request per second
    if (i < rows.length - 1) await sleep(1100);
  }

  console.log(`Done. ${updated} updated, ${failed} failed.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
