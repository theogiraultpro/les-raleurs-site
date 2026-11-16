// Corrections d'orthographe du 16 nov. 2026 pour les textes publiés (œuvres et
// projets). Le serveur les applique à la lecture (api/_lib/storage.ts), donc elles
// sont en ligne tout de suite ; la prochaine publication depuis /admin les
// enregistre pour de bon. Sans effet sur un texte déjà corrigé.
import type { SiteContent } from './types';

export const SPELLING_FIXES: Array<[find: string, replace: string]> = [
  ['bombes à peintures', 'bombes de peinture'],
  ["p'tit café?", "p'tit café ?"],
  ['.Les Râleurs', 'Les Râleurs'],
  ['.Les Méchants Râleurs', 'Les Méchants Râleurs'],
  ['Bass lourdes', 'Basses lourdes'],
  ['parisien.ne!', 'parisien.ne !'],
  ['drôles et caricaturales', 'drôles et caricaturaux'],
  ['une tâche de couleur', 'une tache de couleur'],
  ['ensuite réinterpréter', 'ensuite réinterprétées'],
  ['comportements parigot.', 'comportements parigots.'],
  ["avec l'affiche?", "avec l'affiche ?"],
  ["L'Hypster", "L'Hipster"],
  ['pour The North Face et sport de Montagne', 'pour The North Face autour du sport de montagne'],
  ['pour le deuxième de notre Collectif Ladale', 'pour le deuxième événement de notre collectif Ladale'],
  ['Attuned et Création du Logo', 'Attuned et création du logo'],
  ['Création éditorial graphique autour', 'Édition graphique autour'],
  ['Création éditoriale graphique autour', 'Édition graphique autour'],
  ["collectif d'Art Urbain Ladale", "collectif d'art urbain Ladale"],
  ['Découverture d’un lieu abandonner', 'Découverte d’un lieu abandonné'],
];

/** Applique les corrections à toutes les chaînes du contenu ; renvoie le nombre de remplacements. */
export function applySpellingFixes(content: SiteContent): { content: SiteContent; count: number } {
  let count = 0;
  const fix = (value: unknown): unknown => {
    if (typeof value === 'string') {
      let out = value;
      for (const [find, replace] of SPELLING_FIXES) {
        // « .Les … » : seulement en début de titre.
        if (find.startsWith('.')) {
          if (out.startsWith(find)) {
            out = replace + out.slice(find.length);
            count++;
          }
          continue;
        }
        const parts = out.split(find);
        if (parts.length > 1) {
          count += parts.length - 1;
          out = parts.join(replace);
        }
      }
      return out;
    }
    if (Array.isArray(value)) return value.map(fix);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === 'image' || k === 'src' ? v : fix(v)]));
    }
    return value;
  };
  const fixed = fix(content) as SiteContent;
  return { content: fixed, count };
}
