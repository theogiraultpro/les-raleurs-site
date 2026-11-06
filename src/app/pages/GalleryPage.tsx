import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate, useOutletContext } from 'react-router';
import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import Lightbox from '../components/Lightbox';
import { Description } from '../components/Description';
import type { GalleryImage } from '../content/types';
import { responsiveImage } from '../lib/image';

const font = '"aktiv-grotesk-condensed", sans-serif';

interface OutletContext {
  handleAddToCart: (product: { id: number; name: string; price: number; image: string }) => void;
}

interface GalleryPageProps {
  title: string;
  subtitle?: string;
  description: string;
  images: GalleryImage[];
  /** Si présent, chaque visuel est achetable à ce prix (séries d'illustrations). */
  shop?: { price: number; cartId: number; sold?: boolean };
  backTo: { label: string; path: string };
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 1000 : -1000, opacity: 0 }),
};

/** Page galerie : projets de graphisme et séries d'illustrations. */
export default function GalleryPage({ title, subtitle, description, images, shop, backTo }: GalleryPageProps) {
  const navigate = useNavigate();
  const { handleAddToCart } = useOutletContext<OutletContext>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const THUMB_SIZE = 136; // 128px + 8px d'écart

  const scrollThumbs = useCallback((dir: 'left' | 'right') => {
    thumbnailRef.current?.scrollBy({ left: dir === 'right' ? THUMB_SIZE : -THUMB_SIZE, behavior: 'smooth' });
  }, []);

  const mouseY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), { stiffness: 100, damping: 15 });
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), { stiffness: 100, damping: 15 });

  const current = images[currentIndex] ?? images[0];
  const hasMany = images.length > 1;
  const canBuy = shop && !shop.sold;
  const cleanTitle = title.replace(/^\./, '');

  const addCurrentToCart = () => {
    if (!shop || !current) return;
    handleAddToCart({
      id: shop.cartId * 1000 + currentIndex + 1,
      name: `${cleanTitle} — ${current.caption}`,
      price: shop.price,
      image: current.src,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    mouseY.set((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
    mouseX.set((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseY.set(0);
    mouseX.set(0);
  };

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };
  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!current) return null;

  return (
    <motion.div
      className="min-h-screen pt-48 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Carrousel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate={{ x: 0, opacity: 1, scale: isHovered ? 1.05 : 1 }}
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { type: 'spring', stiffness: 150, damping: 20, mass: 1.5 },
                  }}
                  ref={imageRef}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={handleMouseLeave}
                  className="relative overflow-hidden rounded-[3rem]"
                  style={{
                    y: translateY,
                    x: translateX,
                    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.4), 0 20px 40px -10px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <img
                    {...responsiveImage(current.src, '(min-width: 1024px) 600px, 100vw')}
                    alt={`${cleanTitle} - ${current.caption}`}
                    className="w-full h-auto"
                    onClick={() => setLightboxOpen(true)}
                  />
                  {canBuy && (
                    <motion.button
                      className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg z-10"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addCurrentToCart();
                      }}
                      aria-label="Ajouter au panier"
                    >
                      <ShoppingCart size={20} />
                    </motion.button>
                  )}
                </motion.div>
              </AnimatePresence>

              {hasMany && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    aria-label="Visuel précédent"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    aria-label="Visuel suivant"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="flex justify-center gap-2 mt-6">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goTo(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentIndex ? 'w-8 bg-black' : 'w-2 bg-gray-300'
                        }`}
                        aria-label={`Visuel ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Détails */}
          <motion.div
            className="lg:pt-16"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-6xl mb-2" style={{ fontFamily: font, fontWeight: 800, fontStyle: 'italic' }}>
              {title}
            </h1>
            {subtitle && (
              <h2 className="text-2xl mb-8" style={{ fontFamily: font, fontWeight: 400 }}>
                {subtitle}
              </h2>
            )}
            <div className="mb-12">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  className="text-2xl mb-6"
                  style={{ fontFamily: font, fontWeight: 700 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {current.caption}
                </motion.p>
              </AnimatePresence>
            </div>

            <Description text={description} />

            {shop && shop.sold && (
              <p className="text-3xl mb-6" style={{ fontFamily: font, fontWeight: 800 }}>
                Vendu
              </p>
            )}
            {canBuy && (
              <motion.button
                onClick={addCurrentToCart}
                className="w-full bg-white text-black py-2 rounded-full text-base border-2 border-black hover:bg-black hover:text-white transition-colors mb-6"
                style={{ fontFamily: font, fontWeight: 700, fontStyle: 'italic' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                T'y es un bon à le mettre<br />dans le panier comme ça le sang
              </motion.button>
            )}

            <button
              onClick={() => navigate(backTo.path)}
              className="text-sm underline block"
              style={{ fontFamily: font, fontWeight: 400 }}
            >
              ← {backTo.label}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bande de vignettes */}
      {hasMany && (
        <div className="w-full mt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-2xl mb-8 text-center" style={{ fontFamily: font, fontWeight: 700 }}>
              Tous les visuels
            </h3>
            <div className="relative flex items-center gap-3">
              <motion.button
                onClick={() => scrollThumbs('left')}
                className="flex-shrink-0 bg-white border border-gray-200 hover:border-black rounded-full p-2 shadow-sm transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Faire défiler vers la gauche"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <div
                ref={thumbnailRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pt-4 pb-8 flex-1 px-2"
                style={{ scrollPaddingInline: '8px' }}
              >
                {images.map((image, index) => (
                  <motion.button
                    key={`${image.src}-${index}`}
                    onClick={() => {
                      goTo(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`w-32 h-32 rounded-xl overflow-hidden transition-all ${
                        index === currentIndex
                          ? 'ring-4 ring-black shadow-xl'
                          : 'ring-2 ring-gray-200 hover:ring-black hover:shadow-lg'
                      }`}
                    >
                      <img {...responsiveImage(image.src, '128px', 384)} alt={image.caption} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    {index === currentIndex && (
                      <motion.div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full"
                        layoutId="activeIndicator"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => scrollThumbs('right')}
                className="flex-shrink-0 bg-white border border-gray-200 hover:border-black rounded-full p-2 shadow-sm transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Faire défiler vers la droite"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          src={current.src}
          onClose={() => setLightboxOpen(false)}
          onPrev={hasMany ? prevImage : undefined}
          onNext={hasMany ? nextImage : undefined}
        />
      )}
    </motion.div>
  );
}
