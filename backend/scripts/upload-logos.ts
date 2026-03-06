/**
 * Fetches favicons from charity websites via Google's favicon service,
 * uploads to Cloudinary, and updates the LOCAL dev DB only.
 *
 * Run from repo root: npx tsx backend/scripts/upload-logos.ts
 * Uses local DB env vars (DB_HOST, DB_NAME, etc.) — never touches prod.
 */
import crypto from 'crypto';
import pg from 'pg';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('Missing required env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

function signCloudinaryUpload(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha256').update(sorted + API_SECRET).digest('hex');
}

async function uploadToCloudinary(imageUrl: string): Promise<string> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = signCloudinaryUpload({ timestamp });
  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  const client = DATABASE_URL
    ? new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new pg.Client({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        database: process.env.DB_NAME ?? 'app_db',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD ?? '',
      });
  console.log(DATABASE_URL ? `Targeting remote DB` : `Targeting local DB`);
  await client.connect();

  const { rows } = await client.query<{ id: number; name: string; website_url: string }>(
    `SELECT id, name, website_url FROM charities WHERE website_url IS NOT NULL ORDER BY name`
  );

  console.log(`Found ${rows.length} charities with website URLs\n`);

  for (const charity of rows) {
    const domain = new URL(charity.website_url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    process.stdout.write(`${charity.name} (${domain}): uploading favicon... `);
    try {
      const cloudinaryUrl = await uploadToCloudinary(faviconUrl);
      await client.query('UPDATE charities SET logo_url = $1 WHERE id = $2', [cloudinaryUrl, charity.id]);
      console.log(`done -> ${cloudinaryUrl}`);
    } catch (err) {
      console.error(`FAILED - ${err instanceof Error ? err.message : err}`);
    }
  }

  await client.end();
  console.log('\nAll done. Local dev DB updated only.');
}

main();
