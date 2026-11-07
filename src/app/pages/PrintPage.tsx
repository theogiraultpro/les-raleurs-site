import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { canHover } from '../lib/mobile';
import { useNavigate, useOutletContext } from 'react-router';
import { useState, useRef } from 'react';
import Lightbox from '../components/Lightbox';
import { Description } from '../components/Description';
import type { Illustration } from '../content/types';
import { responsiveImage } from '../lib/image';

const font = '"aktiv-grotesk-condensed", sans-serif';

import type { AddToCart } from '../Root';

interface OutletContext {
  handleAddToCart: AddToCart;
}

/** Fiche d'une illustration vendue en print (une image, plusieurs formats). */
export default function PrintPage({ illustration }: { illustration: Illustration }) {
  const navigate = useNavigate();
  const { handleAddToCart } = useOutletContext<OutletContext>();
  const formats = illustration.formats ?? [];
  const image = illustration.image ?? illustration.card.image;
  const [selectedFormat, setSelectedFormat] = useState(
    formats[illustration.defaultFormat ?? 0] ?? formats[0],
  );
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const mouseY = useMotionValue(0);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), {
    stiffness: 100,
    damping: 15,
  });

  const handleAddToCartClick = () => {
    if (!selectedFormat || illustration.sold) return;
    handleAddToCart({
      slug: illustration.slug,
      format: selectedFormat.format,
      name: `${illustration.title.replace(/^\./, '')} — ${selectedFormat.label || selectedFormat.format}`,
      price: selectedFormat.price,
      image,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    mouseY.set((e.clientY - centerY) / (rect.height / 2));
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
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <motion.div
              ref={imageRef}
              className="relative overflow-hidden rounded-[3rem]"
              onMouseMove={canHover ? handleMouseMove : undefined}
              onMouseEnter={() => canHover && setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                y: translateY,
                boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.4), 0 20px 40px -10px rgba(0, 0, 0, 0.3)',
              }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 1.5 }}
            >
              <motion.img
                {...responsiveImage(image, '(min-width: 1024px) 600px, 100vw')}
                alt={illustration.title}
                className="w-full h-auto"
                onClick={() => setLightboxOpen(true)}
              />
            </motion.div>
          </motion.div>

          {/* Détails */}
          <motion.div
            className="lg:pt-16"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-6xl mb-4" style={{ fontFamily: font, fontWeight: 800, fontStyle: 'italic' }}>
              {illustration.title}
            </h1>

            {selectedFormat && (
              <div className="mb-12">
                <p className="text-2xl mb-1" style={{ fontFamily: font, fontWeight: 700 }}>
                  Format {selectedFormat.label}
                </p>
                <p className="text-3xl" style={{ fontFamily: font, fontWeight: 800 }}>
                  {illustration.sold ? 'Vendu' : `${selectedFormat.price.toFixed(0)}€`}
                </p>
              </div>
            )}

            <Description text={illustration.description} />

            {formats.length > 0 && !illustration.sold && (
              <div className="mb-12">
                <h3 className="text-xl mb-3" style={{ fontFamily: font, fontWeight: 700 }}>
                  Choisir un format
                </h3>
                <div className="flex gap-2">
                  {formats.map((format) => (
                    <motion.button
                      key={format.format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-1.5 rounded-full border-2 transition-all text-sm ${
                        selectedFormat?.format === format.format
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white hover:border-gray-500'
                      }`}
                      style={{ fontFamily: font, fontWeight: 700 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {format.format}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {!illustration.sold && (
              <motion.button
                onClick={handleAddToCartClick}
                className="w-full bg-white text-black py-2 rounded-full text-base border-2 border-black hover:bg-black hover:text-white transition-colors mb-6"
                style={{ fontFamily: font, fontWeight: 700, fontStyle: 'italic' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                T'y es un bon à le mettre<br />dans le panier comme ça le sang
              </motion.button>
            )}

            <button
              onClick={() => navigate('/illustrations')}
              className="text-sm underline block"
              style={{ fontFamily: font, fontWeight: 400 }}
            >
              ← Retour à la galerie
            </button>
          </motion.div>
        </div>
      </div>

      {lightboxOpen && <Lightbox src={image} onClose={() => setLightboxOpen(false)} />}
    </motion.div>
  );
}
