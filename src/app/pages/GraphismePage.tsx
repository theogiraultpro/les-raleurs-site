import { motion } from 'motion/react';
import { useNavigate, useOutletContext } from 'react-router';
import { PortfolioCard } from '../components/PortfolioCard';
import offScreenImage from '@/imports/Off-SCREEN_2.jpg';
import rave99Image from '@/imports/figma/d99bfded40bf2564663270e48b1fc6c245cab8c9.jpg';
import ladalEvent2Image from '@/imports/Affiche_event_2.jpg';
import attunedImage from '@/imports/figma/c1209584a8dd70857157d1ba007ec78b4d8d8745.jpg';
import tnfImage from '@/imports/N_5-1.jpg';
import ligne81Image from '@/imports/figma/7a56d0bf846e7101cf8a0885ffef3566428620dd.jpg';
import ladalEvent1Image from '@/imports/figma/a623dc3cde04ed12dc40d07baebbbed0cfb4c264.jpg';
import solvayImage from '@/imports/figma/48a13cc1101a6d500bf61add489ed5e9131ce42e.jpg';
import illustration1 from '@/imports/figma/2470a98a97316dc54d53b1ec8a3e21c965edf1e5.jpg';
import illustration2 from '@/imports/figma/2a4c56ea70238f4af8e8e351ba8231ac88a71428.jpg';
import illustration3 from '@/imports/figma/190a044189a7cdb9948571b0a356d1f10b33a6a4.jpg';
import illustration4 from '@/imports/figma/0c6eed6dd16212d90471d388e4ef5d6151ddbc28.jpg';
import illustration5 from '@/imports/figma/cd977a9c4b23d0b95b2b7c060d15165478a206b0.jpg';
import illustration6 from '@/imports/figma/861fda503d7ddce7bbbdb171c02679a8a66051e8.jpg';

const projects = [
  {
    id: 'off-screen',
    name: 'Off-Scr] [n | Mémoire',
    description: "Comment l'environnement peut-il agir et interagir avec l'affiche?",
    image: offScreenImage,
    category: 'Édition Graphique • Photographie • Graphisme',
    path: '/off-screen',
  },
  {
    id: 'rave-99',
    name: 'Rave 99',
    description: 'Création graphique pour un projet avec le collectif 999999999',
    image: rave99Image,
    category: 'Graphisme • Typographie • Direction Artistique',
    path: '/rave-99',
  },
  {
    id: 'ladal-event-2',
    name: 'Ladal Event 2',
    description: 'Création graphique pour le deuxième de notre Collectif Ladale',
    image: ladalEvent2Image,
    category: 'Graphisme • Direction Artistique',
    path: '/ladal-event-2',
  },
  {
    id: 'collectif-attuned',
    name: 'Collectif Attuned',
    description: 'Création graphique pour l’événement du collectif Attuned et Création du Logo',
    image: attunedImage,
    category: 'Graphisme • Communication Visuelle',
    path: '/collectif-attuned',
  },
  {
    id: 'tnf',
    name: 'TNF',
    description: 'Création graphique pour The North Face et sport de Montagne',
    image: tnfImage,
    category: 'Graphisme • Communication Visuelle • Montagne',
    path: '/tnf',
  },
  {
    id: 'ligne-81',
    name: 'Fixe le Mouvement',
    description: 'Création éditorial graphique autour du mouvement et de la photographie',
    image: ligne81Image,
    category: 'Édition Graphique • Photographie • Mouvement',
    path: '/ligne-81',
  },
  {
    id: 'ladal-event-1',
    name: 'Ladal Event 1',
    description: 'Création graphique pour le premier événement du collectif Ladale + Logo',
    image: ladalEvent1Image,
    category: 'Graphisme • Communication Visuelle • Événementiel',
    path: '/ladal-event-1',
  },
  {
    id: 'la-friche-de-solvay',
    name: 'La Friche de Solvay',
    description: 'Découverture d’un lieu abandonner où la nature reprend ses droits',
    image: solvayImage,
    category: 'Édition Graphique • Photographie • Urbex',
    path: '/la-friche-de-solvay',
  },
];

export default function GraphismePage() {
  const navigate = useNavigate();
  const { handleToggleFavorite, isFavorite } = useOutletContext<{
    handleToggleFavorite: (item: any) => void;
    isFavorite: (id: string) => boolean;
  }>();

  const handleProjectClick = (project: typeof projects[0]) => {
    navigate(project.path);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section
        className="pt-24 md:pt-32 pb-20 md:pb-24 px-4 md:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-[clamp(4rem,18.5vw,13rem)] mb-4 tracking-tight leading-[0.9]"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Graphisme
          </motion.h1>
          <motion.p
            className="text-lg text-black max-w-2xl mx-auto"
            style={{
              fontFamily: '"aktiv-grotesk-condensed", sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Créations graphiques • Identités visuelles • Direction Artistique
          </motion.p>
        </div>
      </motion.section>

      {/* Portfolio Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <PortfolioCard
                  {...project}
                  onClick={() => handleProjectClick(project)}
                  route={project.path}
                  isFavorite={isFavorite(project.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}