import { useParams, useNavigate } from 'react-router';
import { useEntry } from '../content/ContentContext';
import PrintPage from './PrintPage';
import GalleryPage from './GalleryPage';

const font = '"aktiv-grotesk-condensed", sans-serif';

/** Affiche l'œuvre ou le projet correspondant à l'adresse (lesraleurs.com/<slug>). */
export default function EntryPage() {
  const { slug } = useParams();
  const entry = useEntry(slug);

  if (!entry) return <NotFound />;

  if (entry.type === 'project') {
    const project = entry.item;
    return (
      <GalleryPage
        key={project.slug}
        title={project.title}
        subtitle={project.subtitle}
        description={project.description}
        images={project.images}
        backTo={{ label: 'Retour au portfolio', path: '/graphisme' }}
      />
    );
  }

  const illustration = entry.item;
  if (illustration.kind === 'series') {
    return (
      <GalleryPage
        key={illustration.slug}
        title={illustration.title}
        subtitle={illustration.subtitle}
        description={illustration.description}
        images={illustration.images ?? []}
        shop={{ price: illustration.seriesPrice ?? illustration.card.price ?? 0, slug: illustration.slug, sold: illustration.sold }}
        backTo={{ label: 'Retour à la galerie', path: '/illustrations' }}
      />
    );
  }

  return <PrintPage key={illustration.slug} illustration={illustration} />;
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl mb-4" style={{ fontFamily: font, fontWeight: 800, fontStyle: 'italic' }}>
        Page introuvable
      </h1>
      <p className="text-lg mb-8" style={{ fontFamily: font }}>
        Roohhh, cette page n'existe pas (ou plus).
      </p>
      <button onClick={() => navigate('/illustrations')} className="text-sm underline" style={{ fontFamily: font }}>
        ← Retour à la galerie
      </button>
    </div>
  );
}
