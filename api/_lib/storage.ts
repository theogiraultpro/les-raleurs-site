// Stockage du contenu (fichier JSON) et des images.
// En ligne : Vercel Blob (variable BLOB_READ_WRITE_TOKEN, ajoutée par Vercel
// quand le stockage est relié au projet).
// En local, sans jeton : un dossier .local-storage/ à la racine du projet,
// pour pouvoir tester la page /admin sans toucher aux vraies données.
import { get, put } from '@vercel/blob';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';

export const CONTENT_PATH = 'content/site.json';
const LOCAL_DIR = join(process.cwd(), '.local-storage');

export function storageMode(): 'blob' | 'local' | 'none' {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (process.env.VERCEL) return 'none';
  return 'local';
}

function localPath(pathname: string): string {
  const safe = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  return join(LOCAL_DIR, safe);
}

/** Contenu publié, ou null s'il n'a jamais été enregistré. */
export async function readContent(): Promise<string | null> {
  const mode = storageMode();
  if (mode === 'blob') {
    const result = await get(CONTENT_PATH, { access: 'public', useCache: false }).catch(() => null);
    if (!result || result.statusCode !== 200) return null;
    return await new Response(result.stream).text();
  }
  if (mode === 'local') {
    return await readFile(localPath(CONTENT_PATH), 'utf8').catch(() => null);
  }
  return null;
}

export async function writeContent(body: string): Promise<void> {
  const mode = storageMode();
  if (mode === 'blob') {
    await put(CONTENT_PATH, body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60,
    });
    // Copie datée : un historique simple pour pouvoir revenir en arrière.
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await put(`content/history/${stamp}.json`, body, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/json; charset=utf-8',
    }).catch(() => undefined);
    return;
  }
  if (mode === 'local') {
    const file = localPath(CONTENT_PATH);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, body, 'utf8');
    return;
  }
  throw new Error('Stockage non configuré');
}

/** Enregistrement local d'une image (mode test uniquement). Renvoie son adresse. */
export async function writeLocalImage(pathname: string, data: ArrayBuffer): Promise<string> {
  const file = localPath(pathname);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(data));
  return `/api/local-file?path=${encodeURIComponent(pathname)}`;
}

export async function readLocalImage(pathname: string): Promise<Buffer | null> {
  return await readFile(localPath(pathname)).catch(() => null);
}
