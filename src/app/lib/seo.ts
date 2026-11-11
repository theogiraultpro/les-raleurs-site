// Référencement : titre, description, image de partage et données structurées
// de chaque page. Ce module ne dépend ni de React ni de Vite : il sert à la fois
// au site (titre de l'onglet) et au serveur (api/page.ts), qui écrit ces balises
// dans le HTML pour Google et pour les aperçus de liens (Instagram, WhatsApp…).
import type { Illustration, Project, SiteContent } from '../content/types';

export const SITE_URL = 'https://lesraleurs.com';
export const SITE_NAME = 'Les Râleurs';
export const AUTHOR = 'Théo Girault';
const INSTAGRAM = 'https://www.instagram.com/raleurs_/';
const DEFAULT_IMAGE = '/og-share.jpg';

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  /** Chemin de l'image (/assets/… ou URL Vercel Blob). */
  image?: string;
  imageAlt?: string;
  type: 'website' | 'product' | 'article' | 'profile';
  /** Page à ne pas référencer (admin, page introuvable). */
  noindex?: boolean;
  jsonLd?: Record<string, unknown>[];
  /** La page demandée n'existe pas. */
  notFound?: boolean;
}

const BIO =
  "Théo Girault, graphiste, typographe et illustrateur. Les Râleurs : des personnages loufoques et satiriques nés d'une tache de couleur, miroir déformé de nos comportements parigots.";

const STATIC_PAGES: Record<string, Omit<PageMeta, 'path' | 'type'>> = {
  '': {
    title: 'Les Râleurs — L’art d’être parisien.ne',
    description:
      "Ils râlent dans le métro, refont le monde au comptoir et dansent jusqu'à l'aube : les Râleurs, personnages loufoques de l'illustrateur Théo Girault. Prints d'art à commander en ligne.",
  },
  illustrations: {
    title: "Illustrations et prints d'art — Les Râleurs",
    description:
      "Prints d'art des Râleurs en 20×20, 30×40 et 40×50 cm : métro, bar, teuf, festival… Des personnages parisiens loufoques et satiriques par l'illustrateur Théo Girault. Livraison en France.",
  },
  graphisme: {
    title: 'Graphisme, typographie et édition — Théo Girault',
    description:
      'Portfolio de Théo Girault, graphiste et typographe : identités visuelles, affiches d’événements, éditions photographiques et direction artistique, entre art urbain et rigueur typographique suisse.',
  },
  commissions: {
    title: 'Commandes et illustrations sur mesure — Les Râleurs',
    description:
      'Illustration personnalisée, portrait, visuel commercial ou collaboration événementielle : demandez un devis à Théo Girault, illustrateur et graphiste.',
  },
  about: {
    title: 'Contact — Théo Girault, Les Râleurs',
    description: `${BIO} Exposition, vente de tirages ou collaboration : écrivez-moi.`,
  },
  cgv: {
    title: 'Conditions générales de vente — Les Râleurs',
    description: 'Conditions de vente des prints et œuvres des Râleurs : commande, paiement, livraison en France, rétractation.',
  },
  'mentions-legales': {
    title: 'Mentions légales — Les Râleurs',
    description: 'Mentions légales du site lesraleurs.com, édité par Théo Girault.',
  },
};

/** Première phrase utile d'un texte libre, coupée proprement vers 155 caractères. */
export function summarize(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').replace(/^[.\s]+/, '').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).replace(/[,;:.\s]+$/, '')}…`;
}

/** Titre d'œuvre sans le point de tri parfois placé devant (".Les Râleurs du Ring"). */
function cleanTitle(title: string): string {
  return title.replace(/^[.\s]+/, '').trim();
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Image de partage : version 1280 px redimensionnée par Vercel (largeur autorisée dans vercel.json). */
export function shareImageUrl(src: string): string {
  if (src.startsWith('/assets/') || /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//.test(src)) {
    return `${SITE_URL}/_vercel/image?url=${encodeURIComponent(src)}&w=1280&q=75`;
  }
  return absoluteUrl(src);
}

const person = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#theo-girault`,
  name: AUTHOR,
  jobTitle: 'Graphiste, typographe et illustrateur',
  url: SITE_URL,
  email: 'mailto:contact@lesraleurs.com',
  sameAs: [INSTAGRAM],
  brand: { '@type': 'Brand', name: SITE_NAME },
};

const website = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#site`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: 'fr-FR',
  publisher: { '@id': person['@id'] },
};

