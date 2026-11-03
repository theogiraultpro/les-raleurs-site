import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate, useOutletContext } from 'react-router';
import { useState, useRef, useCallback } from 'react';
import Lightbox from '../components/Lightbox';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

interface OutletContext {
  handleAddToCart: (product: { id: number; name: string; price: number; image: string }) => void;
}
import imgDisco from '@/imports/Disco-1.jpg';
import imgChillTypo from '@/imports/Chill___Typo-1.jpg';
import imgChill from '@/imports/Chill-1.jpg';
import imgCureDent from '@/imports/Cure-Dent-1.jpg';
import imgDupond from '@/imports/Dupond-1.jpg';
import imgFocus from '@/imports/Focus-1.jpg';
import imgHappy from '@/imports/Happy-1.jpg';
import imgJulesCesar from '@/imports/Jules_Cesar-1.jpg';
import imgLhypster from '@/imports/L_hypster-1.jpg';
import imgLoiseau from '@/imports/L_oiseau_Me_chant-1.jpg';
import imgLeSnob from '@/imports/Le_Snob-1.jpg';
import imgLeClown from '@/imports/Le_Clown-1.jpg';
import imgLeFou from '@/imports/Le_Fou.jpg';
import imgLePunk from '@/imports/Le_Punk-1.jpg';
import imgNikole from '@/imports/Nikole-1.jpg';
import imgLePensif from '@/imports/Le_Pensif-1.jpg';
import imgMefiant from '@/imports/Me_fiant-1.jpg';
import imgLeFumeur from '@/imports/Le_Fumeur-1.jpg';
import imgRicky from '@/imports/Ricky-1.jpg';
import imgQuoi from '@/imports/Quoi_-1.jpg';
import imgRobert from '@/imports/Robert-1.jpg';
import imgSkate from '@/imports/Skate-1.jpg';
import imgTeufTeuf from '@/imports/TeufTeuf-1.jpg';
import imgTrailerParkBoy from '@/imports/Trailer_Park_Boy-1.jpg';
import imgWeshNan from '@/imports/Wesh_Nan-1.jpg';
import imgZabeth from '@/imports/Zabeth-1.jpg';

const illustrations = [
  { id: 1, image: imgChillTypo, format: 'Chill & Typo' },
  { id: 2, image: imgDisco, format: 'Disco' },
  { id: 3, image: imgChill, format: 'Chill' },
  { id: 4, image: imgCureDent, format: 'Cure-Dent' },
  { id: 5, image: imgDupond, format: 'Dupond' },
  { id: 6, image: imgFocus, format: 'Focus' },
  { id: 7, image: imgHappy, format: 'Happy' },
  { id: 8, image: imgJulesCesar, format: 'Jules César' },
  { id: 9, image: imgLhypster, format: "L'Hypster" },
  { id: 10, image: imgLoiseau, format: "L'Oiseau Méchant" },
  { id: 11, image: imgLeSnob, format: 'Le Snob' },
  { id: 12, image: imgLeClown, format: 'Le Clown' },
  { id: 13, image: imgLeFou, format: 'Le Fou' },
  { id: 14, image: imgLePunk, format: 'Le Punk' },
  { id: 15, image: imgNikole, format: 'Nikole' },
  { id: 16, image: imgLePensif, format: 'Le Pensif' },
  { id: 17, image: imgMefiant, format: 'Le Méfiant' },
  { id: 18, image: imgLeFumeur, format: 'Le Fumeur' },
  { id: 19, image: imgRicky, format: 'Ricky' },
  { id: 20, image: imgQuoi, format: 'Quoi ?' },
  { id: 21, image: imgRobert, format: 'Robert' },
  { id: 22, image: imgSkate, format: 'Skate' },
  { id: 23, image: imgTeufTeuf, format: 'Teuf Teuf' },
  { id: 24, image: imgTrailerParkBoy, format: 'Trailer Park Boy' },
  { id: 25, image: imgWeshNan, format: 'Wesh Nan' },
  { id: 26, image: imgZabeth, format: 'Zabeth' },
];

const fullDescription = `Les Râleurs,
L'art d'être parisien.ne!


Les Râleurs sont le résultat d'une recherche de personnages à la fois loufoques, drôles et caricaturales, où se mêlent chaos visuel et paréidolie, directement inspirés du quotidien.

Le processus débute par une tâche de couleur appliquée sans réflexion préalable, laissant émerger des formes accidentelles qui sont ensuite réinterpréter. À partir de ces silhouettes, des visages apparaissent, se déforment, s'assemblent et deviennent des figures expressives, souvent marquées par une tension, une absurdité ou une forme de satire.

Chaque dessin s'inscrit dans une gamme colorée définie en amont et inspirée de contextes ou d'univers précis (direction artistique d'une enseigne, saisons, émotions...).
Ces contraintes viennent structurer un chaos volontaire, entre instinct et composition.
Les Râleurs incarnent une foule : bruyante, vivante, parfois grotesque.


Un miroir déformé et satirique de nos comportements parigot.`;

