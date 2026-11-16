// TEST : la tache d'encre de l'accueil reste ensuite en fond sur toutes les pages,
// à la même place à l'écran, jusqu'à la fermeture de l'onglet.
// Pour arrêter le test : ne plus afficher <PersistentStain /> dans Root.tsx.
import { useSyncExternalStore } from 'react';
import type { Splat } from '../components/InkBubble';

export interface StoredSplat {
  splat: Splat;
  /** Position du centre en proportion de l'écran (pour suivre les redimensionnements). */
  rx: number;
  ry: number;
}

const KEY = 'raleurs-ink-stain-v4'; // v4 : plusieurs taches (bulle éclatée alors qu'elle était coupée)

/** Une ou plusieurs taches (une par goutte quand la bulle a éclaté coupée). */
export type StoredStain = StoredSplat[];
const listeners = new Set<() => void>();
let current: StoredStain | null = null;

try {
  const saved = sessionStorage.getItem(KEY);
  const parsed = saved ? JSON.parse(saved) : null;
  current = Array.isArray(parsed) ? (parsed as StoredStain) : null;
} catch {
  current = null;
}

export function saveStain(splats: Splat[]) {
  current = splats.map((splat) => ({ splat, rx: splat.x / window.innerWidth, ry: splat.y / window.innerHeight }));
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
