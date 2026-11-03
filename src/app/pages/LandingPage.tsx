import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LandingIntro } from '../components/LandingIntro';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('landing-scroll-hidden');
    return () => document.documentElement.classList.remove('landing-scroll-hidden');
  }, []);

  const showIllustrations = () => {
    navigate('/illustrations', { replace: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return <LandingIntro onComplete={showIllustrations} />;
}
