/**
 * Sync causes, charities, and charity_locations from a source DB to a target DB.
 * Images (photo_url) are Cloudinary URLs and sync automatically with location rows.
 *
 * Usage:
 *   SOURCE_DATABASE_URL=<url> TARGET_DATABASE_URL=<url> npx tsx scripts/sync-content.ts
 *
 * Get DATABASE_URLs from the Render dashboard for each PostgreSQL service.
 * For local source, use: SOURCE_DATABASE_URL=postgres://postgres@localhost:5432/app_db
 */

import { Pool } from 'pg';

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return val;
}

const SOURCE_DATABASE_URL = requireEnv('SOURCE_DATABASE_URL');
const TARGET_DATABASE_URL = requireEnv('TARGET_DATABASE_URL');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CauseRow {
  tag: string;
  label: string;
}

interface CharityRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  cause_tags: string[];
  every_org_slug: string | null;
  ein: string;
  founded_year: number | null;
  volunteer_url: string | null;
  every_org_claimed: boolean;
  is_active: boolean;
  is_reviewed: boolean;
  primary_address: string | null;
  donate_url: string | null;
  impact: string | null;
  location_description: string | null;
  cover_photo_url: string | null;
  content_photo_url_1: string | null;
  content_photo_url_2: string | null;
  program_highlights: string | null;
  usage_credit: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