function illustrationMeta(work: Illustration): PageMeta {
  const title = cleanTitle(work.title);
  const isSeries = work.kind === 'series';
  const image = (isSeries ? work.card.image : work.image) ?? work.card.image;
  const prices = isSeries
    ? [work.seriesPrice ?? work.card.price].filter((p): p is number => typeof p === 'number')
    : (work.formats ?? []).map((format) => format.price);
  const formats = (work.formats ?? []).map((format) => format.label).join(', ');
  const lowPrice = prices.length ? Math.min(...prices) : undefined;

  const intro = isSeries
    ? `Série de ${work.images?.length ?? ''} prints des Râleurs`.replace('  ', ' ')
    : `Print d'art${formats ? ` (${formats})` : ''}`;
  const priceText = work.sold ? ' (vendu)' : lowPrice !== undefined ? ` dès ${lowPrice} €` : '';
  const description = summarize(`${intro}${priceText} par Théo Girault. ${work.description}`);

  const product: Record<string, unknown> = {
    '@type': 'Product',
    name: title,
    description: summarize(work.description || description, 300),
    image: [shareImageUrl(image)],
    brand: { '@type': 'Brand', name: SITE_NAME },
    creator: { '@id': person['@id'] },
    category: 'Art > Prints',
    url: absoluteUrl(`/${work.slug}`),
  };
  if (prices.length) {
    product.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: work.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      areaServed: 'FR',
    };
  }

  return {
    title: `${title} — ${isSeries ? 'série de prints' : "print d'art"} par ${AUTHOR}`,
    description,
    path: `/${work.slug}`,
    image,
    imageAlt: `${title}, illustration des Râleurs par Théo Girault`,
    type: 'product',
    jsonLd: [product],
  };
}

function projectMeta(project: Project): PageMeta {
  const title = cleanTitle(project.title);
  return {
    title: `${title} — graphisme | Théo Girault`,
    description: summarize(`${project.subtitle}. ${project.description}`),
    path: `/${project.slug}`,
    image: project.card.image || project.images[0]?.src,
    imageAlt: `${title}, projet graphique de Théo Girault`,
    type: 'article',
    jsonLd: [
      {
        '@type': 'CreativeWork',
        name: title,
        description: summarize(project.description, 300),
        image: project.images.slice(0, 5).map((img) => shareImageUrl(img.src)),
        creator: { '@id': person['@id'] },
        url: absoluteUrl(`/${project.slug}`),
        inLanguage: 'fr-FR',
      },
    ],
  };
}

/** Balises de la page à l'adresse `path` (ex. "/metro"), d'après le contenu publié. */
export function metaForPath(rawPath: string, content: SiteContent | null): PageMeta {
  const path = `/${rawPath.replace(/^\/+|\/+$/g, '').split(/[?#]/)[0]}`;
  const key = path.slice(1);

  if (key === 'admin' || key.startsWith('admin/')) {
    return { title: 'Administration — Les Râleurs', description: '', path, type: 'website', noindex: true };
  }

  const fixed = STATIC_PAGES[key];
  if (fixed) {
    const meta: PageMeta = { ...fixed, path, type: key === 'about' ? 'profile' : 'website' };
    if (key === '' || key === 'about') meta.jsonLd = [website, person];
    if (key === 'illustrations' && content) {
      meta.image = content.illustrations.find((w) => !w.hidden)?.card.image;
    }
    return meta;
  }

  if (content) {
    const work = content.illustrations.find((w) => w.slug === key && !w.hidden);
    if (work) return illustrationMeta(work);
    const project = content.projects.find((p) => p.slug === key && !p.hidden);
    if (project) return projectMeta(project);
    return {
      title: 'Page introuvable — Les Râleurs',
      description: '',
      path,
      type: 'website',
      noindex: true,
      notFound: true,
    };
  }

  // Contenu indisponible : balises génériques, sans conclure que la page n'existe pas.
  return { ...STATIC_PAGES[''], path, type: 'website' };
}

/** Toutes les adresses publiques du site, pour le plan du site (sitemap.xml). */
export function publicPaths(content: SiteContent | null): string[] {
  const fixed = ['/', '/illustrations', '/graphisme', '/commissions', '/about', '/cgv', '/mentions-legales'];
  if (!content) return fixed;
  return [
    ...fixed,
    ...content.illustrations.filter((w) => !w.hidden).map((w) => `/${w.slug}`),
    ...content.projects.filter((p) => !p.hidden).map((p) => `/${p.slug}`),
  ];
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Balises <head> à écrire dans le HTML (hors <title>). */
export function headTags(meta: PageMeta): string {
  const url = absoluteUrl(meta.path === '/' ? '/' : meta.path);
  const image = shareImageUrl(meta.image || DEFAULT_IMAGE);
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    '<meta property="og:locale" content="fr_FR" />',
    `<meta property="og:type" content="${meta.type === 'product' ? 'product' : meta.type === 'profile' ? 'profile' : meta.type === 'article' ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt ?? meta.title)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ];
  if (meta.jsonLd?.length) {
    const graph = { '@context': 'https://schema.org', '@graph': meta.jsonLd };
    tags.push(`<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>`);
  }
  return tags.join('\n    ');
}

/** Insère les balises de la page dans le HTML de base (index.html). */
export function injectMeta(html: string, meta: PageMeta): string {
  const block = `<!-- seo:start -->\n    <title>${escapeHtml(meta.title)}</title>\n    ${headTags(meta)}\n    <!-- seo:end -->`;
  if (html.includes('<!-- seo:start -->')) {
    return html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, block);
  }
  const withoutTitle = html.replace(/\s*<title>[\s\S]*?<\/title>/, '').replace(/\s*<meta name="description"[^>]*>/, '');
  return withoutTitle.replace('</head>', `    ${block}\n  </head>`);
}
