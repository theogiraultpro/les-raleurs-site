import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { responsiveImage } from '../lib/image';

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

/** Distance minimale (px) d'un glissement du doigt pour changer d'image. */
const SWIPE_MIN = 50;

export default function Lightbox({ src, alt, onClose, onPrev, onNext }: LightboxProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  // Sur téléphone : glisser le doigt vers la gauche ou la droite change d'image.
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onNext?.();
    else onPrev?.();
  };

  const arrowClass =
    'absolute z-20 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-full p-3 md:p-3 transition-colors ' +
    // Téléphone : en bas, à portée de pouce, jamais sous l'image. Ordinateur : sur les côtés.
    'bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Overlay */}
        <motion.div className="absolute inset-0 bg-black/95" onClick={onClose} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Prev button */}
        {onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className={`${arrowClass} left-6`}
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-7 h-7 md:w-6 md:h-6" />
          </button>
        )}

        {/* Next button */}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className={`${arrowClass} right-6`}
            aria-label="Image suivante"
          >
            <ChevronRight className="w-7 h-7 md:w-6 md:h-6" />
          </button>
        )}

        {/* Image : changement instantané d'une image à l'autre, sans animation */}
        <img
          {...responsiveImage(src, '90vw')}
          alt={alt ?? ''}
          className={`relative z-10 max-w-[90vw] object-contain rounded-2xl select-none ${
            onPrev || onNext ? 'max-h-[calc(100vh-11rem)] md:max-h-[90vh]' : 'max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );
}
