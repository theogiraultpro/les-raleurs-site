import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useParams, useNavigate, useOutletContext } from 'react-router';
import { useState, useRef } from 'react';
import { ZoomIn, X } from 'lucide-react';
import illustration1 from '@/imports/figma/2470a98a97316dc54d53b1ec8a3e21c965edf1e5.jpg';
import illustration2 from '@/imports/figma/2a4c56ea70238f4af8e8e351ba8231ac88a71428.jpg';
import illustration3 from '@/imports/figma/190a044189a7cdb9948571b0a356d1f10b33a6a4.jpg';
import illustration4 from '@/imports/figma/0c6eed6dd16212d90471d388e4ef5d6151ddbc28.jpg';
import illustration5 from '@/imports/figma/cd977a9c4b23d0b95b2b7c060d15165478a206b0.jpg';
import illustration6 from '@/imports/figma/861fda503d7ddce7bbbdb171c02679a8a66051e8.jpg';
import highQualityImage from '@/imports/figma/d99bfded40bf2564663270e48b1fc6c245cab8c9.jpg';
import festivalHighQuality from '@/imports/figma/festival-hq.jpg';
import hostilesHighQuality from '@/imports/figma/hostiles-hq.jpg';

const products = [
  {
    id: 1,
    name: 'Les Râleurs du Ring',
    price: 35.00,
    format: '40x50',
    image: illustration3,
    highQualityImage: highQualityImage,
    description: `Une illustration explosive capturant l'énergie brute et l'intensité des Râleurs Hostiles. 

Chaque personnage exprime sa propre forme de contestation, créant une mosaïque de visages grinçants et de situations absurdes.

L'œuvre joue sur les contrastes entre humour et agressivité, entre chaos et composition maîtrisée.`,
  },
  {
    id: 2,
    name: 'Les Râleurs en Festival',
    price: 35.00,
    format: '40x50',
    image: illustration4,
    highQualityImage: festivalHighQuality,
    description: `Une scène festive où l'énergie collective des Râleurs atteint son paroxysme.

Entre foule en délire et personnages iconiques, cette illustration capture l'essence même de la fête.

Un univers où le chaos devient beauté, et où chaque râleur trouve sa place dans la symphonie visuelle.`,
  },
  {
    id: 3,
    name: 'Les Méchants Râleurs',
    price: 20.00,
    format: '30x40',
    image: illustration5,
    highQualityImage: hostilesHighQuality,
    description: `Le combat ultime des Râleurs dans une arène où s'affrontent les ego et les caractères.

Une composition dynamique qui célèbre l'esprit de compétition et l'absurdité du conflit.

Chaque coup porté est une expression artistique, chaque grimace un chef-d'œuvre de frustration.`,
  },
  {
    id: 4,
    name: 'Les Râleurs de Paris Est',
    price: 20.00,
    format: '30x40',
    image: illustration2,
    highQualityImage: highQualityImage,
    description: `L'âme du Paris Est capturée à travers les yeux des Râleurs qui l'habitent.

Entre tradition urbaine et modernité grincheuse, cette illustration est un hommage vibrant.

Un portrait collectif où chaque visage raconte une histoire, chaque expression une revendication.`,
  },
  {
    id: 5,
    name: 'Les Râleurs de Teuf',
    price: 35.00,
    format: '40x50',
    image: illustration1,
    highQualityImage: highQualityImage,
    description: `La nuit appartient aux Râleurs qui transforment chaque teuf en œuvre d'art collective.

Bass lourdes, visages déformés par la musique et l'instant présent qui devient éternité.

Une célébration de la culture underground et de l'esprit rebelle qui l'anime.`,
  },
  {
    id: 6,
    name: 'Les Râleurs de Paris Est',
    price: 20.00,
    format: 'Print 20x20',
    image: illustration6,
    highQualityImage: highQualityImage,
    description: `Format carré, impact maximal. Les Râleurs de Paris Est dans leur essence pure.

Une composition équilibrée qui joue sur la symétrie et le contraste des caractères.

Parfait pour compléter une collection ou débuter votre galerie personnelle.`,
  },
];

const printFormats = [
  { name: 'Print 30x40', price: 35.00, format: '30x40', label: '30x40cm' },
  { name: 'Print 40x50', price: 70.00, format: '40x50', label: '40x50cm' },
];

interface OutletContext {
  handleAddToCart: (product: { id: number; name: string; price: number; image: string }) => void;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAddToCart } = useOutletContext<OutletContext>();
  const product = products.find((p) => p.id === Number(id));
  const [selectedFormat, setSelectedFormat] = useState(printFormats[1]); // Default to A3
  const imageRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseY = useMotionValue(0);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), {
    stiffness: 100,
    damping: 15,
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Produit non trouvé</p>
      </div>
    );
  }

  const handleAddToCartClick = () => {
    handleAddToCart({
      id: product.id,
      name: `${product.name} - ${selectedFormat.format}`,
      price: selectedFormat.price,
      image: product.highQualityImage,
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
                src={product.highQualityImage}
                alt={product.name}
                className="w-full h-auto"
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
              .{product.name}
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
              {product.description.split('\n\n').map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base leading-relaxed"
                  style={{
                    fontFamily: '"aktiv-grotesk-condensed", sans-serif',
                    fontWeight: 400,
                  }}
                >
                  {paragraph}
                </p>
              ))}
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
    </motion.div>
  );
}