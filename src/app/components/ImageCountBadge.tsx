import { Images } from 'lucide-react';

/** Pastille « nombre d'images » en haut à gauche d'une carte (dossiers d'au moins 2 images). */
export function ImageCountBadge({ count }: { count?: number }) {
  if (!count || count < 2) return null;
  return (
    <div
      className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-black shadow-md backdrop-blur-sm"
      aria-label={`${count} images`}
    >
      <Images size={14} strokeWidth={2} aria-hidden="true" />
      <span>{count}</span>
    </div>
  );
}
