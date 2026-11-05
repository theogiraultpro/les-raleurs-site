import { createContext, useContext, type ReactNode } from 'react';
import { defaultContent } from './defaultContent';
import type { Illustration, Project, SiteContent } from './types';

const ContentContext = createContext<SiteContent>(defaultContent);

/**
 * Fournit le contenu du site à toutes les pages.
 * Pour l'instant : le contenu de départ embarqué dans le site.
 * Plus tard : le contenu publié depuis la page /admin.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  return <ContentContext.Provider value={defaultContent}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const content = useContext(ContentContext);
  return {
    ...content,
    visibleIllustrations: content.illustrations.filter((item) => !item.hidden),
    visibleProjects: content.projects.filter((item) => !item.hidden),
  };
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
