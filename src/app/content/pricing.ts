// Prix affichés dans le panier, lus dans le catalogue (même règle que le serveur,
// api/_lib/orders.ts). L'affichage ne sert qu'à informer : le montant qui fait foi
// est toujours celui recalculé par le serveur au moment de la commande.
import type { Illustration, SiteContent } from './types';

/** Référence d'un article : l'œuvre, et le format (print) ou le visuel (série). */
export interface ItemRef {
  slug: string;
  format?: string;
  visual?: number;
}

export function itemKey(ref: ItemRef): string {
  return `${ref.slug}|${ref.format ?? ''}|${ref.visual ?? ''}`;
}

export function findIllustration(content: SiteContent, slug: string): Illustration | undefined {
  return content.illustrations.find((item) => item.slug === slug && !item.hidden);
}

/** Prix unitaire actuel, ou null si l'article n'est plus disponible. */
export function catalogPrice(content: SiteContent, ref: ItemRef): number | null {
  const work = findIllustration(content, ref.slug);
  if (!work || work.sold) return null;
  if (work.kind === 'series') return work.seriesPrice ?? work.card.price ?? null;
  return work.formats?.find((format) => format.format === ref.format)?.price ?? null;
}

/** Format proposé quand on ajoute un print depuis la galerie (bouton panier de la carte). */
export function quickAddFormat(work: Illustration): string | undefined {
  const formats = work.formats ?? [];
  const sameAsCard = formats.find((format) => format.price === work.card.price);
  return (sameAsCard ?? formats[work.defaultFormat ?? 0] ?? formats[0])?.format;
}
