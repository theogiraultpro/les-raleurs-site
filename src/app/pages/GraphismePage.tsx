import { motion } from 'motion/react';
import { useNavigate, useOutletContext } from 'react-router';
import { PortfolioCard } from '../components/PortfolioCard';
import { useContent } from '../content/ContentContext';
import { isPhone } from '../lib/mobile';


export default function GraphismePage() {
  const navigate = useNavigate();
  const { visibleProjects } = useContent();
  const projects = visibleProjects.map((item) => ({
    id: item.slug,
    name: item.card.title,
    description: item.card.teaser ?? '',
    image: item.card.image,
    category: item.card.subtitle,
    path: `/${item.slug}`,
  }));
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
        className="pt-24 md:pt-48 pb-20 md:pb-24 px-4 md:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-[18.5vw] md:text-[10rem] mb-4 md:mb-2 tracking-tight leading-[0.9] md:leading-none"
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
            transition={{ delay: isPhone ? 0.2 : 0.6, duration: isPhone ? 0.4 : 0.8 }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isPhone ? 0.25 : 0.7 + index * 0.1, duration: isPhone ? 0.35 : 0.5 }}
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