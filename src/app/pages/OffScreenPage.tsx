import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useState, useRef, useCallback } from 'react';
import Lightbox from '../components/Lightbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import image1 from '@/imports/Off-SCREEN.jpg';
import image2 from '@/imports/1-1.jpg';
import image3 from '@/imports/2-1.jpg';
import image4 from '@/imports/3-1.jpg';
import image5 from '@/imports/4-1.jpg';
import image6 from '@/imports/5-1.jpg';
import image7 from '@/imports/6-1.jpg';
import image8 from '@/imports/7-1.jpg';
import image9 from '@/imports/8-1.jpg';
import image10 from '@/imports/9-1.jpg';
import image11 from '@/imports/10-1.jpg';
import image12 from '@/imports/11-1.jpg';
import image13 from '@/imports/12-1.jpg';
import image14 from '@/imports/13-1.jpg';
import image15 from '@/imports/14-1.jpg';
import image16 from '@/imports/15-1.jpg';
import image17 from '@/imports/16-1.jpg';
import image18 from '@/imports/17-1.jpg';
import image19 from '@/imports/18-1.jpg';
import image20 from '@/imports/19-1.jpg';
import image21 from '@/imports/20-1.jpg';
import image22 from '@/imports/21-1.jpg';
import image23 from '@/imports/22-1.jpg';
import image24 from '@/imports/23-1.jpg';
import image25 from '@/imports/24-1.jpg';
import image26 from '@/imports/25-1.jpg';
import image27 from '@/imports/26-1.jpg';
import image28 from '@/imports/27-1.jpg';
import image29 from '@/imports/28-1.jpg';
import image30 from '@/imports/29-1.jpg';
import image31 from '@/imports/30-1.jpg';
import image32 from '@/imports/31-1.jpg';
import image33 from '@/imports/32-1.jpg';

const illustrations = [
  { id: 1, image: image1, format: 'Édition' },
  { id: 2, image: image2, format: 'Édition' },
  { id: 3, image: image3, format: 'Édition' },
  { id: 4, image: image4, format: 'Édition' },
  { id: 5, image: image5, format: 'Édition' },
  { id: 6, image: image6, format: 'Édition' },
  { id: 7, image: image7, format: 'Édition' },
  { id: 8, image: image8, format: 'Édition' },
  { id: 9, image: image9, format: 'Édition' },
  { id: 10, image: image10, format: 'Édition' },
  { id: 11, image: image11, format: 'Édition' },
  { id: 12, image: image12, format: 'Édition' },
  { id: 13, image: image13, format: 'Édition' },
  { id: 14, image: image14, format: 'Édition' },
  { id: 15, image: image15, format: 'Édition' },
  { id: 16, image: image16, format: 'Édition' },
  { id: 17, image: image17, format: 'Édition' },
  { id: 18, image: image18, format: 'Édition' },
  { id: 19, image: image19, format: 'Édition' },
  { id: 20, image: image20, format: 'Édition' },
  { id: 21, image: image21, format: 'Édition' },
  { id: 22, image: image22, format: 'Édition' },
  { id: 23, image: image23, format: 'Édition' },
  { id: 24, image: image24, format: 'Édition' },
  { id: 25, image: image25, format: 'Édition' },
  { id: 26, image: image26, format: 'Édition' },
  { id: 27, image: image27, format: 'Édition' },
  { id: 28, image: image28, format: 'Édition' },
  { id: 29, image: image29, format: 'Édition' },
  { id: 30, image: image30, format: 'Édition' },
  { id: 31, image: image31, format: 'Édition' },
  { id: 32, image: image32, format: 'Édition' },
  { id: 33, image: image33, format: 'Édition' },
];

const fullDescription = `Comment l'environnement peut-il agir et interagir avec l'affiche?

Après ma dernière année de bachelier, une question m'a habité : et si je m'éloignais du papier, support pourtant central du graphisme, pour tout reconstruire à zéro ? Cette curiosité m'a mené vers le Rhodoid, une matière translucide choisie après réflexion — praticité, coût, possibilités d'impression et d'exploitation.

Mon projet de master explore une question centrale : comment l'environnement peut-il interagir avec l'affiche ? Pour y répondre, j'ai mené une étude ethnographique sur la place du Mont des Arts, à Bruxelles — observation des passages, des usages, de l'architecture et de l'histoire du lieu. Cette immersion a nourri mes choix visuels, sonores et d'installation dans l'espace public.

Plutôt que d'apporter des réponses fermées, mes affiches cherchent à ouvrir le débat et à provoquer l'échange. Au fil du projet, la performance s'est invitée dans ma pratique graphique, jusqu'à cette question qui clôture la démarche : peut-on parler de performance graphique ?`;

export default function OffScreenPage() {
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
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), { stiffness: 100, damping: 15 });
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), { stiffness: 100, damping: 15 });

  const currentIllustration = illustrations[currentIndex];
  const descriptionLines = fullDescription.split('\n');
  const previewDescription = descriptionLines.slice(0, 3).join('\n');

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
                    alt={`Off-Scr] [n | Mémoire - ${currentIllustration.format}`}
                    className="w-full h-auto"
                  onClick={() => setLightboxOpen(true)}
                  />
                </motion.div>
              </AnimatePresence>

              {illustrations.length > 1 && (
                <>
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
                </>
              )}

              {illustrations.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {illustrations.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => { setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
                      className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-black' : 'w-2 bg-gray-300'}`}
                    />
                  ))}
                </div>
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
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 800, fontStyle: 'italic' }}
            >
              Off-Scr] [n | Mémoire
            </h1>

            <h2
              className="text-2xl mb-8"
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
            >
              Édition Graphique • Photographie • Graphisme
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

            {/* Description */}
            <div className="mb-12">
              <p
                className="text-base leading-relaxed whitespace-pre-line"
                style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
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
      {illustrations.length > 1 && (
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
                      <img src={illustration.image} alt={illustration.format} className="w-full h-full object-cover" />
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
      )}

      {lightboxOpen && (
        <Lightbox src={currentIllustration.image} onClose={() => setLightboxOpen(false)} onPrev={prevImage} onNext={nextImage} />
      )}
    </motion.div>
  );
}
