// GET /api/orders — liste des commandes enregistrées (admin connecté uniquement).
import { isAuthenticated, json, unauthorized } from './_lib/auth.js';
import { listOrders } from './_lib/orders.js';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return json({ error: 'Méthode non autorisée' }, { status: 405 });
    if (!isAuthenticated(request)) return unauthorized();
    const orders = await listOrders();
    return json({ orders });
  },
};
