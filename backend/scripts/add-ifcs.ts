/**
 * Seeds the IFCS (Integrated Family Community Services) charity and its location.
 *
 * Usage:
 *   npx tsx scripts/add-ifcs.ts
 *
 * Against dev/prod:
 *   DATABASE_URL=<render-url> npx tsx scripts/add-ifcs.ts
 */

import { Pool } from 'pg';

const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? 'app_db',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD,
    };

const CHARITY = {
  name: 'Integrated Family Community Services (IFCS)',
  slug: 'integrated-family-community-services',
  ein: '840579740',
  founded_year: 1964,
  primary_address: '3370 S Irving St, Englewood, CO 80110',
  website_url: 'https://ifcs.org',
  donate_url: 'https://ifcs.org/donate/',
  volunteer_url: 'https://ifcs.org/volunteer-core/',
  cause_tags: ['hunger', 'families', 'housing'],
  description: `Integrated Family Community Services (IFCS) has provided essential support to low-income residents of the south Denver metro area since 1964. Founded on the belief that neighbors should help neighbors, IFCS operates on the philosophy of "a hand up rather than a handout" — delivering services that preserve dignity and build long-term self-sufficiency.

The cornerstone of IFCS's work is The Market at IFCS, a grocery store-style food pantry where qualifying individuals choose their own items from fresh produce, proteins, and shelf-stable goods. Beyond food access, IFCS provides financial assistance for rent and utilities, recreation center passes for low-income residents, and seasonal programs including school supply drives, holiday grocery boxes, and gift support for families.`,
  impact: `50,365 individuals served (FY 2024–25)
48,286 received food support (FY 2024–25)
2,728 new participants (FY 2024–25)
96% of expenses directed to programs and services`,
  program_highlights: `(star)**The Market at IFCS**A grocery store-style food pantry where qualifying individuals choose their own fresh produce, proteins, and shelf-stable goods — providing food access with dignity and choice.
(home)**Financial Assistance**Rental and utility payment support through partnerships with Energy Outreach Colorado, plus recreation center passes for qualifying low-income residents.
(people)**Seasonal Programs**Year-round support including Ready, Set, School! school supply drives in spring, Fresh Thanks holiday grocery boxes in November, and Helping Hands for the Holidays gift support in fall.
(heart)**No-Cook Meals**Shelf-stable, no-prep meals provided to unhoused community members who need food without access to cooking facilities.`,
  location_description: 'IFCS operates from a single location in Englewood, serving low-income residents across western Arapahoe County, southwest Denver, northern Douglas County, and parts of Jefferson County.',
  usage_credit: 'Info and photography courtesy of Integrated Family Community Services.',
  is_reviewed: false,
};

const LOCATION = {
  label: 'IFCS — Englewood',
  address: '3370 S Irving St, Englewood, CO 80110',
  latitude: 39.6564,
  longitude: -105.0298,
  description: "IFCS's main facility houses The Market at IFCS, a grocery store-style food pantry open to qualifying residents, along with offices for financial assistance, benefit navigation, and seasonal program coordination. Serves residents of western Arapahoe County, southwest Denver, and surrounding communities.",
  is_sublocation: false,
};

async function main() {
  const pool = new Pool(DB_CONFIG as any);

  try {
    // Check if already exists
    const existing = await pool.query(
      'SELECT id FROM charities WHERE slug = $1 OR ein = $2',
      [CHARITY.slug, CHARITY.ein]
    );
    if (existing.rows.length) {
      console.error(`Charity already exists (id=${existing.rows[0].id}). Aborting.`);
      process.exit(1);
    }

    // Insert charity
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO charities (
        name, slug, ein, founded_year, primary_address,
        website_url, donate_url, volunteer_url, cause_tags,
        description, impact, program_highlights,
        location_description, usage_credit, is_reviewed
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING id`,
      [
        CHARITY.name,
        CHARITY.slug,
        CHARITY.ein,
        CHARITY.founded_year,
        CHARITY.primary_address,
        CHARITY.website_url,
        CHARITY.donate_url,
        CHARITY.volunteer_url,
        CHARITY.cause_tags,
        CHARITY.description,
        CHARITY.impact,
        CHARITY.program_highlights,
        CHARITY.location_description,
        CHARITY.usage_credit,
        CHARITY.is_reviewed,
      ]
    );

    const charityId = rows[0].id;
    console.log(`Inserted charity: ${CHARITY.name} (id=${charityId})`);

    // Insert location
    await pool.query(
      `INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, is_sublocation)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        charityId,
        LOCATION.label,
        LOCATION.address,
        LOCATION.latitude,
        LOCATION.longitude,
        LOCATION.description,
        LOCATION.is_sublocation,
      ]
    );

    console.log(`Inserted location: ${LOCATION.label}`);
    console.log('\nDone. Next steps:');
    console.log('  1. Upload photos to Cloudinary and add URLs via Admin UI at /admin/charities');
    console.log('  2. npx tsx scripts/populate-street-view.ts');
    console.log('  3. npx tsx scripts/upload-logos.ts');
    console.log('  4. Spot-check at /charities/integrated-family-community-services');
    console.log('  5. Set is_reviewed = true in Admin UI when complete');
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
