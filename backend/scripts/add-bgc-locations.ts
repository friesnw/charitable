/**
 * Add Boys & Girls Clubs of Metro Denver club locations.
 * Geocodes each address via Mapbox, then inserts into charity_locations.
 *
 * Usage:
 *   MAPBOX_TOKEN=<token> npx tsx scripts/add-bgc-locations.ts
 *
 * Dry-run (geocode only, no DB writes):
 *   MAPBOX_TOKEN=<token> DRY_RUN=1 npx tsx scripts/add-bgc-locations.ts
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

const BGC_SLUG = 'boys-girls-clubs-of-metro-denver';

const LOCATIONS: { label: string; address: string; description: string }[] = [
  {
    label: 'Altura Boys & Girls Club',
    address: '1650 Altura Blvd, Aurora, CO 80011, United States',
    description: 'On-campus after-school program at Altura Elementary where Aurora kids can get homework help, play sports, explore arts and STEM, and spend time in a safe, supportive environment.',
  },
  {
    label: 'Arthur E. Johnson Boys & Girls Club',
    address: '3325 West 16th Avenue, Denver, CO 80204, United States',
    description: 'A large Boys & Girls Club serving the Sloan Lake area of Denver with after-school and summer programs focused on academics, sports, leadership, and mentorship.',
  },
  {
    label: 'Aurora Quest Boys & Girls Club',
    address: '17315 E 2nd Ave., Aurora, CO 80011, United States',
    description: 'After-school program at Aurora Quest Elementary for K-8 students featuring STEM activities, sports, creative arts, leadership programs, and homework support.',
  },
  {
    label: 'Boston Boys & Girls Club',
    address: '1365 Boston Street, Aurora, CO 80010, United States',
    description: 'Aurora club offering after-school and summer programs for K-8 students with academic enrichment, arts, athletics, and mentorship in a safe community space.',
  },
  {
    label: 'Crawford Boys & Girls Club',
    address: '1600 Florence Street, Aurora, CO 80010, United States',
    description: 'On-campus after-school programming at Crawford Elementary in Aurora for K-5 students offering homework help, sports, arts, and enrichment activities.',
  },
  {
    label: 'CSLA Boys & Girls Club',
    address: '7001 Lipan St., Denver, CO 80221, United States',
    description: 'Located at Colorado Sports Leadership Academy this club offers after-school and summer programs including sports, leadership activities, field trips, academic support, and arts programs.',
  },
  {
    label: 'Dalton Elementary Boys & Girls Club',
    address: '17401 E Dartmouth Ave, Aurora, CO 80013, United States',
    description: 'On-campus Boys & Girls Club at Dalton Elementary providing Aurora students with after-school programs including homework help, STEM activities, sports, and creative arts.',
  },
  {
    label: 'Dartmouth Elementary Boys & Girls Club',
    address: '3050 S Laredo Street, Aurora, CO 80013, United States',
    description: 'After-school program at Dartmouth Elementary where Aurora students can participate in sports, arts, STEM learning, and leadership programs.',
  },
  {
    label: 'Denver Broncos Boys & Girls Club',
    address: '4397 Crown Boulevard, Denver, CO 80239, United States',
    description: 'Northeast Denver club supported by the Denver Broncos offering year-round after-school and summer programs focused on academics, sports, leadership, and healthy lifestyles.',
  },
  {
    label: 'Edna & John W. Mosley Boys & Girls Club',
    address: '55 N. Salida Way, Aurora, CO 80011, United States',
    description: 'One of the largest Boys & Girls Clubs in Aurora offering after-school and summer programs with academic support, sports leagues, leadership programs, and creative arts.',
  },
  {
    label: 'Hidden Lake Boys & Girls Club',
    address: '7300 Lowell Blvd., Westminster, CO 80030, United States',
    description: 'Westminster club providing after-school and summer programs for kids and teens including academic enrichment, sports, arts, and leadership activities.',
  },
  {
    label: 'J. Churchill Owen Boys & Girls Club',
    address: '3480 W Kentucky Ave., Denver, CO 80219, United States',
    description: 'Southwest Denver club offering after-school and summer programs focused on academic success, sports, mentorship, and leadership development.',
  },
  {
    label: 'Jack A. Vickers Boys & Girls Club',
    address: '3333 Holly Street, Denver, CO 80207, United States',
    description: 'Northeast Denver Boys & Girls Club providing after-school and summer programs with sports leagues, academic support, arts programming, and leadership activities.',
  },
  {
    label: 'Johnson Elementary Boys & Girls Club',
    address: '1850 South Irving Street, Denver, CO 80219, United States',
    description: 'On-campus program at Johnson Elementary where students can get homework help, play sports, and participate in arts and enrichment activities.',
  },
  {
    label: 'Josephine Hodgkins Boys & Girls Club',
    address: '3475 W 67th Ave, Denver, CO 80221, United States',
    description: 'Northwest Denver club offering after-school and summer programs focused on academics, sports, leadership development, and creative arts.',
  },
  {
    label: 'KIPP Green Valley Ranch Boys & Girls Club',
    address: '4635 Walden St., Denver, CO 80249, United States',
    description: 'After-school program at KIPP Green Valley Ranch offering students STEM activities, sports, leadership programs, and academic support.',
  },
  {
    label: 'Montview Boys & Girls Club',
    address: '2055 Moline Street, Aurora, CO 80010, United States',
    description: 'Aurora club offering after-school and summer programming with sports, arts, academic enrichment, and leadership development opportunities.',
  },
  {
    label: 'Shopneck Boys & Girls Club',
    address: '1800 Longs Peak Street, Brighton, CO 80601, United States',
    description: 'Brighton club serving local youth with after-school and summer programs focused on academic success, sports, and leadership activities.',
  },
  {
    label: 'Suncor Boys & Girls Club',
    address: '6201 Holly Street, Commerce City, CO 80022, United States',
    description: 'Commerce City Boys & Girls Club offering after-school and summer programs with academic support, athletics, leadership development, and arts activities.',
  },
  {
    label: 'Sunset Ridge Boys & Girls Club',
    address: '9451 Hooker Street, Westminster, CO 80031, United States',
    description: 'Westminster club providing after-school and summer programs including sports, arts programs, leadership opportunities, and academic enrichment.',
  },
  {
    label: 'Tennyson Knolls Boys & Girls Club',
    address: '6330 Tennyson St, Arvada, CO 80003, United States',
    description: 'Arvada Boys & Girls Club offering after-school and summer programs with sports leagues, arts programming, leadership development, and homework help.',
  },
  {
    label: 'U Prep Arapahoe Street Boys & Girls Club',
    address: '2409 Arapahoe Street, Denver, CO 80205, United States',
    description: 'After-school program at University Prep Arapahoe Street where students can participate in STEM learning, sports, arts programs, and leadership activities.',
  },
  {
    label: 'U Prep Steele Street Boys & Girls Club',
    address: '3230 East 38th Ave., Denver, CO 80205, United States',
    description: 'On-campus club at University Prep Steele Street offering students after-school programs including academic support, sports, arts, and leadership activities.',
  },
  {
    label: 'Virginia Court Boys & Girls Club',
    address: '12600 E Virginia Court, Aurora, CO 80012, United States',
    description: 'Aurora club offering after-school and summer programs focused on academic support, sports, leadership development, and healthy lifestyles.',
  },
  {
    label: 'William E. Cope Boys & Girls Club',
    address: '808 Inca Street, Denver, CO 80204, United States',
    description: 'Lincoln Park Boys & Girls Club serving K-12 youth with after-school and summer programs including a dedicated teen center with computers and homework support.',
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
    // Find the charity
    const { rows } = await pool.query<{ id: number }>(
      'SELECT id FROM charities WHERE slug = $1',
      [BGC_SLUG]
    );
    if (!rows.length) {
      console.error(`Charity not found: ${BGC_SLUG}`);
      process.exit(1);
    }
    const charityId = rows[0].id;
    console.log(`Found charity id=${charityId}\n`);

    let inserted = 0;
    let failed = 0;

    for (const loc of LOCATIONS) {
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
          `INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [charityId, loc.label, loc.description, loc.address, coords.latitude, coords.longitude]
        );
      }

      inserted++;
      // Nominatim requires max 1 req/sec
      await new Promise(r => setTimeout(r, 1100));
    }

    console.log(`\n${DRY_RUN ? '[DRY RUN] Would insert' : 'Inserted'} ${inserted} locations. Failed: ${failed}.`);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
