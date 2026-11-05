// Envoi d'images depuis /admin.
// En ligne : le navigateur envoie l'image directement à Vercel Blob ; cette route
// ne fait que délivrer l'autorisation (si l'admin est connecté).
// En local : l'image est envoyée ici et rangée dans .local-storage/.
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAuthenticated, json, unauthorized } from './_lib/auth.js';
import { storageMode, writeLocalImage } from './_lib/storage.js';

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return json({ error: 'Méthode non autorisée' }, { status: 405 });
    const mode = storageMode();

    if (mode === 'local') {
      if (!isAuthenticated(request)) return unauthorized();
      const pathname = new URL(request.url).searchParams.get('pathname') ?? `images/${Date.now()}.jpg`;
      const type = request.headers.get('content-type') ?? '';
      if (!IMAGE_TYPES.includes(type)) return json({ error: "Ce n'est pas une image" }, { status: 400 });
      const data = await request.arrayBuffer();
      if (data.byteLength > MAX_IMAGE_BYTES) return json({ error: 'Image trop lourde' }, { status: 413 });
      const url = await writeLocalImage(pathname.replace(/^\/+/, ''), data);
      return json({ url });
    }

    if (mode === 'none') {
      return json({ error: "Le stockage Vercel Blob n'est pas encore relié au projet." }, { status: 503 });
    }

    const body = (await request.json()) as HandleUploadBody;
    // L'avis de fin d'envoi vient des serveurs de Vercel (sans cookie) : il est
    // authentifié par handleUpload lui-même. Seule la demande d'autorisation
    // exige d'être connecté.
    if (body.type === 'blob.generate-client-token' && !isAuthenticated(request)) return unauthorized();

    try {
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          if (!pathname.startsWith('images/')) throw new Error('Emplacement non autorisé');
          return {
            allowedContentTypes: IMAGE_TYPES,
            maximumSizeInBytes: MAX_IMAGE_BYTES,
            addRandomSuffix: true,
          };
        },
        onUploadCompleted: async () => {},
      });
      return json(result);
    } catch (error) {
      return json({ error: (error as Error).message }, { status: 400 });
    }
  },
};
