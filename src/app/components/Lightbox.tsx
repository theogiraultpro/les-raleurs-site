import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { responsiveImage } from '../lib/image';

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function Lightbox({ src, alt, onClose, onPrev, onNext }: LightboxProps) {
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

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/90"
          onClick={onClose}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Prev button */}
        {onPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-6 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next button */}
        {onNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-6 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <motion.img
          key={src}
          {...responsiveImage(src, '90vw')}
          alt={alt ?? ''}
          className="relative z-10 max-h-[90vh] max-w-[90vw] object-contain rounded-2xl select-none"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
}
