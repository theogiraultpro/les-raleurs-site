// Page « Qui suis-je ? » : présentation de Théo Girault pour les visiteurs.
// ESSAI : visible seulement sur le site d'essai (voir lib/testSite.ts, « essai-presentation »).
// Textes : premier jet tiré de la bio du site et du texte de la série Les Râleurs, à corriger par Théo.
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useContent } from '../content/ContentContext';
import { responsiveImage } from '../lib/image';

const TITLE_FONT = { fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 800, fontStyle: 'italic' } as const;
const BODY_FONT = { fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 } as const;

/** Les trois volets du travail, chacun menant à sa page. */
const SECTIONS = [
  {
    title: 'Les Râleurs',
    text: [
      "Des personnages loufoques et satiriques, nés d'une tache de couleur posée sans réflexion. Dans ces formes accidentelles, des visages apparaissent, se déforment et s'assemblent jusqu'à former une foule bruyante, vivante, parfois grotesque.",
      "Ils râlent dans le métro, refont le monde au comptoir et dansent jusqu'à l'aube : un miroir déformé de nos comportements parigots. Chaque illustration existe en print d'art, à commander en ligne.",
    ],
    cta: 'Voir les illustrations',
    to: '/illustrations',
  },
  {
    title: 'Graphisme',
    text: [
      "Identités visuelles, affiches d'événements, éditions photographiques et direction artistique : un travail entre art urbain et rigueur typographique suisse.",
    ],
    cta: 'Voir les projets',
    to: '/graphisme',
  },
  {
    title: 'Sur mesure',
    text: [
      'Illustration personnalisée, portrait, visuel commercial ou collaboration événementielle : parlez-moi de votre projet, je vous réponds avec une proposition et un devis.',
    ],
    cta: 'Faire une demande',
    to: '/commissions',
  },
];

export default function PresentationPage() {
  const navigate = useNavigate();
  const { visibleIllustrations } = useContent();
  const go = (to: string) => {
    navigate(to);
    window.scrollTo(0, 0);
  };
  // Visuel d'accompagnement : une illustration des Râleurs (à remplacer par une photo de Théo si souhaité).
  const portrait = visibleIllustrations.find((item) => item.slug === 'bar') ?? visibleIllustrations[0];

  return (
    <div className="pt-24 md:pt-40 pb-20">
      {/* En-tête */}
      <motion.section
        className="px-4 md:px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-[16vw] md:text-[7.5rem] lg:text-[9rem] tracking-tight leading-[0.9] md:leading-none mb-4" style={TITLE_FONT}>
          Qui suis-je{'\u00A0'}?
        </h1>
        <p className="text-lg text-black max-w-2xl mx-auto" style={BODY_FONT}>
          Théo Girault • Graphiste, typographe et illustrateur
        </p>
      </motion.section>

      {/* Présentation */}
      <section className="px-4 md:px-6 mt-16 md:mt-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {portrait && (
            <motion.figure
              className="overflow-hidden rounded-2xl bg-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <img
                {...responsiveImage(portrait.card.image, '(min-width: 768px) 50vw, 100vw', 960)}
                alt={portrait.card.title}
                className="w-full h-auto select-none"
                draggable={false}
              />
            </motion.figure>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <h2 className="text-4xl md:text-5xl mb-6 leading-none" style={TITLE_FONT}>
              Bonjour, moi c'est Théo.
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-black" style={BODY_FONT}>
              <p>
                Je suis graphiste, typographe et illustrateur. Je dessine les Râleurs, des personnages qui râlent,
                rient et font la fête comme tout bon Parisien, et je conçois des identités visuelles, des affiches et
                des éditions.
              </p>
              <p>
                Mon travail mêle l'instinct du dessin et la rigueur de la composition : un chaos volontaire, structuré
                par des gammes de couleurs choisies à l'avance.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Les trois volets */}
      <section className="px-4 md:px-6 mt-20 md:mt-32">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              className="flex flex-col border-t-2 border-black pt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h2 className="text-3xl md:text-4xl mb-4 leading-none" style={TITLE_FONT}>
                {section.title}
              </h2>
              <div className="space-y-3 text-base leading-relaxed text-black flex-1" style={BODY_FONT}>
                {section.text.map((paragraph) => (
                  <p key={paragraph.slice(0, 20)}>{paragraph}</p>
                ))}
              </div>
              <button
                onClick={() => go(section.to)}
                className="mt-6 self-start px-6 py-3 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                style={BODY_FONT}
              >
                {section.cta} →
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <motion.section
        className="px-4 md:px-6 mt-20 md:mt-32 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-2xl md:text-3xl mb-6" style={TITLE_FONT}>
          Une question, une envie de collaboration ?
        </p>
        <button
          onClick={() => go('/about')}
          className="px-8 py-3 rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors"
          style={BODY_FONT}
        >
          Me contacter
        </button>
      </motion.section>
    </div>
  );
}
