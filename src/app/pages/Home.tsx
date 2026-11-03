import { motion } from 'motion/react';
import { useNavigate, useOutletContext } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import illustration1 from '@/imports/figma/2470a98a97316dc54d53b1ec8a3e21c965edf1e5.jpg';
import illustration2 from '@/imports/figma/2a4c56ea70238f4af8e8e351ba8231ac88a71428.jpg';
import illustrationBoxeur from '@/imports/a__la_boxe.jpg';
import illustrationFestival from '@/imports/festival.jpg';
import illustrationMechant from '@/imports/les_me_chant_ra_leurs.jpg';
import illustration6 from '@/imports/Chill_icon.jpg';
import illustrationMetro from '@/imports/Au_me_tro.jpg';
import illustrationBar from '@/imports/Au_Bar-1.jpg';
import illustrationGraff from '@/imports/graffeurs.jpg';

const products = [
  {
    id: 9,
    name: 'Les Râleurs Dégradent',
    price: 35.00,
    image: illustrationGraff,
    category: 'Print 30x40',
    path: '/graff',
  },
  {
    id: 8,
    name: 'Les Râleurs au Bar',
    price: 70.00,
    image: illustrationBar,
    category: 'Print 40x50',
    path: '/bar',
  },
  {
    id: 7,
    name: 'Les Râleurs du Métro',
    price: 35.00,
    image: illustrationMetro,
    category: 'Print 30x40',
    path: '/metro',
  },
  {
    id: 1,
    name: 'Les Râleurs du Ring',
    price: 35.00,
    image: illustrationBoxeur,
    category: 'Print 30x40',
    path: '/ring',
  },
  {
    id: 2,
    name: 'Les Râleurs en Festival',
    price: 70.00,
    image: illustrationFestival,
    category: 'Print 40x50',
    path: '/festival',
  },
  {
    id: 3,
    name: 'Les Méchants Râleurs',
    price: 35.00,
    image: illustrationMechant,
    category: 'Print 30x40',
    path: '/hostiles',
  },
  {
    id: 4,
    name: 'Les Râleurs de Paris Est',
    price: 35.00,
    image: illustration2,
    category: 'Print 30x40',
    path: '/paris-est',
  },
  {
    id: 5,
    name: 'Les Râleurs de Teuf',
    price: 70.00,
    image: illustration1,
    category: 'Print 40x50',
    path: '/teuf',
  },
  {
    id: 6,
    name: 'Les Râleurs',
    price: 20.00,
    image: illustration6,
    category: 'Print 20x20',
    path: '/raleurs',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { handleAddToCart, handleToggleFavorite, isFavorite } = useOutletContext<{
    handleAddToCart: (p: { id: number; name: string; price: number; image: string }) => void;
    handleToggleFavorite: (item: { id: string; title: string; image: string; type: 'illustration' | 'portfolio'; route: string }) => void;
    isFavorite: (id: string) => boolean;
  }>();

  const handleProductClick = (product: typeof products[0]) => {
    navigate(product.path);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section
        className="pt-48 pb-24 px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-[10rem] mb-2 tracking-tight leading-none"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Les Râleurs
          </motion.h1>
          <motion.p
            className="text-lg text-black max-w-2xl mx-auto"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Illustrations originales et prints d'art • Créations unique et roohhh ça va on à compris
          </motion.p>
        </div>
      </motion.section>

      {/* Products Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <ProductCard
                  {...product}
                  onAddToCart={(p) => handleAddToCart(p)}
                  onToggleFavorite={() => handleToggleFavorite({
                    id: String(product.id),
                    title: product.name,
                    image: product.image,
                    type: 'illustration',
                    route: product.path,
                  })}
                  isFavorite={isFavorite(String(product.id))}
                  onClick={() => handleProductClick(product)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
