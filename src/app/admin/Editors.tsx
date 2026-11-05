// Formulaires d'édition d'une illustration et d'un projet.
import { Plus, Trash2 } from 'lucide-react';
import type { Illustration, PrintFormat, Project } from '../content/types';
import {
  Field,
  IconButton,
  ImageField,
  ImageListField,
  PriceInput,
  Section,
  TextArea,
  TextInput,
  Toggle,
} from './fields';
import { slugify } from './images';

function SlugField({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  return (
    <Field label="Adresse de la page" hint="Lettres minuscules, chiffres et tirets. Changer l'adresse casse les anciens liens partagés.">
      <TextInput prefix="lesraleurs.com/" value={value} onChange={(text) => onChange(slugify(text))} />
    </Field>
  );
}

function DangerZone({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => {
          if (confirm(`Supprimer définitivement « ${label} » ? (Pour la retirer temporairement, coche plutôt « Masquer ».)`)) onDelete();
        }}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 size={16} /> Supprimer
      </button>
    </div>
  );
}

export function IllustrationEditor({
  value,
  onChange,
  onDelete,
}: {
  value: Illustration;
  onChange: (next: Illustration) => void;
  onDelete: () => void;
}) {
  const set = (patch: Partial<Illustration>) => onChange({ ...value, ...patch });
  const setCard = (patch: Partial<Illustration['card']>) => onChange({ ...value, card: { ...value.card, ...patch } });
  const formats = value.formats ?? [];
  const setFormat = (index: number, patch: Partial<PrintFormat>) =>
    set({ formats: formats.map((format, i) => (i === index ? { ...format, ...patch } : format)) });

  return (
    <div className="space-y-4">
      <Section title="État">
        <Toggle
          checked={Boolean(value.hidden)}
          onChange={(hidden) => set({ hidden })}
          label="Masquer du site"
          hint="L'œuvre n'apparaît plus nulle part, mais reste ici."
        />
        <Toggle
          checked={Boolean(value.sold)}
          onChange={(sold) => set({ sold })}
          label="Vendue / épuisée"
          hint="Reste visible, mais n'est plus achetable."
        />
      </Section>

      <Section title="Page de l'œuvre">
        <Field label="Titre">
          <TextInput
            value={value.title}
            onChange={(title) =>
              onChange({
                ...value,
                title,
                // Le titre de la carte suit tant qu'il était identique
                card: value.card.title === value.title ? { ...value.card, title } : value.card,
              })
            }
          />
        </Field>
        <SlugField value={value.slug} onChange={(slug) => set({ slug })} />
        <Field label="Type de vente">
          <div className="flex flex-wrap gap-2">
            {(['print', 'series'] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => set({ kind })}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  value.kind === kind ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white'
                }`}
              >
                {kind === 'print' ? 'Une image, plusieurs formats' : 'Une série de visuels'}
              </button>
            ))}
          </div>
        </Field>
        {value.kind === 'series' && (
          <Field label="Sous-titre">
            <TextInput value={value.subtitle ?? ''} onChange={(subtitle) => set({ subtitle })} />
          </Field>
        )}
        <Field label="Texte" hint="Une ligne vide sépare deux paragraphes. Les textes longs sont repliés avec « Voir plus ».">
          <TextArea value={value.description} onChange={(description) => set({ description })} />
        </Field>
      </Section>

      {value.kind === 'print' ? (
        <>
          <Section title="Image">
            <ImageField value={value.image} onChange={(image) => set({ image })} />
          </Section>
          <Section
            title="Formats et prix"
            aside={
              <button
                type="button"
                onClick={() => set({ formats: [...formats, { format: '', label: '', price: 0 }] })}
                className="inline-flex items-center gap-1 text-sm font-medium"
              >
                <Plus size={16} /> Ajouter un format
              </button>
            }
          >
            {formats.length === 0 && <p className="text-sm text-neutral-500">Aucun format : l'œuvre ne pourra pas être achetée.</p>}
            {formats.map((format, index) => (
              <div
                key={index}
                className="grid grid-cols-2 items-end gap-2 rounded-xl border border-neutral-200 p-3 sm:grid-cols-[1fr_1fr_120px_auto_auto] sm:border-0 sm:p-0"
              >
                <Field label="Bouton">
                  <TextInput value={format.format} placeholder="30x40" onChange={(text) => setFormat(index, { format: text })} />
                </Field>
                <Field label="Libellé">
                  <TextInput value={format.label} placeholder="30x40cm" onChange={(label) => setFormat(index, { label })} />
                </Field>
                <Field label="Prix">
                  <PriceInput value={format.price} onChange={(price) => setFormat(index, { price })} />
                </Field>
                <label className="mb-2 flex items-center gap-1 text-xs text-neutral-600" title="Format sélectionné à l'ouverture">
                  <input
                    type="radio"
                    className="accent-black"
                    checked={(value.defaultFormat ?? 0) === index}
                    onChange={() => set({ defaultFormat: index })}
                  />
                  défaut
                </label>
                <IconButton
                  label="Retirer ce format"
                  onClick={() =>
                    set({
                      formats: formats.filter((_, i) => i !== index),
                      defaultFormat: Math.max(0, Math.min(value.defaultFormat ?? 0, formats.length - 2)),
                    })
                  }
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            ))}
          </Section>
        </>
      ) : (
        <>
          <Section title="Prix par visuel">
            <PriceInput value={value.seriesPrice} onChange={(seriesPrice) => set({ seriesPrice })} />
          </Section>
          <Section title="Visuels de la série">
            <ImageListField
              images={value.images ?? []}
              onChange={(images) => set({ images })}
              captionPlaceholder="Nom du visuel"
            />
          </Section>
        </>
      )}

      <Section title="Carte dans la galerie Illustrations">
        <Field label="Titre sur la carte">
          <TextInput value={value.card.title} onChange={(title) => setCard({ title })} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Petite ligne au-dessus du titre" hint="Ex. « Print 30x40 »">
            <TextInput value={value.card.subtitle} onChange={(subtitle) => setCard({ subtitle })} />
          </Field>
          <Field label="Prix affiché sur la carte">
            <PriceInput value={value.card.price} onChange={(price) => setCard({ price })} />
          </Field>
        </div>
        <Field label="Image de la carte">
          <ImageField value={value.card.image} onChange={(image) => setCard({ image })} />
        </Field>
      </Section>

      <DangerZone label={value.title} onDelete={onDelete} />
    </div>
  );
}

export function ProjectEditor({
  value,
  onChange,
  onDelete,
}: {
  value: Project;
  onChange: (next: Project) => void;
  onDelete: () => void;
}) {
  const set = (patch: Partial<Project>) => onChange({ ...value, ...patch });
  const setCard = (patch: Partial<Project['card']>) => onChange({ ...value, card: { ...value.card, ...patch } });

  return (
    <div className="space-y-4">
      <Section title="État">
        <Toggle
          checked={Boolean(value.hidden)}
          onChange={(hidden) => set({ hidden })}
          label="Masquer du site"
          hint="Le projet n'apparaît plus nulle part, mais reste ici."
        />
      </Section>

      <Section title="Page du projet">
        <Field label="Titre">
          <TextInput
            value={value.title}
            onChange={(title) =>
              onChange({ ...value, title, card: value.card.title === value.title ? { ...value.card, title } : value.card })
            }
          />
        </Field>
        <SlugField value={value.slug} onChange={(slug) => set({ slug })} />
        <Field label="Disciplines" hint="Ex. « Graphisme • Typographie • Direction Artistique »">
          <TextInput
            value={value.subtitle}
            onChange={(subtitle) =>
              onChange({
                ...value,
                subtitle,
                card: value.card.subtitle === value.subtitle ? { ...value.card, subtitle } : value.card,
              })
            }
          />
        </Field>
        <Field label="Texte" hint="Une ligne vide sépare deux paragraphes. Les textes longs sont repliés avec « Voir plus ».">
          <TextArea value={value.description} onChange={(description) => set({ description })} rows={10} />
        </Field>
      </Section>

      <Section title="Visuels">
        <p className="text-xs text-neutral-500">L'étoile choisit l'image de couverture affichée dans la page Graphisme.</p>
        <ImageListField
          images={value.images}
          onChange={(images) => set({ images })}
          cover={value.card.image}
          onCoverChange={(image) => setCard({ image })}
        />
      </Section>

      <Section title="Carte dans la page Graphisme">
        <Field label="Titre sur la carte">
          <TextInput value={value.card.title} onChange={(title) => setCard({ title })} />
        </Field>
        <Field label="Catégories">
          <TextInput value={value.card.subtitle} onChange={(subtitle) => setCard({ subtitle })} />
        </Field>
        <Field label="Phrase d'accroche">
          <TextInput value={value.card.teaser ?? ''} onChange={(teaser) => setCard({ teaser })} />
        </Field>
        <Field label="Image de couverture">
          <ImageField value={value.card.image} onChange={(image) => setCard({ image })} />
        </Field>
      </Section>

      <DangerZone label={value.title} onDelete={onDelete} />
    </div>
  );
}
