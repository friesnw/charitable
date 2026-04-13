import { createHash } from 'crypto';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

/**
 * Sign and upload an image buffer to Cloudinary under the charity-locations folder.
 * Returns the secure_url of the uploaded asset.
 */
export async function uploadLocationPhoto(
  imageBuffer: Buffer,
  publicId: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'charity-locations';

  // Signature: alphabetically-sorted key=value pairs, then api_secret appended
  const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' }), `${publicId}.jpg`);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('public_id', publicId);
  form.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(url, { method: 'POST', body: form });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${body}`);
  }

  const result = (await res.json()) as CloudinaryUploadResponse;
  return result.secure_url;
}
