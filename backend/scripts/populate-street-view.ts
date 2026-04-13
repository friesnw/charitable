/**
 * Populate charity_locations.photo_url via Google Street View Static API + Cloudinary.
 *
 * Prerequisites (add to backend/.env before running):
 *   GOOGLE_MAPS_API_KEY   — Street View Static API enabled in Google Cloud Console
 *   CLOUDINARY_CLOUD_NAME — same cloud as frontend
 *   CLOUDINARY_API_KEY    — server-side credential (not the unsigned upload preset)
 *   CLOUDINARY_API_SECRET — server-side credential
 *
 * Usage:
 *   cd backend && npx tsx scripts/populate-street-view.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { getDatabaseConfig } from '../src/env.js';
import { uploadLocationPhoto } from '../src/lib/cloudinary.js';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const idArg = args.includes('--id') ? Number(args[args.indexOf('--id') + 1]) : null;
const useCoords = args.includes('--use-coords');

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return val;
}

const GOOGLE_MAPS_API_KEY = requireEnv('GOOGLE_MAPS_API_KEY');
const CLOUDINARY_CLOUD_NAME = requireEnv('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = requireEnv('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = requireEnv('CLOUDINARY_API_SECRET');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LocationRow {
  id: number;
  label: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
}

// ---------------------------------------------------------------------------
// Street View helpers
// ---------------------------------------------------------------------------

/**
 * Check Street View Metadata API to confirm imagery exists at the given
 * location string (either "lat,lng" or an address). Free API call.
 */
async function hasStreetViewImagery(location: string): Promise<boolean> {
  const params = new URLSearchParams({ location, key: GOOGLE_MAPS_API_KEY });
  const url = `https://maps.googleapis.com/maps/api/streetview/metadata?${params}`;
  const res = await fetch(url);
  if (!res.ok) return false;
  const data = (await res.json()) as { status: string };
  return data.status === 'OK';
}

/**
 * Download Street View image bytes for a given location string.
 */
async function downloadStreetViewImage(location: string): Promise<Buffer> {
  const params = new URLSearchParams({
    size: '600x400',
    location,
    fov: '80',
    pitch: '0',
    key: GOOGLE_MAPS_API_KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/streetview?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Street View API returned ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pool = new Pool(getDatabaseConfig());

  try {
    const { rows } = await pool.query<LocationRow>(
      `SELECT id, label, address, latitude, longitude
       FROM charity_locations
       WHERE (photo_url IS NULL OR $1)
         AND (latitude IS NOT NULL OR address IS NOT NULL)
         AND ($2 OR id = $3)
       ORDER BY id ASC`,
      [idArg !== null, idArg === null, idArg ?? 0]
    );

    if (rows.length === 0) {
      console.log('No locations to process.');
      return;
    }

    console.log(`Processing ${rows.length} location(s) with no photo...\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const loc of rows) {
      const tag = `[${loc.id}] ${loc.label}`;

      try {
        // Prefer address string for Street View — raw coordinates can snap to
        // nearby panoramas (e.g. a bus station) rather than the building itself.
        // Pass --use-coords to override and use lat/lng instead.
        let locationParam: string;

        if (!useCoords && loc.address) {
          locationParam = loc.address;
        } else if (loc.latitude != null && loc.longitude != null) {
          locationParam = `${parseFloat(loc.latitude!).toFixed(7)},${parseFloat(loc.longitude!).toFixed(7)}`;
        } else {
          console.log(`  SKIP  ${tag} — incomplete location data`);
          skipped++;
          continue;
        }

        // Check metadata before downloading to avoid storing grey "no imagery" images
        const hasImagery = await hasStreetViewImagery(locationParam);
        if (!hasImagery) {
          console.log(`  SKIP  ${tag} — no Street View imagery`);
          skipped++;
          continue;
        }

        // Download the Street View image
        const imageBuffer = await downloadStreetViewImage(locationParam);

        // Upload to Cloudinary
        const publicId = `location-${loc.id}`;
        const photoUrl = await uploadLocationPhoto(imageBuffer, publicId, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET);

        // Persist the URL
        await pool.query(
          'UPDATE charity_locations SET photo_url = $1 WHERE id = $2',
          [photoUrl, loc.id]
        );

        console.log(`  OK    ${tag}`);
        console.log(`        ${photoUrl}`);
        updated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  FAIL  ${tag} — ${message}`);
        failed++;
      }
    }

    console.log(`\nDone: ${updated} updated, ${skipped} skipped (no imagery), ${failed} failed`);
  } finally {
    await pool.end();
  }
}

main();
