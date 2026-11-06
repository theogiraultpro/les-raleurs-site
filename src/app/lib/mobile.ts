// Réglages réservés aux téléphones (écrans de moins de 768 px).
// Les ordinateurs et tablettes ne sont pas concernés.
export const PHONE_QUERY = '(max-width: 767px)';

export const isPhone =
  typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches;

/** Adresse de la version allégée d'une image du site (créée à la construction), ou null. */
export function mobileSrc(src: string | undefined): string | null {
  if (!src) return null;
  const match = /^\/assets\/([^/?#]+)\.(jpe?g|png)$/i.exec(src);
  return match ? `/assets/m/${match[1]}.webp` : null;
}
