// Champs de formulaire de la page /admin.
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2, Upload } from 'lucide-react';
import type { GalleryImage } from '../content/types';
import { uploadImage } from './images';

export const StorageContext = createContext<'blob' | 'local' | 'none'>('none');

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] outline-none focus:border-black focus:ring-2 focus:ring-black/10';

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
        {aside}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  prefix,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
}) {
  if (prefix) {
    return (
      <div className="flex items-stretch overflow-hidden rounded-lg border border-neutral-300 bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10">
        <span className="flex items-center bg-neutral-100 px-3 text-sm text-neutral-500">{prefix}</span>
        <input
          className="min-w-0 flex-1 px-3 py-2 text-[15px] outline-none"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }
  return (
    <input className={inputClass} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
  );
}

export function TextArea({ value, onChange, rows = 8 }: { value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <textarea
      className={`${inputClass} leading-relaxed`}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function PriceInput({ value, onChange }: { value: number | undefined; onChange: (value: number) => void }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-neutral-300 bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10">
      <input
        type="number"
        min={0}
        step={1}
        inputMode="decimal"
        className="min-w-0 flex-1 px-3 py-2 text-[15px] outline-none"
        value={Number.isFinite(value) ? String(value) : ''}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="flex items-center bg-neutral-100 px-3 text-sm text-neutral-500">€</span>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-black"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-neutral-800">{label}</span>
        {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
      </span>
    </label>
  );
}

function useUploader() {
  const storage = useContext(StorageContext);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadAll = async (files: File[]): Promise<string[]> => {
    setError(null);
    setBusy(files.length);
    const urls: string[] = [];
    for (const file of files) {
      try {
        urls.push(await uploadImage(file, storage));
      } catch (err) {
        setError((err as Error).message);
      }
      setBusy((count) => count - 1);
    }
    return urls;
  };

  return { busy, error, uploadAll };
}

function FileButton({
  label,
  multiple,
  busy,
  onFiles,
}: {
  label: string;
  multiple?: boolean;
  busy: number;
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy > 0}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:border-black disabled:opacity-60"
      >
        {busy > 0 ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {busy > 0 ? `Envoi… (${busy})` : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

/** Une image unique (illustration principale, couverture). */
export function ImageField({ value, onChange }: { value: string | undefined; onChange: (url: string) => void }) {
  const { busy, error, uploadAll } = useUploader();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="text-neutral-400" />
        )}
      </div>
      <div className="space-y-2">
        <FileButton
          label={value ? "Remplacer l'image" : 'Choisir une image'}
          busy={busy}
          onFiles={async (files) => {
            const [url] = await uploadAll(files.slice(0, 1));
            if (url) onChange(url);
          }}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

/** Liste d'images avec légendes : ajout multiple, ordre, suppression, couverture. */
export function ImageListField({
  images,
  onChange,
  cover,
  onCoverChange,
  captionPlaceholder,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  cover?: string;
  onCoverChange?: (url: string) => void;
  captionPlaceholder?: string;
}) {
  const { busy, error, uploadAll } = useUploader();

  const update = (index: number, patch: Partial<GalleryImage>) =>
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const remove = (index: number) => {
    if (!confirm('Retirer cette image ?')) return;
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {images.length === 0 && <p className="text-sm text-neutral-500">Aucune image pour l'instant.</p>}
      <ul className="space-y-2">
        {images.map((image, index) => (
          <li key={`${image.src}-${index}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 p-2 sm:flex-nowrap">
            <img src={image.src} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-neutral-200 object-cover" loading="lazy" />
            <input
              className="min-w-0 flex-1 basis-40 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-black"
              value={image.caption}
              placeholder={captionPlaceholder ?? 'Légende'}
              onChange={(event) => update(index, { caption: event.target.value })}
            />
            <div className="flex shrink-0 items-center">
              {onCoverChange && (
                <IconButton
                  label={cover === image.src ? 'Image de couverture' : 'Utiliser comme couverture'}
                  onClick={() => onCoverChange(image.src)}
                >
                  <Star size={16} className={cover === image.src ? 'fill-black' : ''} />
                </IconButton>
              )}
              <IconButton label="Monter" onClick={() => move(index, -1)} disabled={index === 0}>
                <ArrowUp size={16} />
              </IconButton>
              <IconButton label="Descendre" onClick={() => move(index, 1)} disabled={index === images.length - 1}>
                <ArrowDown size={16} />
              </IconButton>
              <IconButton label="Retirer" onClick={() => remove(index)}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>
      <FileButton
        label="Ajouter des images"
        multiple
        busy={busy}
        onFiles={async (files) => {
          const urls = await uploadAll(files);
          if (urls.length) onChange([...images, ...urls.map((src) => ({ src, caption: '' }))]);
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full p-2 text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
