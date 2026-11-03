import { Link } from 'react-router';
import { CONTACT_EMAIL } from '../lib/contact';

export function Footer() {
  return (
    <footer
      className="border-t border-gray-100 bg-white"
      style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Les Râleurs — Théo Girault</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-black transition-colors">
            {CONTACT_EMAIL}
          </a>
          <Link to="/mentions-legales" className="hover:text-black transition-colors">
            Mentions légales
          </Link>
          <Link to="/cgv" className="hover:text-black transition-colors">
            Conditions générales de vente
          </Link>
        </nav>
      </div>
    </footer>
  );
}
