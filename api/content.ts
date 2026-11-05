// GET /api/content → contenu publié du site (public), ou { content: null }
// PUT /api/content → enregistre le contenu (admin connecté uniquement)
import { isAuthenticated, json, unauthorized } from './_lib/auth.js';
import { readContent, storageMode, writeContent } from './_lib/storage.js';

const MAX_BYTES = 2_000_000;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(['illustrations', 'graphisme', 'commissions', 'about', 'admin', 'api', 'cgv', 'mentions-legales', 'assets']);

function validate(data: unknown): string | null {
  if (!data || typeof data !== 'object') return 'Contenu illisible';
  const { illustrations, projects } = data as { illustrations?: unknown; projects?: unknown };
  if (!Array.isArray(illustrations) || !Array.isArray(projects)) return 'Listes manquantes';
  const seen = new Set<string>();
  for (const entry of [...illustrations, ...projects] as Array<Record<string, unknown>>) {
    const slug = entry?.slug;
    const title = typeof entry?.title === 'string' ? entry.title : '(sans titre)';
    if (typeof slug !== 'string' || !SLUG.test(slug)) return `Adresse invalide pour « ${title} » (lettres minuscules, chiffres et tirets)`;
    if (RESERVED.has(slug)) return `L'adresse « ${slug} » est réservée`;
    if (seen.has(slug)) return `L'adresse « ${slug} » est utilisée deux fois`;
    seen.add(slug);
    if (!entry.card || typeof entry.card !== 'object') return `Carte manquante pour « ${title} »`;
  }
  return null;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'GET') {
      const raw = await readContent();
      return new Response(`{"content":${raw ?? 'null'}}`, {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          // Mis en cache 10 s par Vercel, puis rafraîchi en arrière-plan.
          'cache-control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=60',
        },
      });
    }

    if (request.method === 'PUT') {
      if (!isAuthenticated(request)) return unauthorized();
      if (storageMode() === 'none') {
        return json({ error: "Le stockage Vercel Blob n'est pas encore relié au projet." }, { status: 503 });
      }
      const text = await request.text();
      if (text.length > MAX_BYTES) return json({ error: 'Contenu trop volumineux' }, { status: 413 });
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        return json({ error: 'Contenu illisible' }, { status: 400 });
      }
      const problem = validate(data);
      if (problem) return json({ error: problem }, { status: 400 });
      await writeContent(JSON.stringify(data));
      return json({ ok: true, savedAt: new Date().toISOString() });
    }

    return json({ error: 'Méthode non autorisée' }, { status: 405 });
  },
};
