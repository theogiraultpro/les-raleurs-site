// GET /sitemap.xml → plan du site pour Google : toutes les pages publiques,
// œuvres et projets compris. Mis à jour automatiquement quand le contenu change dans /admin.
import { readContent } from './_lib/storage.js';
import { absoluteUrl, publicPaths } from '../src/app/lib/seo.js';
import type { SiteContent } from '../src/app/content/types.js';

export default {
  async fetch(): Promise<Response> {
    let content: SiteContent | null = null;
    try {
      const raw = await readContent();
      content = raw ? (JSON.parse(raw) as SiteContent) : null;
    } catch {
      content = null;
    }

    const urls = publicPaths(content)
      .map((path) => {
        const priority = path === '/' ? '1.0' : ['/illustrations', '/graphisme'].includes(path) ? '0.9' : '0.7';
        return `  <url><loc>${absoluteUrl(path)}</loc><priority>${priority}</priority></url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
    return new Response(xml, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  },
};
