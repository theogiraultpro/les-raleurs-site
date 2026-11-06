// POST /api/order — enregistre une commande avec des prix recalculés côté serveur.
// Réponse : numéro de commande, lignes et total vérifiés (ce sont eux que
// l'e-mail de commande reprend).
import { json } from './_lib/auth.js';
import { loadCatalog, newOrderNumber, OrderError, priceItems, saveOrder, totalOf } from './_lib/orders.js';

const CUSTOMER_FIELDS = ['name', 'email', 'phone', 'address', 'postalCode', 'city', 'message'] as const;
const REQUIRED = ['name', 'email', 'address', 'postalCode', 'city'] as const;
const MAX_BODY = 20_000;

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return json({ error: 'Méthode non autorisée' }, { status: 405 });

    const text = await request.text();
    if (text.length > MAX_BODY) return json({ error: 'Commande trop volumineuse' }, { status: 413 });
    let body: { items?: unknown; customer?: Record<string, unknown>; displayedTotal?: unknown };
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: 'Commande illisible' }, { status: 400 });
    }

    const customer: Record<string, string> = {};
    for (const field of CUSTOMER_FIELDS) {
      const value = body.customer?.[field];
      customer[field] = typeof value === 'string' ? value.trim().slice(0, field === 'message' ? 2000 : 200) : '';
    }
    if (REQUIRED.some((field) => !customer[field])) {
      return json({ error: 'Coordonnées incomplètes' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return json({ error: 'Adresse e-mail invalide' }, { status: 400 });
    }

    try {
      const catalog = await loadCatalog();
      const lines = priceItems(catalog, body.items);
      const total = totalOf(lines);
      const displayed = body.displayedTotal === null || body.displayedTotal === undefined ? NaN : Number(body.displayedTotal);
      const order = {
        number: newOrderNumber(),
        createdAt: new Date().toISOString(),
        customer,
        lines,
        total,
        displayedTotal: Number.isFinite(displayed) ? displayed : null,
      };
      await saveOrder(order);
      return json({ number: order.number, lines, total });
    } catch (error) {
      if (error instanceof OrderError) return json({ error: error.message }, { status: 400 });
      console.error('Commande non enregistrée', error);
      return json({ error: "La commande n'a pas pu être enregistrée." }, { status: 500 });
    }
  },
};
