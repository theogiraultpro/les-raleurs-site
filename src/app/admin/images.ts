// Préparation et envoi des images depuis /admin.
// Chaque image est réduite (2400 px max sur le grand côté) et convertie en WebP
// avant l'envoi : environ 10 fois plus légère qu'une photo d'appareil, sans
// perte visible à l'écran. Cela garde le stockage gratuit largement suffisant.

const MAX_SIDE = 2400;
const QUALITY = 0.86;

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function compress(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file; // les GIF animés restent tels quels
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));
  // Si la conversion n'apporte rien (image déjà légère), on garde l'original.
  if (!blob || blob.size >= file.size) return file;
  return blob;
}

function extensionFor(blob: Blob): string {
  switch (blob.type) {
    case 'image/webp': return 'webp';
    case 'image/png': return 'png';
    case 'image/gif': return 'gif';
    case 'image/avif': return 'avif';
    default: return 'jpg';
  }
}

/** Réduit puis envoie une image. Renvoie son adresse publique. */
export async function uploadImage(file: File, storage: 'blob' | 'local' | 'none'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`« ${file.name} » n'est pas une image`);
  const blob = await compress(file);
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const pathname = `images/${base}.${extensionFor(blob)}`;

  if (storage === 'local') {
    const response = await fetch(`/api/upload?pathname=${encodeURIComponent(pathname)}`, {
      method: 'POST',
      headers: { 'content-type': blob.type || file.type },
      body: blob,
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) throw new Error(data.error ?? "Échec de l'envoi");
    return data.url;
  }

  if (storage === 'none') throw new Error("Le stockage d'images n'est pas encore relié au projet.");

  const { upload } = await import('@vercel/blob/client');
  const result = await upload(pathname, blob, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    contentType: blob.type || file.type,
  });
  return result.url;
}
