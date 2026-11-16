// Page de garde « bulle d'encre ».
// Remise sur lesraleurs.com le 16 nov. 2026 (validée par Théo).
// Pour la retirer du site principal (et la garder sur le site d'essai) : passer à false.
const SHOW_ON_MAIN_SITE = true;

const MAIN_SITE = /(^|\.)lesraleurs\.com$/;

/** true si la bulle d'encre doit s'afficher sur ce site. */
export const landingEnabled =
  SHOW_ON_MAIN_SITE || typeof window === 'undefined' || !MAIN_SITE.test(window.location.hostname);
