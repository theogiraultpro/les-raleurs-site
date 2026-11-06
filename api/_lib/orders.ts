// Commandes : le prix de chaque article est TOUJOURS recalculé ici, à partir du
// catalogue publié depuis /admin. Rien de ce que le navigateur envoie comme prix
// n'est utilisé : seuls comptent l'œuvre, le format (ou le visuel) et la quantité.
//
// Les commandes sont enregistrées chiffrées (AES-256-GCM) dans le stockage :
// le stockage d'images est public, mais sans la clé ORDERS_SECRET personne ne
// peut lire les coordonnées des clients.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { list, put } from '@vercel/blob';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readContent, storageMode } from './storage.js';

// ---------- Catalogue et prix ----------

interface CatalogIllustration {
  slug: string;
  kind: 'print' | 'series';
  title: string;
  formats?: Array<{ format: string; label: string; price: number }>;
  images?: Array<{ src: string; caption: string }>;
  seriesPrice?: number;
  card?: { price?: number };
  hidden?: boolean;
  sold?: boolean;
}

export interface RequestedItem {
  slug: string;
  format?: string;
  visual?: number;
  quantity: number;
}

export interface PricedLine {
  slug: string;
  title: string;
  option: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export const MAX_QUANTITY = 10;
export const MAX_LINES = 30;

export class OrderError extends Error {}

export async function loadCatalog(): Promise<CatalogIllustration[]> {
  const raw = await readContent();
  if (!raw) throw new OrderError("Le catalogue n'est pas encore publié.");
  const data = JSON.parse(raw) as { illustrations?: CatalogIllustration[] };
  return data.illustrations ?? [];
}

const cents = (euros: number) => Math.round(euros * 100);

/** Calcule le prix de chaque ligne. Lève OrderError si un article est invalide. */
export function priceItems(catalog: CatalogIllustration[], requested: unknown): PricedLine[] {
  if (!Array.isArray(requested) || requested.length === 0) throw new OrderError('Panier vide.');
  if (requested.length > MAX_LINES) throw new OrderError('Trop d’articles dans le panier.');

  return requested.map((raw) => {
    const item = raw as Partial<RequestedItem>;
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new OrderError('Quantité invalide.');
    }
    const work = catalog.find((entry) => entry.slug === item.slug);
    if (!work || work.hidden) throw new OrderError('Une œuvre du panier n’est plus disponible.');
    if (work.sold) throw new OrderError(`« ${work.title} » est vendue.`);

    let unitPrice: number;
    let option: string;
    if (work.kind === 'series') {
      unitPrice = Number(work.seriesPrice ?? work.card?.price);
      const images = work.images ?? [];
      if (item.visual === undefined || item.visual === null) {
        option = 'Visuel au choix';
      } else {
        const visual = images[Number(item.visual)];
        if (!visual || !Number.isInteger(Number(item.visual))) throw new OrderError('Visuel inconnu.');
        option = visual.caption || `Visuel ${Number(item.visual) + 1}`;
      }
    } else {
      const format = (work.formats ?? []).find((f) => f.format === item.format);
      if (!format) throw new OrderError(`Format inconnu pour « ${work.title} ».`);
      unitPrice = Number(format.price);
      option = format.label || format.format;
    }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new OrderError(`Prix indisponible pour « ${work.title} ».`);

    return {
      slug: work.slug,
      title: work.title.replace(/^\./, ''),
      option,
      unitPrice,
      quantity,
      lineTotal: cents(unitPrice * quantity) / 100,
    };
  });
}

export function totalOf(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + cents(line.lineTotal), 0) / 100;
}

// ---------- Enregistrement chiffré ----------

export interface StoredOrder {
  number: string;
  createdAt: string;
  customer: Record<string, string>;
  lines: PricedLine[];
  total: number;
  /** Total que le navigateur affichait : s'il diffère, la commande est signalée. */
  displayedTotal: number | null;
}

function key(): Buffer {
  const secret = process.env.ORDERS_SECRET || process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ORDERS_SECRET manquant');
  return createHash('sha256').update(`raleurs-orders:${secret}`).digest();
}

function encrypt(data: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: body.toString('base64') });
}

function decrypt(text: string): StoredOrder {
  const box = JSON.parse(text) as { iv: string; tag: string; data: string };
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(box.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(box.tag, 'base64'));
  const plain = Buffer.concat([decipher.update(Buffer.from(box.data, 'base64')), decipher.final()]);
  return JSON.parse(plain.toString('utf8')) as StoredOrder;
}

export function newOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, '');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from(randomBytes(4), (b) => alphabet[b % alphabet.length]).join('');
  return `RL-${date}-${suffix}`;
}

const LOCAL_ORDERS = join(process.cwd(), '.local-storage', 'orders');

export async function saveOrder(order: StoredOrder): Promise<void> {
  const body = encrypt(order);
  const name = `${order.createdAt.replace(/[:.]/g, '-')}_${order.number}.json`;
  if (storageMode() === 'blob') {
    await put(`orders/${name}`, body, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/json',
    });
    return;
  }
  if (storageMode() === 'local') {
    await mkdir(LOCAL_ORDERS, { recursive: true });
    await writeFile(join(LOCAL_ORDERS, name), body, 'utf8');
    return;
  }
  throw new Error('Stockage non configuré');
}

export async function listOrders(limit = 200): Promise<StoredOrder[]> {
  const texts: string[] = [];
  if (storageMode() === 'blob') {
    let cursor: string | undefined;
    const blobs: Array<{ url: string; pathname: string }> = [];
    do {
      const page = await list({ prefix: 'orders/', limit: 1000, cursor });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
    for (const blob of blobs.slice(0, limit)) {
      const response = await fetch(blob.url, { cache: 'no-store' });
      if (response.ok) texts.push(await response.text());
    }
  } else if (storageMode() === 'local') {
    const files = (await readdir(LOCAL_ORDERS).catch(() => [] as string[])).sort().reverse().slice(0, limit);
    for (const file of files) texts.push(await readFile(join(LOCAL_ORDERS, file), 'utf8'));
  }
  const orders: StoredOrder[] = [];
  for (const text of texts) {
    try {
      orders.push(decrypt(text));
    } catch {
      // fichier illisible (clé changée) : ignoré
    }
  }
  return orders;
}
