// Réglages réservés aux téléphones (écrans de moins de 768 px).
// Les ordinateurs et tablettes ne sont pas concernés.
export const isPhone =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

/**
 * Appareil avec une vraie souris (ordinateur). Faux sur téléphone et tablette :
 * les effets de survol y sont coupés, sinon le premier appui ne fait que
 * déclencher le survol et il faut appuyer une deuxième fois pour ouvrir.
 */
export const canHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
