import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useState, useRef, useCallback } from 'react';
import Lightbox from '../components/Lightbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import image1 from '@/imports/affiche_full_typo.jpg';
import image2 from '@/imports/affichecolo.jpg';
import image3 from '@/imports/99_Mock_up_-1.jpg';
import image4 from '@/imports/99_carre__1-1.jpg';
import image5 from '@/imports/99_carre__2-1.jpg';
import image6 from '@/imports/Vinyl_1-1.jpg';
import image7 from '@/imports/Vinyl_2-1.jpg';
import image8 from '@/imports/Vinyl_3-1.jpg';
import image9 from '@/imports/Vinyl_4-1.jpg';
import image10 from '@/imports/Ticket_1-1.jpg';
import image11 from '@/imports/Ticket_2-1.jpg';
import image12 from '@/imports/Ticket_3-1.jpg';
import image13 from '@/imports/Bag_1-1.jpg';
import image14 from '@/imports/Bag_2-1.jpg';
import image15 from '@/imports/Bag_3-1.jpg';

const illustrations = [
  { id: 1, image: image2, format: 'Poster' },
  { id: 2, image: image1, format: 'Poster' },
  { id: 3, image: image3, format: 'Posters' },
  { id: 4, image: image4, format: 'Pochette Vinyle' },
  { id: 5, image: image5, format: 'Pochette Vinyle' },
  { id: 6, image: image6, format: 'Pochette Vinyle' },
  { id: 7, image: image7, format: 'Pochette Vinyle' },
  { id: 8, image: image8, format: 'Pochette Vinyle' },
  { id: 9, image: image9, format: 'Pochette Vinyle' },
  { id: 10, image: image10, format: 'Ticket' },
  { id: 11, image: image11, format: 'Ticket' },
  { id: 12, image: image12, format: 'Ticket' },
  { id: 13, image: image13, format: 'Tote Bag' },
  { id: 14, image: image14, format: 'Tote Bag' },
  { id: 15, image: image15, format: 'Tote Bag' },
];

const fullDescription = `RAVE 99
Création graphique pour un projet avec le collectif 999999999

Dans le cadre d'un projet imaginé, j'ai conçu et réalisé une identité visuelle typographique pour un événement fictif organisé par le collectif 999999999. Ce travail vise à capturer l'énergie brute et l'esthétique underground propre au collectif, tout en explorant des compositions graphiques audacieuses et innovantes.

Le projet se structure autour d'un visuel principal décliné sur plusieurs supports :
• Affiches : Deux déclinaisons qui exploitent le contraste entre une typographie minimaliste et des éléments visuels dynamiques, tels que des motifs organiques et des lignes fluides, créant une sensation de mouvement et de profondeur.
• Pochette de vinyle : Un design immersif et percutant, pensé pour refléter l'intensité et la singularité de la musique électronique.
• Ticket d'entrée : Une mise en page typographique revisitée pour offrir un souvenir tangible de l'événement, idéal pour ceux qui ne pourraient pas se procurer les affiches.
• Tote bag : Un sac au design atypique, où l'élément typographique s'impose de manière audacieuse. Pensé comme un objet à la fois esthétique et pratique, il permet de prolonger l'expérience visuelle de l'événement tout en offrant une utilité quotidienne, parfait pour transporter ses affaires encombrantes avec style.

L'approche typographique occupe une place centrale, combinant élégance et chaos pour retranscrire l'univers atypique et énergique de l'événement. Ce mélange permet de créer une identité visuelle à la fois saisissante et cohérente avec l'esprit du collectif.

Ce projet fictif m'a offert l'occasion de fusionner créativité artistique et rigueur technique pour concevoir une identité visuelle forte, pensée pour s'adapter harmonieusement à différents supports tout en proposant des objets uniques et mémorables.`;

export default function Rave99Page() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const THUMB_SIZE = 136;

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
  const descriptionLines = fullDescription.split('\n');
  const previewDescription = descriptionLines.slice(0, 3).join('\n');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    mouseY.set((e.clientY - centerY) / (rect.height / 2));
    mouseX.set((e.clientX - centerX) / (rect.width / 2));
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
    enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 1000 : -1000, opacity: 0 }),
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
                  animate={{ x: 0, opacity: 1, scale: isHovered ? 1.05 : 1 }}
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
                    alt={`Rave 99 - ${currentIllustration.format}`}
                    className="w-full h-auto"
                  onClick={() => setLightboxOpen(true)}
                  />
                </motion.div>
              </AnimatePresence>

              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

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
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 800, fontStyle: 'italic' }}
            >
              Rave 99
            </h1>

            <h2
              className="text-2xl mb-8"
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
            >
              Graphisme • Typographie • Direction Artistique • Évènement Techno
            </h2>

            <div className="mb-12">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIllustration.id}
                  className="text-2xl mb-6"
                  style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 700 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentIllustration.format}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mb-12">
              <p
                className="text-base leading-relaxed whitespace-pre-line"
                style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
              >
                {showFullDescription ? fullDescription : previewDescription}
                {!showFullDescription && (
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

            <button
              onClick={() => navigate('/graphisme')}
              className="text-sm underline"
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
            >
              ← Retour au portfolio
            </button>
          </motion.div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="w-full mt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3
            className="text-2xl mb-8 text-center"
            style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 700 }}
          >
            Tous les visuels
          </h3>
          <div className="relative flex items-center gap-3">
            <motion.button
              onClick={() => scrollThumbs('left')}
              className="flex-shrink-0 bg-white border border-gray-200 hover:border-black rounded-full p-2 shadow-sm transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

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
