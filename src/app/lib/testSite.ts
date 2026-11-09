// Essais de design : visibles seulement sur le site d'essai
// (les-raleurs-site.vercel.app) et en local, jamais sur lesraleurs.com.
//
// Chaque essai ajoute une classe sur <html> (ex. « essai-vert ») ; ses règles
// sont dans src/styles/essais.css. Pour passer un essai validé sur le site
// principal : mettre sa valeur à true dans ON_MAIN_SITE.
const ON_MAIN_SITE = {
  /** Fond vert #00541C, titres crème #FFFCF2 (essai du 9 nov. 2026). */
  'essai-vert': false,
} as const;

const MAIN_SITE = /(^|\.)lesraleurs\.com$/;

export const isTestSite = typeof window !== 'undefined' && !MAIN_SITE.test(window.location.hostname);

/** Pose sur <html> les classes des essais actifs sur ce site. */
export function applyDesignTrials() {
  if (typeof document === 'undefined') return;
  for (const [name, onMain] of Object.entries(ON_MAIN_SITE)) {
    if (onMain || isTestSite) document.documentElement.classList.add(name);
  }
}
