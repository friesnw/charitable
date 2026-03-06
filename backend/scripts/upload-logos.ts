/**
 * Fetches logos from charity websites, uploads to Cloudinary, and updates prod DB.
 * Run with: DATABASE_URL=<prod-url> npx tsx backend/scripts/upload-logos.ts
 */
import crypto from 'crypto';
import pg from 'pg';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!CLOUD_NAME || !API_KEY || !API_SECRET || !DATABASE_URL) {
  console.error('Missing required env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, DATABASE_URL');
  process.exit(1);
}

const charities: { id: number; name: string; logoSourceUrl: string }[] = [
  {
    id: 5,
    name: 'Warren Village',
    logoSourceUrl: 'https://warrenvillage.org/wp-content/uploads/2021/04/Icon.png',
  },
];

function signCloudinaryUpload(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha256').update(sorted + API_SECRET).digest('hex');
}

async function uploadToCloudinary(imageUrl: string): Promise<string> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params: Record<string, string> = { timestamp };
  const signature = signCloudinaryUpload(params);

  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  for (const charity of charities) {
    try {
      process.stdout.write(`${charity.name}: uploading... `);
      const cloudinaryUrl = await uploadToCloudinary(charity.logoSourceUrl);
      await client.query('UPDATE charities SET logo_url = $1 WHERE id = $2', [cloudinaryUrl, charity.id]);
      console.log(`done -> ${cloudinaryUrl}`);
    } catch (err) {
      console.error(`FAILED - ${err instanceof Error ? err.message : err}`);
    }
  }

  await client.end();
  console.log('\nAll done.');
}

main();
