// GET /<page> → la page du site (index.html) avec, déjà écrits dans le HTML,
// le titre, la description, l'image de partage et les données structurées de
// cette page. Google et les aperçus de liens (Instagram, WhatsApp, iMessage…)
// lisent ces balises sans exécuter le site.
// Toutes les adresses du site passent par ici (voir vercel.json). En cas de
// problème, la page est renvoyée telle quelle : le site reste toujours affiché.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readContent } from './_lib/storage.js';
import { injectMeta, metaForPath } from '../src/app/lib/seo.js';
import type { SiteContent } from '../src/app/content/types.js';

const HTML_HEADERS = { 'content-type': 'text/html; charset=utf-8' };

async function loadShell(request: Request): Promise<string | null> {
  // 1. Fichier construit, embarqué avec la fonction (vercel.json → includeFiles).
  const fromDisk = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8').catch(() => null);
  if (fromDisk) return fromDisk;
  // 2. Sinon, le fichier statique publié sur ce même site.
  const url = new URL('/index.html', request.url);
  const response = await fetch(url, { headers: { cookie: request.headers.get('cookie') ?? '' } }).catch(() => null);
  return response?.ok ? await response.text() : null;
}

async function loadContent(): Promise<SiteContent | null> {
  try {
    const raw = await readContent();
    if (!raw) return null;
    const data = JSON.parse(raw) as SiteContent;
    return Array.isArray(data.illustrations) && Array.isArray(data.projects) ? data : null;
  } catch {
    return null;
  }
}

/**
 * Glisse le contenu publié dans la page : le site s'affiche sans attendre
 * un second téléchargement (/api/content), devenu inutile.
 */
function inlineContent(html: string, content: SiteContent): string {
  const json = JSON.stringify(content).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return html
    .replace(/\s*<link rel="preload" href="\/api\/content"[^>]*>/, '')
    .replace('</head>', `    <script>window.__SITE_CONTENT__=${json}</script>\n  </head>`);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const shell = await loadShell(request);
    if (!shell) {
      // Dernier recours : une page minuscule qui charge le site normal sans changer d'adresse.
      const fallback =
        "<!doctype html><meta charset=\"utf-8\"><title>Les Râleurs</title><script>fetch('/index.html').then(function(r){return r.text()}).then(function(h){document.open();document.write(h);document.close()})</script>";
      return new Response(fallback, { headers: { ...HTML_HEADERS, 'cache-control': 'no-store' } });
    }

    const path = new URL(request.url).searchParams.get('path') ?? '';
    try {
      const content = await loadContent();
      const meta = metaForPath(path, content);
      const html = injectMeta(shell, meta);
      return new Response(content ? inlineContent(html, content) : html, {
        status: meta.notFound ? 404 : 200,
        headers: {
          ...HTML_HEADERS,
          // Même fraîcheur que /api/content : une modification faite dans /admin
          // (prix, œuvre masquée…) est en ligne en quelques secondes.
          'cache-control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=60',
        },
      });
    } catch {
      return new Response(shell, { headers: { ...HTML_HEADERS, 'cache-control': 'public, max-age=0, s-maxage=60' } });
    }
  },
};
