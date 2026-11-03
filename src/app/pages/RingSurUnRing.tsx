import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useNavigate, useOutletContext } from 'react-router';
import { useState, useRef } from 'react';
import Lightbox from '../components/Lightbox';
import productImage from '@/imports/a__la_boxe.jpg';

const printFormats = [
  { name: 'Print 30x40', price: 35.00, format: '30x40', label: '30x40cm' },
  { name: 'Print 40x50', price: 70.00, format: '40x50', label: '40x50cm' },
];

interface OutletContext {
  handleAddToCart: (product: { id: number; name: string; price: number; image: string }) => void;
}

export default function RingSurUnRing() {
  const navigate = useNavigate();
  const { handleAddToCart } = useOutletContext<OutletContext>();
  const [selectedFormat, setSelectedFormat] = useState(printFormats[1]); // Default to A3
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const mouseY = useMotionValue(0);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), {
    stiffness: 100,
    damping: 15,
  });

  const handleAddToCartClick = () => {
    handleAddToCart({
      id: 1,
      name: `Les Râleurs du Ring - ${selectedFormat.format}`,
      price: selectedFormat.price,
      image: productImage,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const y = (e.clientY - centerY) / (rect.height / 2);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseY.set(0);
  };

  return (
    <motion.div
      className="min-h-screen px-6 py-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <motion.div
              ref={imageRef}
              className="relative overflow-hidden rounded-[3rem]"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                y: translateY,
                boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.4), 0 20px 40px -10px rgba(0, 0, 0, 0.3)',
              }}
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                mass: 1.5,
              }}
            >
              <motion.img
                src={productImage}
                alt="Les Râleurs du Ring"
                className="w-full h-auto"
                  onClick={() => setLightboxOpen(true)}
              />
            </motion.div>
          </motion.div>

          {/* Right - Details */}
          <motion.div
            className="lg:pt-16"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1
              className="text-6xl mb-4"
              style={{
                fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                fontWeight: 800,
                fontStyle: 'italic',
              }}
            >
              .Les Râleurs du Ring
            </h1>

            <div className="mb-12">
              <p
                className="text-2xl mb-1"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                  fontWeight: 700,
                }}
              >
                Format {selectedFormat.label}
              </p>
              <p
                className="text-3xl"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                  fontWeight: 800,
                }}
              >
                {selectedFormat.price.toFixed(0)}€
              </p>
            </div>

            <div className="mb-12 space-y-6">
              <p
                className="text-base leading-relaxed"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                  fontWeight: 400,
                }}
              >
                Une illustration explosive capturant l'énergie brute et l'intensité des Râleurs Hostiles.
              </p>
              <p
                className="text-base leading-relaxed"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                  fontWeight: 400,
                }}
              >
                Chaque personnage exprime sa propre forme de contestation, créant une mosaïque de visages grinçants et de situations absurdes.
              </p>
              <p
                className="text-base leading-relaxed"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                  fontWeight: 400,
                }}
              >
                L'œuvre joue sur les contrastes entre humour et agressivité, entre chaos et composition maîtrisée.
              </p>
            </div>

            {/* Format Selection */}
            <div className="mb-12">
              <h3
                className="text-xl mb-3"
                style={{
                  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                  fontWeight: 700,
                }}
              >
                Choisir un format
              </h3>

              <div className="flex gap-2">
                {printFormats.map((format) => (
                  <motion.button
                    key={format.name}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-1.5 rounded-full border-2 transition-all text-sm ${
                      selectedFormat.name === format.name
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white hover:border-gray-500'
                    }`}
                    style={{
                      fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                      fontWeight: 700,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {format.format}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCartClick}
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

      {lightboxOpen && (
        <Lightbox src={productImage} onClose={() => setLightboxOpen(false)} />
      )}
    </motion.div>
  );
}
