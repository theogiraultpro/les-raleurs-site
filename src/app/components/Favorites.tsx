import { motion, AnimatePresence } from 'motion/react';
import { X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { responsiveImage } from '../lib/image';

interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  type: 'illustration' | 'portfolio';
  route: string;
}

interface FavoritesProps {
  isOpen: boolean;
  onClose: () => void;
  items: FavoriteItem[];
  onRemoveFavorite: (id: string) => void;
}

export function Favorites({ isOpen, onClose, items, onRemoveFavorite }: FavoritesProps) {
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={24} className="fill-red-500 text-red-500" />
                <h2
                  className="text-2xl"
                  style={{
                    fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                    fontWeight: 800,
                  }}
                >
                  MES FAVORIS
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart size={64} className="text-gray-300 mb-4" />
                  <p
                    className="text-xl text-gray-400 mb-2"
                    style={{
                      fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                      fontWeight: 800,
                    }}
                  >
                    Aucun favori
                  </p>
                  <p
                    className="text-gray-500"
                    style={{
                      fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                      fontWeight: 400,
                    }}
                  >
                    Ajoutez vos projets préférés ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative group cursor-pointer bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      onClick={() => handleNavigate(item.route)}
                    >
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            {...responsiveImage(item.image, '96px', 384)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3
                            className="text-lg mb-1"
                            style={{
                              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                              fontWeight: 800,
                            }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm text-gray-500 capitalize"
                            style={{
                              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                              fontWeight: 400,
                            }}
                          >
                            {item.type === 'illustration' ? 'Illustration' : 'Graphisme'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(item.id);
                          }}
                          className="p-2 hover:bg-white rounded-full transition-colors self-center"
                        >
                          <Heart size={20} className="fill-red-500 text-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100">
                <p
                  className="text-center text-gray-500"
                  style={{
                    fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                    fontWeight: 400,
                  }}
                >
                  {items.length} {items.length === 1 ? 'favori' : 'favoris'}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
