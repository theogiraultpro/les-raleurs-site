// Connexion à la page /admin : un seul mot de passe (variable ADMIN_PASSWORD
// dans Vercel), et un cookie signé valable 30 jours une fois connecté.
// Les fichiers commençant par « _ » dans /api ne sont pas publiés comme des routes.
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'raleurs_admin';
const SESSION_DAYS = 30;

function secret(): string {
  const value = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!value) throw new Error('ADMIN_PASSWORD manquant');
  return value;
}

export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  // Comparaison à temps constant, sur des empreintes de même longueur.
  const ha = createHmac('sha256', 'cmp').update(a).digest();
  const hb = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(candidate: unknown): boolean {
  if (!isConfigured() || typeof candidate !== 'string') return false;
  return safeEqual(candidate, process.env.ADMIN_PASSWORD as string);
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export function isAuthenticated(request: Request): boolean {
  if (!isConfigured()) return false;
  const token = readCookie(request, COOKIE);
  if (!token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

function cookieAttributes(request: Request): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `Path=/api; HttpOnly; SameSite=Strict${secure}`;
}

export function sessionCookie(request: Request): string {
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return `${COOKIE}=${expires}.${sign(expires)}; Max-Age=${SESSION_DAYS * 24 * 60 * 60}; ${cookieAttributes(request)}`;
}

export function clearedCookie(request: Request): string {
  return `${COOKIE}=; Max-Age=0; ${cookieAttributes(request)}`;
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  if (!headers.has('cache-control')) headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function unauthorized(): Response {
  return json({ error: 'Non connecté' }, { status: 401 });
}
