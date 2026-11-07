import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useContent } from '../content/ContentContext';
import { metaForPath } from '../lib/seo';

/**
 * Met à jour le titre de l'onglet et la description à chaque changement de page.
 * Le premier affichage reçoit déjà ces balises du serveur (api/page.ts) ;
 * ce composant les garde justes pendant la navigation dans le site.
 */
export function PageMeta() {
  const { pathname } = useLocation();
  const { illustrations, projects } = useContent();

  useEffect(() => {
    const meta = metaForPath(pathname, { illustrations, projects });
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://lesraleurs.com${pathname === '/' ? '/' : pathname}`);
  }, [pathname, illustrations, projects]);

  return null;
}
