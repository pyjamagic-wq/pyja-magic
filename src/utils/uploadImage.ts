import { getSupabase } from '../services/supabase/supabaseClient';

const MAX_EDGE = 1400;
const JPEG_QUALITY = 0.82;

function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image invalide.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload une photo produit.
 * 1) Tente Supabase Storage (bucket `product-images`)
 * 2) Sinon : image compressée en data URL (fonctionne sans config Storage)
 */
export async function uploadProductImage(
  file: File
): Promise<{ url: string; via: 'storage' | 'local'; error?: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Veuillez choisir un fichier image (JPG, PNG, WEBP…).');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Image trop lourde (max 12 Mo).');
  }

  const client = getSupabase();
  if (client) {
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await client.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

      if (!error) {
        const { data } = client.storage.from('product-images').getPublicUrl(path);
        if (data?.publicUrl) {
          return { url: data.publicUrl, via: 'storage' };
        }
      }
    } catch {
      // fallback local
    }
  }

  const url = await fileToCompressedDataUrl(file);
  return { url, via: 'local' };
}
