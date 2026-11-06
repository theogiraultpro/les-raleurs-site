import { useEffect, useState } from 'react';
import { useStain } from '../lib/inkStain';
import { SplatShapes } from './InkBubble';

/** TEST : la tache d'encre de l'accueil, figée en fond derrière le contenu des pages. */
export function PersistentStain() {
  const stain = useStain();
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!stain) return null;
  const x = stain.rx * viewport.w;
  const y = stain.ry * viewport.h;

  return (
    <svg
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
        <SplatShapes splat={stain.splat} animated={false} />
      </g>
    </svg>
  );
}
