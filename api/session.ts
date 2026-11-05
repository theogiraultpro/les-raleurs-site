// GET    /api/session  → suis-je connecté ? quel stockage ?
// POST   /api/session  → connexion { password }
// DELETE /api/session  → déconnexion
import {
  checkPassword,
  clearedCookie,
  isAuthenticated,
  isConfigured,
  json,
  sessionCookie,
} from './_lib/auth.js';
import { storageMode } from './_lib/storage.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'GET') {
      return json({
        authenticated: isAuthenticated(request),
        configured: isConfigured(),
        storage: storageMode(),
      });
    }

    if (request.method === 'POST') {
      if (!isConfigured()) {
        return json({ error: "Le mot de passe admin n'est pas encore configuré sur Vercel." }, { status: 503 });
      }
      const body = (await request.json().catch(() => ({}))) as { password?: unknown };
      if (!checkPassword(body.password)) {
        await wait(1200); // ralentit les essais au hasard
        return json({ error: 'Mot de passe incorrect' }, { status: 401 });
      }
      return json({ authenticated: true }, { headers: { 'set-cookie': sessionCookie(request) } });
    }

    if (request.method === 'DELETE') {
      return json({ authenticated: false }, { headers: { 'set-cookie': clearedCookie(request) } });
    }

    return json({ error: 'Méthode non autorisée' }, { status: 405 });
  },
};
