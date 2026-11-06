// TEST : la tache d'encre de l'accueil reste ensuite en fond sur toutes les pages,
// à la même place à l'écran, jusqu'à la fermeture de l'onglet.
// Pour arrêter le test : ne plus afficher <PersistentStain /> dans Root.tsx.
import { useSyncExternalStore } from 'react';
import type { Splat } from '../components/InkBubble';

export interface StoredStain {
  splat: Splat;
  /** Position du centre en proportion de l'écran (pour suivre les redimensionnements). */
  rx: number;
  ry: number;
}

const KEY = 'raleurs-ink-stain';
const listeners = new Set<() => void>();
let current: StoredStain | null = null;

try {
  const saved = sessionStorage.getItem(KEY);
  if (saved) current = JSON.parse(saved) as StoredStain;
} catch {
  current = null;
}

export function saveStain(splat: Splat) {
  current = { splat, rx: splat.x / window.innerWidth, ry: splat.y / window.innerHeight };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // stockage indisponible (navigation privée…) : la tache reste jusqu'au rechargement
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStain(): StoredStain | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
