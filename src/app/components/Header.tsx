import { ShoppingBag, Instagram, Mail, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import logo from '@/imports/figma/b754442f94e8c7ceed8a38ab7b6000231d38433e.png';
import { CONTACT_EMAIL } from '../lib/contact';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  favoritesCount: number;
  onFavoritesClick: () => void;
}

export function Header({ cartCount, onCartClick, favoritesCount, onFavoritesClick }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="relative flex items-center justify-between">

          <motion.button
            onClick={() => navigate('/')}
            className="block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={logo} alt="Les Râleurs" className="h-12 w-auto" />
          </motion.button>

          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
            <button
              onClick={() => navigate('/illustrations')}
              className="text-base hover:text-gray-600 transition-colors"
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
            >
              Illustrations
            </button>
            <button
              onClick={() => navigate('/graphisme')}
              className="text-base hover:text-gray-600 transition-colors"
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
            >
              Graphisme
            </button>
            <button
              onClick={() => navigate('/commissions')}
              className="text-base hover:text-gray-600 transition-colors"
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
            >
              Commissions
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-base hover:text-gray-600 transition-colors"
              style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <motion.a
              href="https://www.instagram.com/raleurs_/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Instagram size={20} />
            </motion.a>

            <motion.a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label={`Écrire à ${CONTACT_EMAIL}`}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail size={20} />
            </motion.a>

            <motion.button
              className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFavoritesClick}
            >
              <Heart size={20} className={favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''} />
              {favoritesCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {favoritesCount}
                </motion.span>
              )}
            </motion.button>

            <motion.button
              className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </div>

        </div>
      </div>
    </header>
  );
}
