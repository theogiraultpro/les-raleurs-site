// Réglages réservés aux téléphones (écrans de moins de 768 px).
// Les ordinateurs et tablettes ne sont pas concernés.
export const isPhone =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