export default function RaleursPage() {
  const navigate = useNavigate();
  const { handleAddToCart } = useOutletContext<OutletContext>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const THUMB_SIZE = 136; // 128px + 8px gap

  const scrollThumbs = useCallback((dir: 'left' | 'right') => {
    if (!thumbnailRef.current) return;
    thumbnailRef.current.scrollBy({ left: dir === 'right' ? THUMB_SIZE : -THUMB_SIZE, behavior: 'smooth' });
  }, []);

  const mouseY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), {
    stiffness: 100,
    damping: 15,
  });
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), {
    stiffness: 100,
    damping: 15,
  });

  const currentIllustration = illustrations[currentIndex];
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionLines = fullDescription.split('\n');
  const previewDescription = descriptionLines.slice(0, 3).join('\n');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    const y = (e.clientY - centerY) / (rect.height / 2);
    const x = (e.clientX - centerX) / (rect.width / 2);
    mouseY.set(y);
    mouseX.set(x);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseY.set(0);
    mouseX.set(0);
  };

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % illustrations.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + illustrations.length) % illustrations.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      className="min-h-screen pt-48 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left - Image Carousel */}
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
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: isHovered ? 1.05 : 1,
                  }}
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { type: "spring", stiffness: 150, damping: 20, mass: 1.5 },
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
                    src={currentIllustration.image}
                    alt={`Les Râleurs - ${currentIllustration.format}`}
                    className="w-full h-auto"
                  onClick={() => setLightboxOpen(true)}
                  />

                  {/* Cart Button */}
                  <motion.button
                    className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg z-10"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart({
                        id: currentIllustration.id + 100,
                        name: `Les Râleurs — ${currentIllustration.format}`,
                        price: 20,
                        image: currentIllustration.image,
                      });
                    }}
                  >
                    <ShoppingCart size={20} />
                  </motion.button>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {illustrations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex ? 'w-8 bg-black' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Details */}
          <motion.div
            className="lg:pt-16"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1
              className="text-6xl mb-2"
              style={{
                fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                fontWeight: 800,
                fontStyle: 'italic',
              }}
            >
              Les Râleurs
            </h1>

            <h2
              className="text-2xl mb-8"
              style={{
                fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                fontWeight: 400,
              }}
            >
              Illustration • Identité Visuelle • Direction Artistique • Print
            </h2>

            <div className="mb-12">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIllustration.id}
                  className="text-2xl mb-6"
                  style={{
                    fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                    fontWeight: 700,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentIllustration.format}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Description */}
            <div className="mb-12">
              <p
                className="text-base leading-relaxed whitespace-pre-line"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                  fontWeight: 400,
                }}
              >
                {showFullDescription ? fullDescription : previewDescription}
                {!showFullDescription && descriptionLines.length > 3 && (
                  <motion.button
                    onClick={() => setShowFullDescription(true)}
                    className="ml-2 text-black underline hover:no-underline"
                    style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 700 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Voir plus
                  </motion.button>
                )}
              </p>
              {showFullDescription && (
                <motion.button
                  onClick={() => setShowFullDescription(false)}
                  className="mt-2 text-black underline hover:no-underline"
                  style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 700 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Voir moins
                </motion.button>
              )}
            </div>

            <motion.button
              onClick={() => handleAddToCart({
                id: currentIllustration.id + 100,
                name: `Les Râleurs — ${currentIllustration.format}`,
                price: 20,
                image: currentIllustration.image,
              })}
              className="w-full bg-white text-black py-2 rounded-full text-base border-2 border-black hover:bg-black hover:text-white transition-colors mb-6"
              style={{
                fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              T'y es un bon à le mettre<br />dans le panier comme ça le sang
            </motion.button>

            <button
              onClick={() => navigate('/')}
              className="text-sm underline"
              style={{
                fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                fontWeight: 400,
              }}
            >
              ← Retour à la galerie
            </button>
          </motion.div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="w-full mt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3
            className="text-2xl mb-8 text-center"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 700,
            }}
          >
            Tous les visuels
          </h3>
          <div className="relative flex items-center gap-3">
            {/* Left arrow */}
            <motion.button
              onClick={() => scrollThumbs('left')}
              className="flex-shrink-0 bg-white border border-gray-200 hover:border-black rounded-full p-2 shadow-sm transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Scrollable strip */}
            <div
              ref={thumbnailRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pt-4 pb-8 flex-1 px-2"
              style={{ scrollPaddingInline: '8px' }}
            >
              {illustrations.map((illustration, index) => (
                <motion.button
                  key={illustration.id}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
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
                    <img
                      src={illustration.image}
                      alt={illustration.format}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {index === currentIndex && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Right arrow */}
            <motion.button
              onClick={() => scrollThumbs('right')}
              className="flex-shrink-0 bg-white border border-gray-200 hover:border-black rounded-full p-2 shadow-sm transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox src={currentIllustration.image} onClose={() => setLightboxOpen(false)} onPrev={prevImage} onNext={nextImage} />
      )}
    </motion.div>
  );
}