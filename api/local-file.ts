// Mode test local uniquement : sert les images rangées dans .local-storage/.
// En ligne (Vercel Blob), cette route ne renvoie rien.
import { readLocalImage, storageMode } from './_lib/storage.js';

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (storageMode() !== 'local') return new Response('Introuvable', { status: 404 });
    const pathname = new URL(request.url).searchParams.get('path') ?? '';
    const data = await readLocalImage(pathname);
    if (!data) return new Response('Introuvable', { status: 404 });
    const ext = pathname.split('.').pop()?.toLowerCase() ?? '';
    return new Response(new Uint8Array(data), { headers: { 'content-type': TYPES[ext] ?? 'application/octet-stream' } });
  },
};
