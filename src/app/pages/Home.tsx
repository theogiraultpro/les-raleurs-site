import { motion } from 'motion/react';
import { useNavigate, useOutletContext } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { useContent } from '../content/ContentContext';
import { quickAddFormat } from '../content/pricing';
import type { AddToCart } from '../Root';
import { isPhone } from '../lib/mobile';


export default function Home() {
  const navigate = useNavigate();
  const { visibleIllustrations } = useContent();
  const products = visibleIllustrations.map((item) => ({
    id: item.cartId,
    name: item.card.title,
    price: item.card.price ?? 0,
    image: item.card.image,
    category: item.card.subtitle,
    path: `/${item.slug}`,
    work: item,
  }));
  const { handleAddToCart, handleToggleFavorite, isFavorite } = useOutletContext<{
    handleAddToCart: AddToCart;
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
        className="pt-24 md:pt-48 pb-20 md:pb-24 px-4 md:px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-[18vw] md:text-[10rem] mb-4 md:mb-2 tracking-tight leading-[0.9] md:leading-none"
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
            transition={{ delay: isPhone ? 0 : 0.6, duration: isPhone ? 0.4 : 0.8 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: isPhone ? 0.05 : 0.7 + index * 0.1, duration: isPhone ? 0.35 : 0.5 }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                  onAddToCart={(p) => {
                    const { work } = product;
                    if (work.sold) return;
                    if (work.kind === 'print') {
                      const format = quickAddFormat(work);
                      const chosen = work.formats?.find((f) => f.format === format);
                      if (!chosen) return;
                      handleAddToCart({
                        slug: work.slug,
                        format,
                        name: `${work.title.replace(/^\./, '')} — ${chosen.label || chosen.format}`,
                        price: chosen.price,
                        image: p.image,
                      });
                    } else {
                      handleAddToCart({
                        slug: work.slug,
                        name: `${work.title.replace(/^\./, '')} — visuel au choix`,
                        price: work.seriesPrice ?? p.price,
                        image: p.image,
                      });
                    }
                  }}
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
