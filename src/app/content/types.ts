// Contenu du site : toutes les œuvres et tous les projets sont décrits ici
// sous forme de données. Les pages ne contiennent plus de texte ni d'image en dur :
// elles lisent ces données (aujourd'hui depuis defaultContent.ts, demain depuis
// le stockage alimenté par la page /admin).

/** Un format d'impression proposé à la vente. */
export interface PrintFormat {
  /** Code court affiché sur le bouton, ex. "30x40". */
  format: string;
  /** Libellé complet, ex. "30x40cm". */
  label: string;
  /** Prix en euros. */
  price: number;
}

/** Une image d'une galerie, avec sa légende. */
export interface GalleryImage {
  src: string;
  caption: string;
}

/** Ce qu'affiche la carte dans la grille (Illustrations ou Graphisme). */
export interface CardInfo {
  title: string;
  /** Petite ligne au-dessus du titre (ex. "Print 30x40") ou catégorie. */
  subtitle: string;
  image: string;
  /** Prix affiché sur la carte (illustrations uniquement). */
  price?: number;
  /** Phrase d'accroche sous le titre (projets uniquement). */
  teaser?: string;
}

/**
 * Une illustration en vente.
 * - "print" : une image unique, plusieurs formats au choix.
 * - "series" : une série de visuels (galerie), chacun vendu au même prix.
 */
export interface Illustration {
  /** Adresse de la page : lesraleurs.com/<slug>. */
  slug: string;
  kind: 'print' | 'series';
  /** Identifiant utilisé par le panier et les favoris. */
  cartId: number;
  title: string;
  subtitle?: string;
  /** Texte libre. Une ligne vide sépare deux paragraphes. */
  description: string;

  // Print
  image?: string;
  formats?: PrintFormat[];
  /** Index du format sélectionné à l'ouverture de la page. */
  defaultFormat?: number;

  // Série
  images?: GalleryImage[];
  seriesPrice?: number;

  card: CardInfo;
  /** Masquée du site (brouillon). */
  hidden?: boolean;
  /** Marquée vendue : visible mais plus achetable. */
  sold?: boolean;
}

/** Un projet de graphisme (portfolio, pas de vente). */
export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  images: GalleryImage[];
  card: CardInfo;
  hidden?: boolean;
}

export interface SiteContent {
  illustrations: Illustration[];
  projects: Project[];
}
