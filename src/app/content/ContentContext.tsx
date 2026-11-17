import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Illustration, Project, SiteContent } from './types';

interface ContentValue extends SiteContent {
  visibleIllustrations: Illustration[];
  visibleProjects: Project[];
}

const ContentContext = createContext<ContentValue | null>(null);

/** Contenu de départ, chargé seulement s'il faut s'en servir (le site lit d'habitude le contenu publié). */
const loadDefaultContent = () => import('./defaultContent').then((m) => m.defaultContent);

/** Délai max d'attente du contenu publié avant d'afficher le contenu de départ. */
const LOAD_TIMEOUT_MS = 2500;

async function fetchPublishedContent(signal: AbortSignal): Promise<SiteContent | null> {
  const response = await fetch('/api/content', { signal });
  if (!response.ok) return null;
  const data = (await response.json()) as { content: SiteContent | null };
  const content = data.content;
  if (!content || !Array.isArray(content.illustrations) || !Array.isArray(content.projects)) return null;
  return content;
}

/** Contenu déjà glissé dans la page par le serveur (api/page.ts), s'il est valide. */
function inlinedContent(): SiteContent | null {
  const data = (window as unknown as { __SITE_CONTENT__?: SiteContent }).__SITE_CONTENT__;
  return data && Array.isArray(data.illustrations) && Array.isArray(data.projects) ? data : null;
}

/**
 * Fournit le contenu du site à toutes les pages :
 * le contenu publié depuis /admin s'il existe, sinon le contenu de départ
 * embarqué dans le site (defaultContent.ts).
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(inlinedContent);

  useEffect(() => {
    if (content) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
    fetchPublishedContent(controller.signal)
      .then(async (published) => setContent(published ?? (await loadDefaultContent())))
      .catch(async () => setContent(await loadDefaultContent()))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  // Écran blanc très bref le temps de lire le contenu, pour ne jamais afficher
  // une version périmée (œuvre masquée, prix modifié…).
  // Listes visibles calculées une seule fois par contenu (et non à chaque affichage).
  const value = useMemo<ContentValue | null>(
    () =>
      content && {
        ...content,
        visibleIllustrations: content.illustrations.filter((item) => !item.hidden),
        visibleProjects: content.projects.filter((item) => !item.hidden),
      },
    [content],
  );

  if (!value) return <div className="site-surface min-h-screen bg-white" />;

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  const content = useContext(ContentContext);
  if (!content) throw new Error('useContent doit être utilisé dans <ContentProvider>');
  return content;
}

export type Entry =
  | { type: 'illustration'; item: Illustration }
  | { type: 'project'; item: Project };

/** Retrouve l'œuvre ou le projet correspondant à une adresse. */
export function useEntry(slug: string | undefined): Entry | null {
  const { visibleIllustrations, visibleProjects } = useContent();
  if (!slug) return null;
  const illustration = visibleIllustrations.find((item) => item.slug === slug);
  if (illustration) return { type: 'illustration', item: illustration };
  const project = visibleProjects.find((item) => item.slug === slug);
  if (project) return { type: 'project', item: project };
  return null;
}
