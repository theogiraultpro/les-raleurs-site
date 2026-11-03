import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useState, useRef } from 'react';
import Lightbox from '../components/Lightbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import image1 from '@/imports/Friche_1.jpg';
import image2 from '@/imports/Friche_2.jpg';
import image3 from '@/imports/Friche_3.jpg';
import image4 from '@/imports/Friche_4.jpg';
import image5 from '@/imports/Friche_5.jpg';
import image6 from '@/imports/Friche_6.jpg';

const illustrations = [
  {
    id: 1,
    image: image1,
    format: 'Couverture de l\'édition',
  },
  {
    id: 2,
    image: image2,
    format: 'Sommaire et page introductive',
  },
  {
    id: 3,
    image: image3,
    format: 'Double page - Banc et chemin',
  },
  {
    id: 4,
    image: image4,
    format: 'Double page - Bâtiment et végétation',
  },
  {
    id: 5,
    image: image5,
    format: 'Double page - Structure abandonnée',
  },
  {
    id: 6,
    image: image6,
    format: 'Double page - Panneau dans la nature',
  },
];

const fullDescription = `Cette édition explore la froideur du paysage où le temps se fige avant de se transformer. Elle fige à travers des photos le retrait de l'homme laissant place à la lente réappropriation du territoire par la nature. 

Je vous invite, à travers cette zone délaissée, à suivre les traces d'un espace abandonné qui reprend vie. Un paysage brut et froid, mais profondément vivant, où la nature s'infiltre, résiste et se réinvente à partir des vestiges humains.`;

export default function SolvayPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
                    alt={`La Friche de Solvay - ${currentIllustration.format}`}
                    className="w-full h-auto"
                  onClick={() => setLightboxOpen(true)}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons - Only show if more than 1 image */}
              {illustrations.length > 1 && (
                <>
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
                </>
              )}
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
              La Friche de Solvay
            </h1>

            <h2
              className="text-2xl mb-8"
              style={{
                fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                fontWeight: 400,
              }}
            >
              Édition Graphique • Photographie • Urbex
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
                {fullDescription}
              </p>
            </div>

            <button
              onClick={() => navigate('/graphisme')}
              className="text-sm underline"
              style={{
                fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                fontWeight: 400,
              }}
            >
              ← Retour au portfolio
            </button>
          </motion.div>
        </div>
      </div>

      {/* Thumbnail Gallery - Only show if more than 1 image */}
      {illustrations.length > 1 && (
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
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide pb-8 pt-2 -mx-6 px-6">
                <div className="flex gap-3 px-2 justify-center">
                  {illustrations.map((illustration, index) => (
                    <motion.button
                      key={illustration.id}
                      onClick={() => {
                        setDirection(index > currentIndex ? 1 : -1);
                        setCurrentIndex(index);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="relative flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`w-32 h-32 rounded-xl overflow-hidden transition-all ${
                          index === currentIndex
                            ? 'ring-4 ring-red-500 shadow-xl'
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
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"
                          layoutId="activeIndicator"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <Lightbox src={currentIllustration.image} onClose={() => setLightboxOpen(false)} onPrev={prevImage} onNext={nextImage} />
      )}
    </motion.div>
  );
}