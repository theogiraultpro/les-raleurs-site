import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Heart } from 'lucide-react';
import { useRef, useState } from 'react';

interface PortfolioCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  onClick: () => void;
  onToggleFavorite?: (item: { id: string; title: string; image: string; type: 'portfolio'; route: string }) => void;
  isFavorite?: boolean;
  route?: string;
}

export function PortfolioCard({ 
  id, 
  name, 
  description, 
  image, 
  category, 
  onClick, 
  onToggleFavorite,
  isFavorite = false,
  route = ''
}: PortfolioCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 100,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 100,
    damping: 15,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite({
        id,
        title: name,
        image,
        type: 'portfolio',
        route
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      data-cursor-card
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
        style={{
          rotateX,
          rotateY,
        }}
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Image Container with Liquid Effect */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <motion.div
            className="absolute inset-0"
            animate={isHovered ? {
              scale: [1, 1.15, 1.1],
              borderRadius: ["0%", "40%", "35%"],
            } : {
              scale: 1,
              borderRadius: "0%",
            }}
            transition={{
              duration: 0.8,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
          >
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Gradient overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2))'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Like Button */}
          <motion.button
            className={`absolute top-4 right-4 rounded-full p-3 shadow-lg ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white'
            }`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isHovered ? 1 : 0,
              opacity: isHovered ? 1 : 0,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={handleLike}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Project Info */}
        <div className="p-6">
          <motion.p
            className="text-xs text-gray-500 uppercase tracking-wider mb-2"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 800,
            }}
            animate={{ opacity: isHovered ? 0.7 : 1 }}
          >
            {category}
          </motion.p>
          <h3
            className="text-2xl mb-3"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'normal',
            }}
          >
            {name}
          </h3>
          <p 
            className="text-sm text-gray-600"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 400,
            }}
          >
            {description}
          </p>
        </div>
      </motion.div>

      {/* Liquid Blob Effect */}
      <motion.div
        className="absolute -inset-4 rounded-full blur-3xl -z-10"
        style={{
          background: 'linear-gradient(to bottom right, #f3e8ff, #fce7f3, #dbeafe)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1.2 : 0.8,
        }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
    </motion.div>
  );
}