// Images à la bonne taille : en ligne, chaque image passe par le service de
// redimensionnement de Vercel (/_vercel/image), qui renvoie une version WebP
// adaptée à la largeur d'affichage et à l'écran du visiteur.
// Les largeurs autorisées sont listées dans vercel.json (images.sizes).
// Si le service ne répond pas (quota atteint, test local…), l'image d'origine
// est affichée à la place : rien ne casse.

/** Largeurs autorisées — doivent correspondre à vercel.json. */
export const IMAGE_WIDTHS = [256, 384, 640, 960, 1280, 1920] as const;
const QUALITY = 75;

const enabled = !import.meta.env.DEV;

function canOptimize(src: string): boolean {
  if (!enabled || !src) return false;
  if (src.startsWith('/assets/')) return !/\.(svg|gif)$/i.test(src);
  return /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//.test(src) && !/\.(svg|gif)$/i.test(src);
}

export function optimizedUrl(src: string, width: number): string {
  if (!canOptimize(src)) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${QUALITY}`;
}

// Les visiteurs ne reçoivent jamais mieux que 1280 px de large : assez pour
// un écran, trop peu pour une impression de qualité.
const MAX_PUBLIC_WIDTH = 1280;

/**
 * Attributs à étaler sur une balise <img> :
 *   <img {...responsiveImage(src, '(min-width: 1024px) 33vw, 100vw')} alt="…" />
 * `sizes` indique la largeur d'affichage ; `maxWidth` limite la plus grande version.
 */
export function responsiveImage(src: string, sizes: string, maxWidth = MAX_PUBLIC_WIDTH) {
  if (!canOptimize(src)) return { src, decoding: 'async' as const };
  const widths = IMAGE_WIDTHS.filter((w) => w <= Math.min(maxWidth, MAX_PUBLIC_WIDTH));
  return {
    src: optimizedUrl(src, widths[widths.length - 1]),
    srcSet: widths.map((w) => `${optimizedUrl(src, w)} ${w}w`).join(', '),
    sizes,
    decoding: 'async' as const,
    onError: (event: { currentTarget: HTMLImageElement }) => {
      const img = event.currentTarget;
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      img.removeAttribute('srcset');
      img.src = src;
    },
  };
}
