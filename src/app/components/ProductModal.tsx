import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState } from 'react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    image: string;
  };
  onAddToCart: (product: { id: number; name: string; price: number; image: string }) => void;
}

const printFormats = [
  { name: 'Print 30x40', price: 35.00 },
  { name: 'Print 40x50', price: 70.00 },
];

export function ProductModal({ isOpen, onClose, product, onAddToCart }: ProductModalProps) {
  const [selectedFormat, setSelectedFormat] = useState(printFormats[0]);

  const handleAddToCart = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: selectedFormat.price,
      image: product.image,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Left Side - Image */}
              <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-[80vh]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                />
              </div>

              {/* Right Side - Details */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                <motion.h2
                  className="text-4xl mb-4"
                  style={{
                    fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                    fontWeight: 800,
                    fontStyle: 'normal',
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {product.name}
                </motion.h2>

                <motion.p
                  className="text-gray-600 mb-8"
                  style={{
                    fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                    fontWeight: 400,
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Illustration originale disponible en plusieurs formats d'impression haute qualité.
                </motion.p>

                {/* Format Selection */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3
                    className="text-xl mb-4"
                    style={{
                      fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                      fontWeight: 800,
                    }}
                  >
                    Choisir un format
                  </h3>

                  <div className="space-y-3">
                    {printFormats.map((format) => (
                      <motion.button
                        key={format.name}
                        onClick={() => setSelectedFormat(format)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedFormat.name === format.name
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className="text-lg"
                            style={{
                              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                              fontWeight: 700,
                            }}
                          >
                            {format.name}
                          </span>
                          <span className="text-lg font-medium">
                            {format.price.toFixed(2)} €
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Add to Cart Button */}
                <motion.button
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-4 rounded-full text-lg hover:bg-gray-800 transition-colors"
                  style={{
                    fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                    fontWeight: 700,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Ajouter au panier - {selectedFormat.price.toFixed(2)} €
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
