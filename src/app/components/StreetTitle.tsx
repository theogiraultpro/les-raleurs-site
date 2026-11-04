import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import tag from '@/imports/figma/b754442f94e8c7ceed8a38ab7b6000231d38433e.png';

// Titres de page « street » — trois traitements possibles :
// - affiche  : capitales serrées, double impression rouge décalée et grain de photocopie
// - sticker  : le titre est un autocollant noir collé de travers sur un autocollant rouge
// - cadre    : le mot est si grand qu'il sort de l'écran, le tag Les Râleurs est posé dessus

export type StreetVariant = 'affiche' | 'sticker' | 'cadre';

export const POSTER_RED = '#E8322B';

const display: CSSProperties = {
  fontFamily: '"aktiv-grotesk-condensed", sans-serif',
  fontWeight: 800,
  textTransform: 'uppercase',
};

// Bruit fractal transformé en masque : ronge légèrement les lettres comme une photocopie usée.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 2.9'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>",
)}")`;

const grainMask: CSSProperties = {
  WebkitMaskImage: GRAIN,
  maskImage: GRAIN,
  WebkitMaskSize: '240px 240px',
  maskSize: '240px 240px',
};

interface StreetTitleProps {
  text: string;
  subtitle?: string;
  variant?: StreetVariant;
  as?: 'h1' | 'h2';
}

// Taille adaptée à la longueur du plus long mot, pour qu'il tienne sur la largeur de l'écran.
function fitSize(text: string, perChar: number, max: string) {
  const longest = Math.max(...text.split(/\s+/).map((word) => word.length));
  return `min(${max}, calc((100vw - 3rem) / ${(longest * perChar).toFixed(2)}))`;
}

export function StreetTitle({ text, subtitle, variant = 'affiche', as = 'h1' }: StreetTitleProps) {
  const reduceMotion = useReducedMotion();
  const Heading = as;

  if (variant === 'sticker') {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="relative inline-block">
          <span
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: POSTER_RED, transform: 'rotate(3deg) translate(0.12em, 0.1em)' }}
          />
          <motion.div
            initial={reduceMotion ? false : { scale: 1.25, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: -4, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            style={{ rotate: -4 }}
          >
            <Heading
              className="bg-black text-white px-[0.18em] pt-[0.06em] pb-[0.02em] leading-[0.92] tracking-[-0.01em]"
              style={{ ...display, fontStyle: 'italic', fontSize: fitSize(text, 0.62, '9.5rem') }}
            >
              {text}
            </Heading>
          </motion.div>
        </div>
        {subtitle && (
          <p
            className="inline-block px-3 py-1 text-white text-lg md:text-xl"
            style={{ background: POSTER_RED, fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400, transform: 'rotate(1.5deg)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'cadre') {
    return (
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden">
        <div className="relative">
        <Heading
          className="whitespace-nowrap text-center leading-[0.8] tracking-[-0.03em] select-none"
          style={{ ...display, fontSize: 'clamp(7rem, 31vw, 30rem)', ...grainMask }}
        >
          {text}
        </Heading>
        <img
          src={tag}
          alt=""
          aria-hidden
          className="absolute right-[6%] bottom-[-8%] w-[38vw] max-w-[420px] pointer-events-none"
          style={{ transform: 'rotate(-8deg)', filter: 'invert(27%) sepia(89%) saturate(4400%) hue-rotate(352deg) brightness(95%)' }}
        />
        </div>
        {subtitle && (
          <p
            className="px-6 mt-8 max-w-7xl mx-auto text-lg md:text-xl text-gray-700"
            style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // affiche
  const size: CSSProperties = { fontSize: fitSize(text, 0.6, '13.5rem') };
  return (
    <div className="py-4">
      <div className="relative inline-block" style={{ transform: 'rotate(-1.5deg)' }}>
        {/* Deuxième passage d'encre, légèrement décalé comme une sérigraphie mal calée */}
        <span
          aria-hidden
          className="absolute inset-0 leading-[0.82] tracking-[-0.02em] select-none"
          style={{ ...display, ...size, color: POSTER_RED, transform: 'translate(0.045em, 0.035em)', ...grainMask }}
        >
          {text}
        </span>
        <Heading
          className="relative leading-[0.82] tracking-[-0.02em]"
          style={{ ...display, ...size, color: '#000', mixBlendMode: 'multiply', ...grainMask }}
        >
          {text}
        </Heading>
      </div>
      {subtitle && (
        <p
          className="mt-6 text-lg md:text-2xl max-w-xl"
          style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
