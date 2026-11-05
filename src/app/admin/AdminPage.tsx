// Page /admin : gestion des illustrations et des projets.
// Protégée par le mot de passe ADMIN_PASSWORD (vérifié côté serveur).
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, EyeOff, ExternalLink, Loader2, LogOut, Plus } from 'lucide-react';
import { defaultContent } from '../content/defaultContent';
import type { Illustration, Project, SiteContent } from '../content/types';
import { getSession, loadContent, login, logout, saveContent, type SessionInfo } from './api';
import { IconButton, StorageContext } from './fields';
import { IllustrationEditor, ProjectEditor } from './Editors';

type Tab = 'illustrations' | 'projects';

/** Le vrai site. Les liens « Voir » y mènent toujours (sauf en test local). */
const SITE_URL = 'https://lesraleurs.com';
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const isPreview = !isLocal && window.location.hostname !== new URL(SITE_URL).hostname;
const siteLink = (path: string) => (isLocal ? path : `${SITE_URL}${path}`);

export default function AdminPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Admin — Les Râleurs';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    document.documentElement.classList.add('admin-page');
    getSession().then(setSession).catch((err) => setError((err as Error).message));
    return () => {
      robots.remove();
      document.documentElement.classList.remove('admin-page');
    };
  }, []);

  if (error) return <Centered><p className="text-red-600">{error}</p></Centered>;
  if (!session) return <Centered><Loader2 className="animate-spin" /></Centered>;
  if (!session.authenticated) {
    return <Login configured={session.configured} onLoggedIn={() => getSession().then(setSession)} />;
  }
  return (
    <StorageContext.Provider value={session.storage}>
      <Editor storage={session.storage} onLogout={() => logout().then(() => getSession().then(setSession))} />
    </StorageContext.Provider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">{children}</div>;
}

function Login({ configured, onLoggedIn }: { configured: boolean; onLoggedIn: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Centered>
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await login(password);
            onLoggedIn();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1 className="text-2xl font-bold italic">Les Râleurs — admin</h1>
        {!configured && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Le mot de passe n'est pas encore configuré (variable ADMIN_PASSWORD sur Vercel).
          </p>
        )}
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Mot de passe"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-2.5 font-medium text-white disabled:opacity-50"
        >
          {busy && <Loader2 size={16} className="animate-spin" />} Se connecter
        </button>
      </form>
    </Centered>
  );
}

function newIllustration(content: SiteContent): Illustration {
  const cartId = Math.max(0, ...content.illustrations.map((item) => item.cartId)) + 1;
  return {
    slug: `nouvelle-illustration-${cartId}`,
    kind: 'print',
    cartId,
    title: 'Nouvelle illustration',
    description: '',
    formats: [
      { format: '30x40', label: '30x40cm', price: 35 },
      { format: '40x50', label: '40x50cm', price: 70 },
    ],
    defaultFormat: 0,
    card: { title: 'Nouvelle illustration', subtitle: 'Print 30x40', image: '', price: 35 },
    hidden: true,
  };
}

function newProject(content: SiteContent): Project {
  const n = content.projects.length + 1;
  return {
    slug: `nouveau-projet-${n}`,
    title: 'Nouveau projet',
    subtitle: '',
    description: '',
    images: [],
    card: { title: 'Nouveau projet', subtitle: '', teaser: '', image: '' },
    hidden: true,
  };
}

