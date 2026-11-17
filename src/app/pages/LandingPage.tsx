import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { InkBubble } from '../components/InkBubble';
import { saveStain } from '../lib/inkStain';
import { trialActive } from '../lib/testSite';
import { useContent } from '../content/ContentContext';
import { fetchPriority, responsiveImage } from '../lib/image';
import { GALLERY_CARD_SIZES } from '../components/ProductCard';
import logo from '@/imports/figma/b754442f94e8c7ceed8a38ab7b6000231d38433e.png';

/** Page de garde : page blanche, bulle d'encre à faire éclater, logo fixe en bas. */
export default function LandingPage() {
  const navigate = useNavigate();
  const { visibleIllustrations } = useContent();
  // Images de la galerie téléchargées pendant que la bulle flotte : elles s'affichent
  // aussitôt en arrivant sur Illustrations.
  const preload = visibleIllustrations.slice(0, 6).map((item) => item.card.image);

  useEffect(() => {
    document.documentElement.classList.add('landing-scroll-hidden');
    return () => document.documentElement.classList.remove('landing-scroll-hidden');
  }, []);

  // La tache reste à l'écran : on passe directement à la galerie, elle y est déjà en fond.
  const enterGallery = () => {
    // Essai (site d'essai) : on arrive sur la présentation ; sinon sur la galerie.
    navigate(trialActive('essai-presentation') ? '/qui-suis-je' : '/illustrations', { replace: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <main className="site-surface fixed inset-0 touch-none select-none overflow-hidden bg-white">
      <h1 className="sr-only">Les Râleurs — illustrations et graphisme</h1>

      {/* Bas de page fixe : petite phrase au-dessus du logo. */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 flex -translate-x-1/2 select-none flex-col items-center gap-2 md:bottom-8 md:gap-3">
        <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-black/60 md:text-xs">
          Tout part d’une tache
        </p>
        <img src={logo} alt="Les Râleurs" draggable={false} className="h-9 w-auto md:h-11" />
      </div>

      <InkBubble onSplat={saveStain} onBurst={enterGallery} />

      <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0">
        {preload.map((src) => (
          <img key={src} {...responsiveImage(src, GALLERY_CARD_SIZES, 960)} alt="" loading="eager" {...fetchPriority('low')} />
        ))}
      </div>
    </main>
  );
}
