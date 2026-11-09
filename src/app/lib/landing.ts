// Page de garde « bulle d'encre » : mise de côté sur le site principal pendant
// qu'on la retravaille sur le site d'essai (les-raleurs-site.vercel.app).
//
// Pour la remettre sur lesraleurs.com : passer SHOW_ON_MAIN_SITE à true.
const SHOW_ON_MAIN_SITE = false;

const MAIN_SITE = /(^|\.)lesraleurs\.com$/;

/** true si la bulle d'encre doit s'afficher sur ce site. */
export const landingEnabled =
  SHOW_ON_MAIN_SITE || typeof window === 'undefined' || !MAIN_SITE.test(window.location.hostname);