function Editor({ storage, onLogout }: { storage: SessionInfo['storage']; onLogout: () => void }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState<string>('');
  const [tab, setTab] = useState<Tab>('illustrations');
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'ok' | 'error'; message?: string }>({ kind: 'idle' });
  const [isFirstPublish, setIsFirstPublish] = useState(false);

  useEffect(() => {
    loadContent()
      .then((published) => {
        const initial = published ?? defaultContent;
        setIsFirstPublish(!published);
        setContent(initial);
        setSaved(published ? JSON.stringify(published) : '');
      })
      .catch((err) => setStatus({ kind: 'error', message: (err as Error).message }));
  }, []);

  const dirty = useMemo(() => content !== null && JSON.stringify(content) !== saved, [content, saved]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!content) {
    return (
      <Centered>
        {status.kind === 'error' ? <p className="text-red-600">{status.message}</p> : <Loader2 className="animate-spin" />}
      </Centered>
    );
  }

  const list = tab === 'illustrations' ? content.illustrations : content.projects;

  const replaceList = (items: Illustration[] | Project[]) =>
    setContent(tab === 'illustrations'
      ? { ...content, illustrations: items as Illustration[] }
      : { ...content, projects: items as Project[] });

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list] as Illustration[] | Project[];
    [next[index], next[target]] = [next[target], next[index]];
    replaceList(next);
    if (selected === index) setSelected(target);
    else if (selected === target) setSelected(index);
  };

  const add = () => {
    if (tab === 'illustrations') {
      setContent({ ...content, illustrations: [newIllustration(content), ...content.illustrations] });
    } else {
      setContent({ ...content, projects: [newProject(content), ...content.projects] });
    }
    setSelected(0);
  };

  const remove = (index: number) => {
    replaceList(list.filter((_, i) => i !== index) as Illustration[] | Project[]);
    setSelected(null);
  };

  const publish = async () => {
    setStatus({ kind: 'saving' });
    try {
      await saveContent(content);
      setSaved(JSON.stringify(content));
      setIsFirstPublish(false);
      setStatus({ kind: 'ok', message: 'Publié. Le site est à jour (quelques secondes de délai).' });
    } catch (err) {
      setStatus({ kind: 'error', message: (err as Error).message });
    }
  };

  const current = selected !== null ? list[selected] : null;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Barre du haut */}
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <h1 className="mr-auto text-lg font-bold italic">Les Râleurs — admin</h1>
          <a href={siteLink('/illustrations')} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-sm text-neutral-600 hover:text-black sm:inline-flex">
            Voir le site <ExternalLink size={14} />
          </a>
          <button
            type="button"
            onClick={publish}
            disabled={(!dirty && !isFirstPublish) || status.kind === 'saving' || storage === 'none'}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {status.kind === 'saving' && <Loader2 size={16} className="animate-spin" />}
            {dirty || isFirstPublish ? 'Publier les changements' : 'À jour'}
          </button>
          <IconButton label="Se déconnecter" onClick={onLogout}>
            <LogOut size={18} />
          </IconButton>
        </div>
        {(status.message || storage === 'none' || storage === 'local' || isFirstPublish || isPreview) && (
          <div className="mx-auto max-w-6xl space-y-1 px-4 pb-3 text-sm">
            {isPreview && (
              <p className="text-amber-700">
                Tu es sur une adresse d'aperçu. Les publications changent quand même le vrai site.{' '}
                <a href={`${SITE_URL}/admin`} className="font-medium underline">
                  Ouvrir l'admin sur lesraleurs.com
                </a>
              </p>
            )}
            {storage === 'none' && (
              <p className="text-amber-700">Le stockage Vercel Blob n'est pas encore relié au projet : impossible de publier pour l'instant.</p>
            )}
            {storage === 'local' && <p className="text-neutral-500">Mode test local : rien n'est publié en ligne.</p>}
            {isFirstPublish && storage !== 'none' && (
              <p className="text-neutral-600">Première utilisation : le contenu actuel du site est chargé. « Publier » l'enregistre dans le stockage.</p>
            )}
            {status.message && (
              <p className={status.kind === 'error' ? 'text-red-600' : 'text-green-700'}>{status.message}</p>
            )}
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[320px_1fr]">
        {/* Liste */}
        <aside className={`min-w-0 ${current ? 'hidden md:block' : ''}`}>
          <div className="mb-3 flex rounded-full bg-neutral-200 p-1 text-sm font-medium">
            {(['illustrations', 'projects'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setSelected(null);
                }}
                className={`flex-1 rounded-full py-1.5 ${tab === key ? 'bg-white shadow-sm' : 'text-neutral-600'}`}
              >
                {key === 'illustrations' ? `Illustrations (${content.illustrations.length})` : `Graphisme (${content.projects.length})`}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={add}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-3 text-sm font-medium hover:border-black"
          >
            <Plus size={16} /> {tab === 'illustrations' ? 'Ajouter une illustration' : 'Ajouter un projet'}
          </button>
          <ul className="space-y-2">
            {list.map((item, index) => (
              <li
                key={`${item.slug}-${index}`}
                className={`flex items-center gap-3 rounded-xl border bg-white p-2 ${
                  selected === index ? 'border-black' : 'border-neutral-200'
                }`}
              >
                <button type="button" onClick={() => setSelected(index)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {item.card.image && <img src={item.card.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.card.title || item.title}</p>
                    <p className="flex items-center gap-2 text-xs text-neutral-500">
                      {item.hidden && (
                        <span className="inline-flex items-center gap-1 rounded bg-neutral-200 px-1.5 py-0.5 text-neutral-700">
                          <EyeOff size={12} /> masqué
                        </span>
                      )}
                      {'sold' in item && item.sold && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">vendu</span>
                      )}
                      <span className="truncate">/{item.slug}</span>
                    </p>
                  </div>
                </button>
                <div className="flex shrink-0 flex-col">
                  <IconButton label="Monter" onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp size={14} />
                  </IconButton>
                  <IconButton label="Descendre" onClick={() => move(index, 1)} disabled={index === list.length - 1}>
                    <ArrowDown size={14} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Formulaire */}
        <main className={`min-w-0 ${current ? '' : 'hidden md:block'}`}>
          {current && selected !== null ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center gap-1 text-sm text-neutral-600 md:hidden"
                >
                  <ArrowLeft size={16} /> Liste
                </button>
                <h2 className="mr-auto truncate text-xl font-bold italic">{current.title}</h2>
                {!current.hidden && (
                  <a
                    href={siteLink(`/${current.slug}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-sm text-neutral-600 hover:text-black"
                  >
                    Voir la page <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {tab === 'illustrations' ? (
                <IllustrationEditor
                  key={selected}
                  value={current as Illustration}
                  onChange={(next) =>
                    setContent({ ...content, illustrations: content.illustrations.map((item, i) => (i === selected ? next : item)) })
                  }
                  onDelete={() => remove(selected)}
                />
              ) : (
                <ProjectEditor
                  key={selected}
                  value={current as Project}
                  onChange={(next) =>
                    setContent({ ...content, projects: content.projects.map((item, i) => (i === selected ? next : item)) })
                  }
                  onDelete={() => remove(selected)}
                />
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500">
              Choisis une œuvre ou un projet dans la liste.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