interface LocationRow {
  id: number;
  charity_id: number;
  label: string;
  description: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  photo_url: string | null;
  is_reviewed: boolean;
  is_sublocation: boolean;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const source = new Pool({ connectionString: SOURCE_DATABASE_URL, ssl: SOURCE_DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } });
  const target = new Pool({ connectionString: TARGET_DATABASE_URL, ssl: TARGET_DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } });

  try {
    // -----------------------------------------------------------------------
    // Read from source
    // -----------------------------------------------------------------------

    const { rows: causes } = await source.query<CauseRow>('SELECT tag, label FROM causes ORDER BY tag');
    const { rows: charities } = await source.query<CharityRow>(`
      SELECT id, name, slug, description, website_url, logo_url, cause_tags,
             every_org_slug, ein, founded_year, volunteer_url, every_org_claimed,
             is_active, is_reviewed, primary_address, donate_url,
             impact, location_description, cover_photo_url,
             content_photo_url_1, content_photo_url_2,
             program_highlights, usage_credit,
             cta_label, cta_url
      FROM charities
      ORDER BY id
    `);
    const { rows: locations } = await source.query<LocationRow>(`
      SELECT id, charity_id, label, description, address, latitude, longitude, photo_url, is_reviewed, is_sublocation
      FROM charity_locations
      ORDER BY id
    `);

    console.log(`Source: ${causes.length} causes, ${charities.length} charities, ${locations.length} locations\n`);

    // -----------------------------------------------------------------------
    // Sync causes
    // -----------------------------------------------------------------------

    for (const cause of causes) {
      await target.query(`
        INSERT INTO causes (tag, label)
        VALUES ($1, $2)
        ON CONFLICT (tag) DO UPDATE SET label = EXCLUDED.label
      `, [cause.tag, cause.label]);
    }
    console.log(`✓ Synced ${causes.length} causes`);

    // -----------------------------------------------------------------------
    // Sync charities — collect source_id → target_id map
    // -----------------------------------------------------------------------

    const idMap = new Map<number, number>(); // source charity id → target charity id

    for (const charity of charities) {
      const params = [
        charity.name, charity.slug, charity.description, charity.website_url,
        charity.logo_url, charity.cause_tags, charity.every_org_slug, charity.ein,
        charity.founded_year, charity.volunteer_url, charity.every_org_claimed,
        charity.is_active, charity.is_reviewed, charity.primary_address, charity.donate_url,
        charity.impact, charity.location_description, charity.cover_photo_url,
        charity.content_photo_url_1, charity.content_photo_url_2,
        charity.program_highlights, charity.usage_credit,
        charity.cta_label, charity.cta_url,
      ];

      // Try upsert by EIN first. If every_org_slug conflicts with a different row,
      // fall back to updating by every_org_slug (dev is authoritative).
      let rows: { id: number }[];
      try {
        ({ rows } = await target.query<{ id: number }>(`
          INSERT INTO charities
            (name, slug, description, website_url, logo_url, cause_tags,
             every_org_slug, ein, founded_year, volunteer_url, every_org_claimed,
             is_active, is_reviewed, primary_address, donate_url,
             impact, location_description, cover_photo_url,
             content_photo_url_1, content_photo_url_2,
             program_highlights, usage_credit,
             cta_label, cta_url)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
          ON CONFLICT (ein) DO UPDATE SET
            name                = EXCLUDED.name,
            slug                = EXCLUDED.slug,
            description         = EXCLUDED.description,
            website_url         = EXCLUDED.website_url,
            logo_url            = EXCLUDED.logo_url,
            cause_tags          = EXCLUDED.cause_tags,
            every_org_slug      = EXCLUDED.every_org_slug,
            founded_year        = EXCLUDED.founded_year,
            volunteer_url       = EXCLUDED.volunteer_url,
            every_org_claimed   = EXCLUDED.every_org_claimed,
            is_active           = EXCLUDED.is_active,
            is_reviewed         = EXCLUDED.is_reviewed,
            primary_address     = EXCLUDED.primary_address,
            donate_url          = EXCLUDED.donate_url,
            impact              = EXCLUDED.impact,
            location_description = EXCLUDED.location_description,
            cover_photo_url     = EXCLUDED.cover_photo_url,
            content_photo_url_1 = EXCLUDED.content_photo_url_1,
            content_photo_url_2 = EXCLUDED.content_photo_url_2,
            program_highlights  = EXCLUDED.program_highlights,
            usage_credit        = EXCLUDED.usage_credit,
            cta_label           = EXCLUDED.cta_label,
            cta_url             = EXCLUDED.cta_url,
            updated_at          = NOW()
          RETURNING id
        `, params));
      } catch (err: any) {
        // Unique violation on every_org_slug — update the existing row instead
        if (err.code === '23505' && err.constraint === 'charities_every_org_slug_key') {
          ({ rows } = await target.query<{ id: number }>(`
            UPDATE charities SET
              name                = $1,
              slug                = $2,
              description         = $3,
              website_url         = $4,
              logo_url            = $5,
              cause_tags          = $6,
              ein                 = $8,
              founded_year        = $9,
              volunteer_url       = $10,
              every_org_claimed   = $11,
              is_active           = $12,
              is_reviewed         = $13,
              primary_address     = $14,
              donate_url          = $15,
              impact              = $16,
              location_description = $17,
              cover_photo_url     = $18,
              content_photo_url_1 = $19,
              content_photo_url_2 = $20,
              program_highlights  = $21,
              usage_credit        = $22,
              cta_label           = $23,
              cta_url             = $24,
              updated_at          = NOW()
            WHERE every_org_slug = $7
            RETURNING id
          `, params));
        } else if (err.code === '23505' && err.constraint === 'charities_slug_key') {
          ({ rows } = await target.query<{ id: number }>(`
            UPDATE charities SET
              name                = $1,
              description         = $3,
              website_url         = $4,
              logo_url            = $5,
              cause_tags          = $6,
              every_org_slug      = $7,
              ein                 = $8,
              founded_year        = $9,
              volunteer_url       = $10,
              every_org_claimed   = $11,
              is_active           = $12,
              is_reviewed         = $13,
              primary_address     = $14,
              donate_url          = $15,
              impact              = $16,
              location_description = $17,
              cover_photo_url     = $18,
              content_photo_url_1 = $19,
              content_photo_url_2 = $20,
              program_highlights  = $21,
              usage_credit        = $22,
              cta_label           = $23,
              cta_url             = $24,
              updated_at          = NOW()
            WHERE slug = $2
            RETURNING id
          `, params));
        } else {
          throw err;
        }
      }

      idMap.set(charity.id, rows[0].id);
    }
    console.log(`✓ Synced ${charities.length} charities`);

    // -----------------------------------------------------------------------
    // Sync locations — grouped by charity, delete + reinsert in a transaction
    // -----------------------------------------------------------------------

    // Advance the sequence to avoid PK conflicts during delete+reinsert
    await target.query(`SELECT setval('charity_locations_id_seq', (SELECT COALESCE(MAX(id), 0) FROM charity_locations))`);

    const locationsByCharity = new Map<number, LocationRow[]>();
    for (const loc of locations) {
      const group = locationsByCharity.get(loc.charity_id) ?? [];
      group.push(loc);
      locationsByCharity.set(loc.charity_id, group);
    }

    let locationCount = 0;

    for (const [sourceCharityId, locs] of locationsByCharity) {
      const targetCharityId = idMap.get(sourceCharityId);
      if (targetCharityId === undefined) {
        console.warn(`  SKIP  locations for source charity ${sourceCharityId} — not found in target`);
        continue;
      }

      const client = await target.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM charity_locations WHERE charity_id = $1', [targetCharityId]);

        for (const loc of locs) {
          await client.query(`
            INSERT INTO charity_locations
              (charity_id, label, description, address, latitude, longitude, photo_url, is_reviewed, is_sublocation)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          `, [targetCharityId, loc.label, loc.description, loc.address,
              loc.latitude, loc.longitude, loc.photo_url, loc.is_reviewed, loc.is_sublocation]);
        }

        await client.query('COMMIT');
        locationCount += locs.length;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    console.log(`✓ Synced ${locationCount} locations`);
    console.log('\nSync complete.');
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
