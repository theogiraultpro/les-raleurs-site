// Appels de la page /admin vers les routes /api.
import type { SiteContent } from '../content/types';

export interface SessionInfo {
  authenticated: boolean;
  configured: boolean;
  storage: 'blob' | 'local' | 'none';
}

async function readError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error ?? `Erreur ${response.status}`;
}

export async function getSession(): Promise<SessionInfo> {
  const response = await fetch('/api/session', { cache: 'no-store' });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function login(password: string): Promise<void> {
  const response = await fetch('/api/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error(await readError(response));
}

export async function logout(): Promise<void> {
  await fetch('/api/session', { method: 'DELETE' });
}

export async function loadContent(): Promise<SiteContent | null> {
  const response = await fetch('/api/content', { cache: 'no-store' });
  if (!response.ok) throw new Error(await readError(response));
  const data = (await response.json()) as { content: SiteContent | null };
  return data.content;
}

export async function saveContent(content: SiteContent): Promise<void> {
  const response = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(content),
  });
  if (!response.ok) throw new Error(await readError(response));
}
