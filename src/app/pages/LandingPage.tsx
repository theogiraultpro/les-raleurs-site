import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { InkBubble } from '../components/InkBubble';
import { saveStain } from '../lib/inkStain';
import logo from '@/imports/figma/b754442f94e8c7ceed8a38ab7b6000231d38433e.png';

/** Page de garde : page blanche, bulle d'encre à faire éclater, logo fixe en bas. */
export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('landing-scroll-hidden');
    return () => document.documentElement.classList.remove('landing-scroll-hidden');
  }, []);

  // La tache reste à l'écran : on passe directement à la galerie, elle y est déjà en fond.
  const enterGallery = () => {
    navigate('/illustrations', { replace: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-white">
      <h1 className="sr-only">Les Râleurs — illustrations et graphisme</h1>

      <img
        src={logo}
        alt="Les Râleurs"
        draggable={false}
        className="pointer-events-none fixed bottom-6 left-1/2 h-9 w-auto -translate-x-1/2 select-none md:bottom-8 md:h-11"
      />

      <InkBubble onSplat={saveStain} onBurst={enterGallery} />
    </main>
  );
}
