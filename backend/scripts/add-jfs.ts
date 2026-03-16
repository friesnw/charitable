/**
 * Seeds the Jewish Family Service of Colorado charity and its locations.
 *
 * Usage:
 *   npx tsx scripts/add-jfs.ts
 *
 * Against dev/prod:
 *   DATABASE_URL=<render-url> npx tsx scripts/add-jfs.ts
 *
 * DELETE THIS SCRIPT after it has been run in all target environments.
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
  name: 'Jewish Family Service of Colorado',
  slug: 'jewish-family-service-of-colorado',
  ein: '840402701',
  founded_year: 1872,
  primary_address: '3201 S Tamarac Dr, Denver, CO 80231',
  website_url: 'https://www.jewishfamilyservice.org',
  donate_url: 'https://www.jewishfamilyservice.org/donate/make-a-donation',
  volunteer_url: 'https://www.jewishfamilyservice.org/volunteer/new',
  cause_tags: ['hunger', 'families', 'mental-health', 'seniors'],
  description: `Jewish Family Service of Colorado has been improving the lives of individuals and families in need throughout Colorado since 1872. Serving people of all backgrounds and beliefs, JFS delivers more than 30 programs across food security, mental health counseling, refugee resettlement, aging care, disability services, and employment support.

JFS operates the Harry and Jeanette Weinberg Food Pantry at its Denver campus, where clients shop with dignity for fresh produce, dairy, and household essentials three days a week. Beyond food, JFS provides emergency housing assistance, school-based mental health counseling, comprehensive refugee resettlement services, and wraparound support for older adults and people with disabilities across the greater Denver metro area.`,
  impact: `26,000 individuals impacted annually
167,546 services delivered last fiscal year
785,192 meals served
691 volunteers`,
  program_highlights: `(star)**Harry and Jeanette Weinberg Food Pantry**Clients shop for their own groceries — fresh produce, dairy, canned goods, and hygiene products — in a dignified store-style setting. Open Tuesday, Wednesday, and Friday, 10 a.m.–1 p.m.
(heart)**Mental Health Counseling**Individual, couple, and family therapy for depression, anxiety, grief, and more. Includes KidSuccess school-based counseling in Denver metro public schools and psychiatric medication management.
(people)**Refugee Resettlement**Comprehensive resettlement services in partnership with HIAS, covering housing, cultural orientation, language courses, school enrollment, employment support, and culturally competent mental health care.
(family)**Aging Care and Connections**Helps seniors remain independent through care management, in-home services, meal delivery, volunteer companionship, community wellness programs, and specialized support for Holocaust survivors.`,
  location_description: 'Jewish Family Service of Colorado operates from its main campus in Denver\'s Virginia Village neighborhood, with a second office and food pantry in Boulder. Programs reach individuals and families across the greater Denver metro area and beyond.',
  usage_credit: null,
  is_reviewed: false,
};

const LOCATIONS = [
  {
    label: 'JFS Denver — Main Campus',
    address: '3201 S Tamarac Dr, Denver, CO 80231',
    latitude: 39.6569728,
    longitude: -104.9000373,
    description: "JFS's Denver main campus houses the Harry and Jeanette Weinberg Food Pantry, mental health counseling services, refugee resettlement offices, employment services, and administrative staff. The food pantry is open Tuesday, Wednesday, and Friday from 10 a.m. to 1 p.m.",
    is_sublocation: false,
  },
  {
    label: 'JFS Boulder',
    address: '6007 Oreg Ave, Boulder, CO 80303',
    latitude: 39.9845,
    longitude: -105.2565,
    description: 'JFS Boulder provides food pantry services (open Tuesday, Wednesday, and Friday, 10 a.m.–1 p.m.), emergency financial assistance, aging care management, mental health counseling, caregiver support groups, and holiday services for Boulder County residents.',
    is_sublocation: false,
  },
];

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

    // Insert locations
    for (const loc of LOCATIONS) {
      await pool.query(
        `INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, is_sublocation)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [charityId, loc.label, loc.address, loc.latitude, loc.longitude, loc.description, loc.is_sublocation]
      );
      console.log(`Inserted location: ${loc.label}`);
    }

    console.log('\nDone. Next steps:');
    console.log('  1. npx tsx scripts/populate-street-view.ts');
    console.log('  2. npx tsx scripts/upload-logos.ts');
    console.log('  3. Spot-check at /charities/jewish-family-service-of-colorado');
    console.log('  4. Obtain photo usage approval from JFS, then add photos + usage_credit via Admin UI');
    console.log('  5. Set is_reviewed = true in Admin UI when complete');
    console.log('  6. Delete this script.');
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
