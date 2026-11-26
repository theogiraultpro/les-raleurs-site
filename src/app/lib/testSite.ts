// Essais de design : visibles seulement sur le site d'essai
// (les-raleurs-site.vercel.app) et en local, jamais sur lesraleurs.com.
//
// Chaque essai ajoute une classe sur <html> (ex. « essai-vert ») ; ses règles
// sont dans src/styles/essais.css. Pour passer un essai validé sur le site
// principal : mettre sa valeur à true dans ON_MAIN_SITE.
// (essai-vert du 9 nov. 2026 — fond #00541C, titres #FFFCF2 — retiré le 16 nov. :
// retour aux couleurs de base. Ses règles restent dans l'historique git, commit 5980462.)
const ON_MAIN_SITE: Record<string, boolean> = {
  /** Page « Qui suis-je ? » (/qui-suis-je) : onglet en tête du menu, arrivée après la bulle (16 nov. 2026). */
  'essai-presentation': false,
  /** Palette : blanc cassé #F5F2EA, noir charbon #1C1C1E, touches de bleu #2D5BFF (26 nov. 2026). */
  'essai-palette': false,
};

const MAIN_SITE = /(^|\.)lesraleurs\.com$/;

export const isTestSite = typeof window !== 'undefined' && !MAIN_SITE.test(window.location.hostname);

/** true si l'essai `name` est actif sur ce site. */
export function trialActive(name: string): boolean {
  return Boolean(ON_MAIN_SITE[name]) || isTestSite;
}

/** Pose sur <html> les classes des essais actifs sur ce site. */
export function applyDesignTrials() {
  if (typeof document === 'undefined') return;
  for (const [name, onMain] of Object.entries(ON_MAIN_SITE)) {
    if (onMain || isTestSite) document.documentElement.classList.add(name);
  }
}
