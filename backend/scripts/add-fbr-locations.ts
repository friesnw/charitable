/**
 * Adds Food Bank of the Rockies partner locations from the FBR location finder PDF
 * (15-mile radius from 80210, exported March 2026).
 *
 * Skips locations already in the DB (Risen Christ, Cook Park), locations now
 * tracked as their own charities (IFCS, JFS), and delivery-only sites (FISH).
 *
 * Usage:
 *   npx tsx scripts/add-fbr-locations.ts
 *
 * Dry-run (geocode only, no DB writes):
 *   DRY_RUN=1 npx tsx scripts/add-fbr-locations.ts
 *
 * Against dev/prod:
 *   DATABASE_URL=<render-url> npx tsx scripts/add-fbr-locations.ts
 *
 * DELETE THIS SCRIPT after it has been run in all target environments.
 */

import { Pool } from 'pg';

const DRY_RUN = process.env.DRY_RUN === '1';

const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? 'app_db',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD,
    };

const FBR_SLUG = 'food-bank-of-the-rockies';

const LOCATIONS: { label: string; address: string; description: string }[] = [
  {
    label: 'University Church of Christ',
    address: '2000 S Milwaukee St, Denver, CO 80210',
    description: 'A southeast Denver church hosting a Food Bank of the Rockies partner pantry, providing groceries to neighborhood residents.',
  },
  {
    label: 'First Presbyterian Church of Englewood',
    address: '3500 S Logan St, Englewood, CO 80113',
    description: 'An Englewood church hosting a Food Bank of the Rockies partner pantry serving local residents with grocery staples.',
  },
  {
    label: 'Community Ministry of Southwest Denver',
    address: '1755 S Zuni St, Denver, CO 80223',
    description: 'Community Ministry of Southwest Denver hosts an Everyday Eats program through a Food Bank of the Rockies partnership, distributing groceries to adults 60 and older in the southwest Denver area.',
  },
  {
    label: 'Holly Ridge Primary Care',
    address: '3301 S Monaco St Pkwy, Denver, CO 80222',
    description: 'A primary care clinic in the Monaco neighborhood hosting a Food Bank of the Rockies Kids Meals & Snacks program for children.',
  },
  {
    label: 'Praise Center Church',
    address: '3105 W Florida Ave, Denver, CO 80219',
    description: 'A southwest Denver church hosting a Food Bank of the Rockies partner pantry for residents of the surrounding neighborhood.',
  },
  {
    label: 'Valverde Elementary Discovery Link',
    address: '2030 W Alameda Ave, Denver, CO 80223',
    description: 'An after-school program site in the Valverde neighborhood distributing Food Bank of the Rockies Kids Meals & Snacks for children.',
  },
  {
    label: 'DCIS Fairmont',
    address: '520 W 3rd Ave, Denver, CO 80223',
    description: 'A Denver public school in the Lincoln Park area hosting a Food Bank of the Rockies Kids Meals & Snacks program for students and families.',
  },
  {
    label: 'McMeen Elementary School',
    address: '100 S Holly St, Denver, CO 80246',
    description: 'A Denver public school in the Virginia Village neighborhood distributing Food Bank of the Rockies Kids Meals & Snacks for students and families.',
  },
  {
    label: 'Breakfree Inc.',
    address: '7667 E Iliff Ave Unit J, Denver, CO 80231',
    description: 'A recovery services organization in east Denver hosting a Food Bank of the Rockies partner pantry for community members.',
  },
  {
    label: 'Denver Green School',
    address: '6700 E Virginia Ave, Denver, CO 80224',
    description: 'A Denver public school hosting a Food Bank of the Rockies food pantry serving students and families in the Virginia Village neighborhood.',
  },
  {
    label: 'Dora Moore Elementary School',
    address: '846 N Corona St, Denver, CO 80218',
    description: 'A Denver public school in the Cheesman Park neighborhood distributing Food Bank of the Rockies Kids Meals & Snacks for students and families.',
  },
  {
    label: 'Boys & Girls Club — J. Churchill Owen',
    address: '3480 W Kentucky Ave, Denver, CO 80219',
    description: 'A Boys & Girls Club in southwest Denver offering a Food Bank of the Rockies summer meals program for youth in the community.',
  },
  {
    label: 'Faith Bible Chapel South',
    address: '4250 S Federal Blvd, Sheridan, CO 80110',
    description: 'A church in Sheridan hosting a Food Bank of the Rockies partner pantry for residents of the south metro area.',
  },
  {
    label: 'Metropolitan Community Church',
    address: '980 Clarkson St, Denver, CO 80218',
    description: 'A Capitol Hill church hosting a Food Bank of the Rockies partner pantry for central Denver residents.',
  },
];

async function geocode(address: string): Promise<{ latitude: number; longitude: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'GoodLocal/1.0 (charitable giving app)' } });
  if (!res.ok) {
    console.error(`  Geocode HTTP error ${res.status} for: ${address}`);
    return null;
  }
  const json = await res.json() as { lat: string; lon: string }[];
  if (!json.length) {
    console.error(`  No results for: ${address}`);
    return null;
  }
  return { latitude: parseFloat(json[0].lat), longitude: parseFloat(json[0].lon) };
}

async function main() {
  const pool = new Pool(DB_CONFIG as any);

  try {
    const { rows } = await pool.query<{ id: number }>(
      'SELECT id FROM charities WHERE slug = $1',
      [FBR_SLUG]
    );
    if (!rows.length) {
      console.error(`Charity not found: ${FBR_SLUG}`);
      process.exit(1);
    }
    const charityId = rows[0].id;
    console.log(`Found charity id=${charityId}\n`);

    // Get existing location addresses to avoid duplicates
    const existing = await pool.query<{ address: string }>(
      'SELECT address FROM charity_locations WHERE charity_id = $1',
      [charityId]
    );
    const existingAddresses = new Set(existing.rows.map(r => r.address.toLowerCase()));

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const loc of LOCATIONS) {
      if (existingAddresses.has(loc.address.toLowerCase())) {
        console.log(`SKIP (already exists): ${loc.label}`);
        skipped++;
        continue;
      }

      process.stdout.write(`Geocoding: ${loc.label} ... `);
      const coords = await geocode(loc.address);

      if (!coords) {
        console.log('SKIP (no coords)');
        failed++;
        continue;
      }

      console.log(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);

      if (!DRY_RUN) {
        await pool.query(
          `INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, is_sublocation)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [charityId, loc.label, loc.address, coords.latitude, coords.longitude, loc.description, true]
        );
      }

      inserted++;
      // Nominatim requires max 1 req/sec
      await new Promise(r => setTimeout(r, 1100));
    }

    console.log(`\n${DRY_RUN ? '[DRY RUN] Would insert' : 'Inserted'} ${inserted} locations. Skipped: ${skipped}. Failed: ${failed}.`);
    if (!DRY_RUN) {
      console.log('\nNext: run npx tsx scripts/populate-street-view.ts to add street view photos.');
      console.log('Then delete this script.');
    }
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
