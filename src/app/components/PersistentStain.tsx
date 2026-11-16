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

  if (!stain || stain.length === 0) return null;

  return (
    <svg
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      {stain.map(({ splat, rx, ry }, i) => (
        <g key={i} transform={`translate(${(rx * viewport.w).toFixed(1)} ${(ry * viewport.h).toFixed(1)})`}>
          <SplatShapes splat={splat} animated={false} />
        </g>
      ))}
    </svg>
  );
}
