export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url as string;
}

export function cloudinaryUrl(
  url: string,
  opts: { w?: number; h?: number; fit?: 'fill' | 'fit' | 'scale' | 'crop' } = {}
): string {
  const { w, h, fit = 'fill' } = opts;
  const transforms = ['q_auto', 'f_auto', fit && `c_${fit}`, w && `w_${w}`, h && `h_${h}`]
    .filter(Boolean)
    .join(',');
  return url.replace('/upload/', `/upload/${transforms}/`);
}

export async function pickAndUploadImage(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { resolve(null); return; }
      try {
        const url = await uploadToCloudinary(file);
        resolve(url);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}
