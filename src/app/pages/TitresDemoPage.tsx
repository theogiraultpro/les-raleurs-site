import { StreetTitle, type StreetVariant } from '../components/StreetTitle';

// Page d'essai (branche de prévisualisation uniquement) : compare les trois traitements de titre.
const VARIANTS: { id: StreetVariant; name: string; idea: string }[] = [
  { id: 'affiche', name: 'A — Affiche sérigraphiée', idea: 'Capitales serrées, double impression rouge décalée, grain de photocopie.' },
  { id: 'sticker', name: 'B — Sticker collé', idea: 'Le titre est un autocollant noir posé de travers sur un rouge.' },
  { id: 'cadre', name: 'C — Plein cadre + tag', idea: 'Le mot déborde de l’écran, ton tag est posé par-dessus en rouge.' },
];

export default function TitresDemoPage() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-24">
      {VARIANTS.map((v) => (
        <section key={v.id} className="border-b border-gray-200 pb-20 mb-16">
          <p className="max-w-7xl mx-auto px-6 mb-8 text-sm text-gray-500" style={{ fontFamily: 'sans-serif' }}>
            <strong className="text-black">{v.name}</strong> — {v.idea}
          </p>
          <div className={`max-w-7xl mx-auto px-6 ${v.id === 'affiche' ? 'text-left' : 'text-center'}`}>
            <StreetTitle variant={v.id} as="h2" text="Les Râleurs" subtitle="Illustrations originales et prints d’art" />
            <div className="h-16" />
            <StreetTitle variant={v.id} as="h2" text="Commissions" subtitle="Donnons vie à vos idées ensemble" />
          </div>
        </section>
      ))}
    </div>
  );
}
