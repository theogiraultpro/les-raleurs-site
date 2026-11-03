import type { ReactNode } from 'react';

// Informations légales de l'éditeur du site.
// Les valeurs vides s'affichent surlignées « à compléter » sur les pages légales :
// il suffit de les remplir ici pour mettre à jour les Mentions légales et les CGV.
export const LEGAL = {
  name: 'Théo Girault',
  brand: 'Les Râleurs',
  status: 'Artiste-auteur',
  siret: '',
  address: '',
  vat: 'TVA non applicable, article 293 B du Code général des impôts',
  mediator: '',
  mediatorUrl: '',
};

export const HOST = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  url: 'https://vercel.com',
};

export function ToFill({ value, label }: { value: string; label: string }) {
  if (value) return <>{value}</>;
  return <mark className="bg-yellow-200 px-1 rounded">[{label} à compléter]</mark>;
}

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <article
        className="max-w-3xl mx-auto px-6 text-gray-800 leading-relaxed [&_h2]:text-2xl [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-black [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_a]:underline"
        style={{ fontFamily: '"aktiv-grotesk-condensed", sans-serif', fontWeight: 400 }}
      >
        <h1
          className="text-5xl md:text-7xl mb-4 tracking-tight leading-none text-black"
          style={{ fontWeight: 800, fontStyle: 'italic' }}
        >
          {title}
        </h1>
        <p className="text-gray-500 mb-12">Dernière mise à jour : {updated}</p>
        {children}
      </article>
    </div>
  );
}
