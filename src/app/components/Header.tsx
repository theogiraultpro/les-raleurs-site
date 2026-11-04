import { ShoppingBag, Instagram, Mail, Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import logo from '@/imports/figma/b754442f94e8c7ceed8a38ab7b6000231d38433e.png';
import { CONTACT_EMAIL } from '../lib/contact';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  favoritesCount: number;
  onFavoritesClick: () => void;
}

const NAV_LINKS = [
  { label: 'Illustrations', to: '/illustrations' },
  { label: 'Graphisme', to: '/graphisme' },
  { label: 'Commissions', to: '/commissions' },
  { label: 'Contact', to: '/about' },
];

const INSTAGRAM_URL = 'https://www.instagram.com/raleurs_/';
const navFont = { fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 };

export function Header({ cartCount, onCartClick, favoritesCount, onFavoritesClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Le menu mobile se ferme à chaque changement de page.
  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  // Pas de défilement de la page derrière le menu ouvert.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const iconButton = 'relative p-2 hover:bg-gray-50 rounded-full transition-colors';

  return (
    <>
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="relative flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            className="block shrink-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Les Râleurs — accueil"
          >
            <img src={logo} alt="Les Râleurs" className="h-10 md:h-12 w-auto" />
          </motion.button>

          {/* Menu ordinateur */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="text-base hover:text-gray-600 transition-colors"
                style={navFont}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-4">
            <motion.a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${iconButton} hidden md:block`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Instagram @raleurs_"
            >
              <Instagram size={20} />
            </motion.a>

            <motion.a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`${iconButton} hidden md:block`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Écrire à ${CONTACT_EMAIL}`}
            >
              <Mail size={20} />
            </motion.a>

            <motion.button
              className={iconButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFavoritesClick}
              aria-label="Favoris"
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
              className={iconButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              aria-label="Panier"
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

            {/* Bouton menu mobile */}
            <button
              className={`${iconButton} md:hidden`}
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Menu mobile, en dehors de l'en-tête pour couvrir tout l'écran */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="md:hidden fixed left-0 right-0 top-[65px] bottom-0 z-50 bg-white flex flex-col px-6 pt-8 pb-10 overflow-y-auto"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link, index) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index }}
                >
                  <button
                    onClick={() => navigate(link.to)}
                    className="text-5xl leading-tight tracking-tight text-left w-full py-1"
                    style={{
                      fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                      fontWeight: 800,
                      fontStyle: location.pathname === link.to ? 'italic' : 'normal',
                    }}
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-4 text-lg" style={navFont}>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <Instagram size={22} /> @raleurs_
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3">
                <Mail size={22} /> {CONTACT_EMAIL}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
