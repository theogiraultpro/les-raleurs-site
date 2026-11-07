// Page d'accueil : une bulle d'encre noire flotte sur la page blanche et se déforme
// selon la vitesse de la souris (ou du doigt). Coupée d'un geste vif, elle se sépare
// en gouttes qui glissent les unes vers les autres et fusionnent, comme du mercure.
// Un clic (ou Entrée) la fait éclater en éclaboussure d'encre (contraste façon
// Sin City), puis on part vers la galerie.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const INK = '#000000';

type Point = [number, number];

const f2 = (n: number) => n.toFixed(2);
const rand = (min: number, max: number) => min + Math.random() * (max - min);
/** Tirage gaussien (bruit organique). */
function randn(): number {
  return Math.sqrt(-2 * Math.log(Math.max(1e-9, Math.random()))) * Math.cos(2 * Math.PI * Math.random());
}

/** Courbe fermée lisse passant par tous les points (Catmull-Rom → Bézier). */
function smoothClosedPath(points: Point[], tension = 1): string {
  const n = points.length;
  let d = `M${f2(points[0][0])},${f2(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += ` C${f2(c1x)},${f2(c1y)} ${f2(c2x)},${f2(c2y)} ${f2(p2[0])},${f2(p2[1])}`;
  }
  return `${d} Z`;
}

/** Polygone à segments droits (bords francs, façon encre découpée). */
function polygonPath(points: Point[]): string {
  return `M${points.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L')} Z`;
}

// ---------- Bulle ----------

/** Nombre de points du contour de la bulle (chacun réagit comme un ressort). */
const VERTICES = 36;

/** Contour de la bulle : ondulation + bruit aléatoire (`noise`) + déformation (`offsets`). */
function bubblePath(
  r: number,
  t: number,
  wobble: number,
  phases: number[],
  offsets?: Float32Array,
  noise?: Float32Array,
  noiseAmount = 0,
): string {
  const points: Point[] = [];
  for (let i = 0; i < VERTICES; i++) {
    const a = (i / VERTICES) * Math.PI * 2;
    const k =
      1 +
      wobble *
        (0.05 * Math.sin(2 * a + t * 1.3 + phases[0]) +
          0.035 * Math.sin(3 * a - t * 1.9 + phases[1]) +
          0.02 * Math.sin(5 * a + t * 2.6 + phases[2]));
    const radius = r * k + (offsets ? offsets[i] : 0) + (noise ? noise[i] * r * noiseAmount : 0);
    points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
  }
  return smoothClosedPath(points);
}

/** Un morceau de bulle après une coupure. */
interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pull: number;
  phase: number;
  /** Délai avant d'être rattiré (les morceaux reviennent les uns après les autres). */
  wait: number;
}

// ---------- Éclaboussure (encre projetée, contraste façon Sin City) ----------

export interface Splat {
  x: number;
  y: number;
  /** Tache principale : masse lobée et doigts épais aux bouts arrondis. */
  core: string;
  /** Gouttes satellites collées ou presque à la tache. */
  spines: string;
  /** Gouttes projetées et bruine, regroupées par distance pour l'animation. */
  flecks: string[];
}

/** Tous les contours dans le même sens, sinon leurs recouvrements se trouent. */
function clockwise(pts: Point[]): Point[] {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  return area < 0 ? pts.reverse() : pts;
}

/** Cercle en chemin SVG. */
function circlePath(cx: number, cy: number, r: number): string {
  return `M${f2(cx - r)},${f2(cy)} a${f2(r)},${f2(r)} 0 1 1 ${f2(r * 2)},0 a${f2(r)},${f2(r)} 0 1 1 ${f2(-r * 2)},0 Z`;
}

/** Goutte ovale irrégulière, étirée selon `angle`. */
function blob(cx: number, cy: number, size: number, angle: number, stretch: number, wobble = 0.12): string {
  const pts: Point[] = [];
  const n = 10;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  for (let k = 0; k < n; k++) {
    const b = (k / n) * Math.PI * 2;
    const rr = size * (1 + rand(-wobble, wobble));
    // Un peu plus pointue côté centre (la goutte « vient » de l'impact).
    const back = Math.cos(b) < 0 ? 1 + 0.25 * (stretch - 1) : 1;
    const lx = Math.cos(b) * rr * stretch * back;
    const ly = Math.sin(b) * rr;
    pts.push([cx + lx * ca - ly * sa, cy + lx * sa + ly * ca]);
  }
  return smoothClosedPath(clockwise(pts), 1);
}

/** Écart d'angle ramené dans [-π, π]. */
function angleGap(a: number, b: number): number {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Bande effilée le long d'une ligne centrale (largeur 0 = pointe). */
function taper(center: Point[], widths: number[]): string {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i < center.length; i++) {
    const [x0, y0] = center[Math.max(0, i - 1)];
    const [x1, y1] = center[Math.min(center.length - 1, i + 1)];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / len;
    const ny = (x1 - x0) / len;
    const w = widths[i] / 2;
    left.push([center[i][0] + nx * w, center[i][1] + ny * w]);
    right.push([center[i][0] - nx * w, center[i][1] - ny * w]);
  }
  return smoothClosedPath(clockwise([...left, ...right.reverse()]), 0.6);
}

/**
 * Tache d'encre posée : masse irrégulière aux grands lobes, bordée d'une
 * couronne de fines pointes (plus longues dans le sens du coup).
 */
function crownBlob(cx: number, cy: number, rad: number, dir: number, spikeCount: number, spikeScale: number): string {
  const lobes = [rand(0.04, 0.14), rand(0.03, 0.12), rand(0.015, 0.04), rand(0.01, 0.025)];
  const ph = lobes.map(() => rand(0, 6.3));
  const spikes = Array.from({ length: spikeCount }, () => {
    const a = rand(0, Math.PI * 2);
    const toward = Math.max(0, Math.cos(a - dir));
    return {
      a,
      h: rad * spikeScale * Math.pow(Math.random(), 2.2) * rand(0.06, 0.3) * (1 + toward * 1.2),
      w: rand(0.015, 0.05),
    };
  });
  const n = 220;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let rr =
      rad *
      (1 +
        lobes[0] * Math.sin(2 * a + ph[0]) +
        lobes[1] * Math.sin(3 * a + ph[1]) +
        lobes[2] * Math.sin(7 * a + ph[2]) +
        lobes[3] * Math.sin(17 * a + ph[3]));
    for (const sp of spikes) {
      const g = Math.abs(angleGap(a, sp.a)) / sp.w;
      if (g < 1) rr += sp.h * Math.pow(1 - g, 2.4);
    }
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smoothClosedPath(clockwise(pts), 0.5);
}

/** Éclat de projection : forme anguleuse étirée dans le sens du vol. */
function shard(cx: number, cy: number, size: number, angle: number, stretch: number): string {
  const sides = Math.round(rand(4, 7));
  const spin = rand(-0.3, 0.3);
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const pts: Point[] = [];
  for (let k = 0; k < sides; k++) {
    const b = spin + (k / sides) * Math.PI * 2;
    const rr = size * rand(0.5, 1.2);
    const lx = Math.cos(b) * rr * stretch;
    const ly = Math.sin(b) * rr;
    pts.push([cx + lx * ca - ly * sa, cy + lx * sa + ly * ca]);
  }
  return Math.random() < 0.6 ? polygonPath(clockwise(pts)) : smoothClosedPath(clockwise(pts), 0.4);
}

/**
 * Éclaboussure tirée au hasard, inspirée de vraies taches d'encre : chaque
 * éclatement est différent (une ou plusieurs gouttes fondues, couronne de
 * pointes, jets effilés, longues traînées, nuée d'éclats dans le sens du coup).
 */
function makeSplat(x: number, y: number, r: number, direction: number | null): Splat {
  const R = r * 1.5;
  const dir = direction ?? rand(0, Math.PI * 2);
  // Projection orientée (le plus souvent) ou éclatement tout autour.
  const cone = Math.random() < (direction === null ? 0.45 : 0.75);
  const energy = rand(0.7, 1.3);

  // Masse : 1 à 3 gouttes fondues, alignées à peu près dans le sens du coup.
  const roll = Math.random();
  const drops = roll < 0.55 ? 1 : roll < 0.85 ? 2 : 3;
  let core = crownBlob(0, 0, R * rand(0.82, 1), dir, Math.round(rand(26, 48)), energy) + ' ';
  let along = 0;
  for (let i = 1; i < drops; i++) {
    const a = dir + randn() * 0.7 + (Math.random() < 0.3 ? Math.PI : 0);
    along += R * rand(0.55, 0.95);
    const rad = R * rand(0.4, 0.72);
    core += crownBlob(Math.cos(a) * along, Math.sin(a) * along, rad, dir, Math.round(rand(14, 30)), energy) + ' ';
  }

  const aimed = (spread: number, bias: number) =>
    Math.random() < bias ? dir + randn() * spread : rand(0, Math.PI * 2);
  let spines = '';

  // Petites taches satellites (gouttes tombées à côté, avec leur couronne).
  const satellites = Math.round(rand(0, 3));
  for (let i = 0; i < satellites; i++) {
    const a = aimed(0.9, 0.6);
    const d = R * rand(1.4, 2.6);
    spines += crownBlob(Math.cos(a) * d, Math.sin(a) * d, R * rand(0.1, 0.26), a, Math.round(rand(8, 18)), 0.9) + ' ';
  }

  // Chapelet de gouttes rondes qui s'éloigne en courbe (de temps en temps).
  if (Math.random() < 0.35) {
    let a = aimed(0.8, 0.6);
    let d = R * rand(1.3, 1.8);
    let size = R * rand(0.05, 0.1);
    const n = Math.round(rand(4, 10));
    const curve = rand(-0.06, 0.06);
    for (let k = 0; k < n; k++) {
      spines += blob(Math.cos(a) * d, Math.sin(a) * d, size, a, rand(1, 1.3)) + ' ';
      d += size * rand(1.8, 3);
      a += curve;
      size *= rand(0.8, 1.02);
    }
  }

  // Nuée d'éclats : dense dans le sens du coup, de toutes tailles, quelques grosses gouttes rondes.
  const bands = ['', '', '', ''];
  const reach = cone ? 4.6 : 3.2;
  const bandOf = (dist: number) => Math.max(0, Math.min(3, Math.floor(((dist / R - 1) / reach) * 4)));
  const count = Math.round((cone ? rand(200, 300) : rand(110, 170)) * energy);
  for (let i = 0; i < count; i++) {
    const a = cone && Math.random() < 0.82 ? dir + randn() * rand(0.35, 0.7) : rand(0, Math.PI * 2);
    const toward = Math.max(0, Math.cos(a - dir));
    const d = R * (1.0 + Math.pow(Math.random(), 1.15) * reach * (cone ? 0.45 + toward * 0.55 : 1));
    const fade = 1.3 - (d / R - 1) / reach;
    let size = R * 0.011 * Math.pow(1 / Math.max(0.04, Math.random()), 0.75) * Math.max(0.3, fade);
    size = Math.min(size, R * 0.1);
    const cx = Math.cos(a) * d;
    const cy = Math.sin(a) * d;
    if (size < R * 0.006) bands[bandOf(d)] += circlePath(cx, cy, Math.max(0.6, size)) + ' ';
    else if (size > R * 0.035 && Math.random() < 0.7) bands[bandOf(d)] += blob(cx, cy, size, a, rand(1, 1.3), 0.08) + ' ';
    else bands[bandOf(d)] += shard(cx, cy, size, a, rand(1.3, 3.2)) + ' ';
  }

  return { x, y, core, spines, flecks: bands };
}

// ---------- Rendu de l'éclaboussure (animée sur l'accueil, figée sur les autres pages) ----------

export function SplatShapes({ splat, animated }: { splat: Splat; animated: boolean }) {
  const from = (scale: number) => (animated ? { scale } : false);
  return (
    <g fill={INK}>
      {splat.flecks.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          initial={from(0.2)}
          animate={{ scale: 1 }}
          transition={{ duration: 0.26 + i * 0.08, delay: 0.01 + i * 0.015, ease: [0.1, 0.9, 0.25, 1] }}
        />
      ))}
      <motion.path
        d={splat.spines}
        initial={from(0.3)}
        animate={{ scale: 1 }}
        transition={{ duration: 0.24, ease: [0.1, 0.95, 0.3, 1.08] }}
      />
      {/* Impact : la tache dépasse sa taille puis se pose. */}
      <motion.path
        d={splat.core}
        initial={from(0.25)}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 800, damping: 16, mass: 0.6 }}
      />
    </g>
  );
}

// ---------- Composant ----------

interface InkBubbleProps {
  /** Appelé dès l'éclatement, avec l'éclaboussure créée. */
  onSplat?: (splat: Splat) => void;
  /** Appelé quand l'éclaboussure a fini de s'étaler. */
  onBurst: () => void;
}

const MAX_PIECES = 4;

export function InkBubble({ onSplat, onBurst }: InkBubbleProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const gooRef = useRef<SVGGElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const shapeRef = useRef<SVGPathElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const tapStart = useRef<{ x: number; y: number } | null>(null);
  const pieceRefs = useRef<Array<SVGPathElement | null>>([]);
  const position = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: -9999, y: -9999, lx: -9999, ly: -9999, vx: 0, vy: 0, t: 0, touch: false });
  const hovered = useRef(false);
  const burst = useRef(false);
  const pieces = useRef<Piece[] | null>(null);
  const [radius, setRadius] = useState(56);
  const [splat, setSplat] = useState<Splat | null>(null);
  const [visible, setVisible] = useState(false);

  const phases = useMemo(() => Array.from({ length: 6 }, () => Math.random() * Math.PI * 2), []);
  const gooId = useMemo(() => `ink-goo-${Math.random().toString(36).slice(2, 8)}`, []);

  // Taille de la bulle selon l'écran.
  useEffect(() => {
    const update = () => setRadius(Math.round(Math.min(72, Math.max(40, window.innerWidth * 0.045))));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Page blanche un court instant, puis la goutte apparaît.
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), reducedMotion ? 0 : 650);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Position et vitesse de la souris (ou du doigt).
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const p = pointer.current;
      const now = performance.now();
      const dt = Math.max(1, now - p.t) / 1000;
      const fresh = p.t && dt < 0.2 && p.x > -9000;
      if (fresh) {
        // Vitesse lissée, en pixels par seconde (moins lissée au doigt, plus réactive).
        const keep = event.pointerType === 'mouse' ? 0.5 : 0.25;
        p.vx = p.vx * keep + ((event.clientX - p.x) / dt) * (1 - keep);
        p.vy = p.vy * keep + ((event.clientY - p.y) / dt) * (1 - keep);
      }
      // Position précédente : sert à savoir si le geste a traversé la bulle.
      p.lx = fresh ? p.x : event.clientX;
      p.ly = fresh ? p.y : event.clientY;
      p.x = event.clientX;
      p.y = event.clientY;
      p.t = now;
      p.touch = event.pointerType !== 'mouse';
    };
    // Doigt levé : plus rien ne touche la bulle.
    const onRelease = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      const p = pointer.current;
      p.x = -9999;
      p.y = -9999;
      p.lx = -9999;
      p.ly = -9999;
      p.vx = 0;
      p.vy = 0;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onRelease);
    window.addEventListener('pointercancel', onRelease);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
    };
  }, []);

  // Vie de la bulle, image par image (sans repasser par React).
  useEffect(() => {
    let raf = 0;
    let clock = 0;
    let ripple = 0;
    let wobble = 1;
    let last = performance.now();
    let prev = { x: 0, y: 0 };
    let stretch = 0;
    let stretchX = 0;
    let stretchY = 0;
    let gooOn = true;
    let heading = 0;
    let cooldown = 0;
    const body = { x: 0, y: 0, vx: 0, vy: 0, init: false };
    // Contact avec un mur vertical (x) ou horizontal (y).
    const wallX = { axis: 'x' as 'x' | 'y', on: false, omega: 0, pen: 0, side: 1 };
    const wallY = { axis: 'y' as 'x' | 'y', on: false, omega: 0, pen: 0, side: 1 };
    // Vitesse de croisière, proportionnelle à la taille de l'écran.
    const cruise = (w: number, h: number) => Math.max(110, Math.min(210, Math.min(w, h) * 0.24));
    const offsets = new Float32Array(VERTICES);
    const velocities = new Float32Array(VERTICES);
    const smoothed = new Float32Array(VERTICES);
    const noise = new Float32Array(VERTICES);
    const noiseSmooth = new Float32Array(VERTICES);

    const frame = (now: number) => {
      // Jamais négatif (la première image peut arriver « avant » le départ du chrono).
      const dt = Math.max(0, Math.min(0.033, (now - last) / 1000));
      last = now;
      if (burst.current) return;

      // Au survol, la bulle ralentit pour se laisser attraper.
      const speed = hovered.current ? 0.25 : 1;
      clock += dt * (reducedMotion ? 0 : speed);
      wobble += ((hovered.current ? 1.3 : 1) - wobble) * Math.min(1, dt * 6);
      ripple += dt * (reducedMotion ? 0 : hovered.current ? 2.6 : 1.6);
      cooldown = Math.max(0, cooldown - dt);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const list0 = pieces.current;
      let x: number;
      let y: number;
      if (reducedMotion) {
        x = w / 2;
        y = h / 2;
      } else {
        // ---- Comme une balle : ligne droite à vitesse constante, rebond net sur chaque bord.
        if (!body.init) {
          // Départ en diagonale (jamais pile horizontal ou vertical), puis ligne droite.
          const angle = rand(0.45, 1.1) + Math.floor(rand(0, 4)) * (Math.PI / 2);
          const start = cruise(w, h);
          body.x = w / 2;
          body.y = h / 2;
          body.vx = Math.cos(angle) * start;
          body.vy = Math.sin(angle) * start;
          body.init = true;
        }
        // Vitesse de croisière : ralentit au survol (pour se laisser attraper) et quand elle est coupée.
        // Pas pendant un contact avec un mur : c'est le mur qui la renvoie.
        if (!wallX.on && !wallY.on) {
          const target = cruise(w, h) * (hovered.current ? 0.3 : 1) * (list0 ? 0.35 : 1);
          const v0 = Math.hypot(body.vx, body.vy) || 1;
          const k = 1 + (target / v0 - 1) * Math.min(1, dt * (v0 > target ? 1.2 : 2.5));
          body.vx *= k;
          body.vy *= k;
        }

        // Rebonds : la bulle continue un peu dans le mur en s'écrasant dessus,
        // puis le mur la renvoie (comme un ressort), et elle tremble en repartant.
        const inset = radius;
        const jiggle = (nx: number, ny: number, impact: number) => {
          ripple += 0.6;
          if (pieces.current) return;
          const strength = Math.min(impact, 1400) * 0.9;
          for (let i = 0; i < VERTICES; i++) {
            const a = (i / VERTICES) * Math.PI * 2;
            const align = Math.cos(a) * nx + Math.sin(a) * ny;
            velocities[i] += strength * (0.5 * align * align - 0.25);
          }
        };
        const wall = (state: typeof wallX, pos: number, vel: number, low: number, high: number) => {
          // Enfoncement dans le mur le plus proche (signé : + vers l'extérieur).
          const pen = pos < low ? low - pos : pos > high ? pos - high : 0;
          const side = pos < low ? -1 : 1;
          if (pen > 0 && !state.on) {
            // Entrée dans le mur : la raideur fixe la profondeur d'écrasement (~45 % du rayon).
            const incoming = Math.abs(vel);
            state.omega = Math.max(9, incoming / (radius * 0.45));
            state.on = true;
            state.side = side;
          }
          if (state.on && pen <= 0) {
            state.on = false;
            jiggle(state.axis === 'x' ? state.side : 0, state.axis === 'y' ? state.side : 0, Math.abs(vel));
          }
          state.pen = state.on ? Math.max(0, pen) : 0;
          return state.on ? -side * state.omega * state.omega * state.pen : 0;
        };
        body.vx += wall(wallX, body.x, body.vx, inset, w - inset) * dt;
        body.vy += wall(wallY, body.y, body.vy, inset, h - inset) * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        // Sécurité (fenêtre redimensionnée, poussée violente) : jamais hors de la page.
        body.x = Math.max(inset * 0.4, Math.min(w - inset * 0.4, body.x));
        body.y = Math.max(inset * 0.4, Math.min(h - inset * 0.4, body.y));
        x = body.x;
        y = body.y;
      }
      position.current = { x, y };

      // Étirement dans le sens du vol, plus marqué quand elle va vite.
      const vx = (x - prev.x) / Math.max(dt, 0.001);
      const vy = (y - prev.y) / Math.max(dt, 0.001);
      prev = { x, y };
      // Lissé comme un vecteur : au rebond, l'étirement pivote en douceur au lieu de sauter.
      const v = Math.min(3000, Math.hypot(vx, vy));
      const amount = wallX.on || wallY.on ? 0 : Math.min(0.16, v / 2600);
      const ease = Math.min(1, dt * 6);
      stretchX += ((v > 1 ? (vx / v) * amount : 0) - stretchX) * ease;
      stretchY += ((v > 1 ? (vy / v) * amount : 0) - stretchY) * ease;
      stretch = Math.hypot(stretchX, stretchY);
      if (stretch > 0.001) heading = (Math.atan2(stretchY, stretchX) * 180) / Math.PI;

      const p = pointer.current;
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);
      const cursorAngle = Math.atan2(dy, dx);

      if (!reducedMotion) {
        // La vitesse retombe si la souris s'arrête.
        if (now - p.t > 60) {
          p.vx *= 0.8;
          p.vy *= 0.8;
        }
        const mouseSpeed = Math.hypot(p.vx, p.vy);
        const mdx = mouseSpeed > 1 ? p.vx / mouseSpeed : 0;
        const mdy = mouseSpeed > 1 ? p.vy / mouseSpeed : 0;

        // ---- Bruit organique : le contour n'est jamais deux fois le même.
        for (let i = 0; i < VERTICES; i++) {
          noise[i] += -1.4 * noise[i] * dt + (hovered.current ? 1.5 : 1.0) * Math.sqrt(dt) * randn();
          if (!Number.isFinite(noise[i])) noise[i] = 0;
        }
        for (let i = 0; i < VERTICES; i++) {
          noiseSmooth[i] = noise[i] * 0.5 + (noise[(i - 1 + VERTICES) % VERTICES] + noise[(i + 1) % VERTICES]) * 0.25;
        }

        // ---- Coupure : un geste vif qui traverse le cœur coupe la bulle en morceaux.
        // Un doigt sur un petit écran va moins vite (en pixels) qu'une souris.
        const cutSpeed = p.touch ? radius * 13 : Math.min(1600, radius * 30);
        // Distance entre le centre et le trajet du dernier geste (pas seulement sa position :
        // un geste rapide peut « sauter » par-dessus le centre entre deux mesures).
        const sx0 = p.lx - x;
        const sy0 = p.ly - y;
        const segX = dx - sx0;
        const segY = dy - sy0;
        const segLen2 = segX * segX + segY * segY;
        const tSeg = segLen2 > 0 ? Math.max(0, Math.min(1, -(sx0 * segX + sy0 * segY) / segLen2)) : 0;
        const pathDist = Math.hypot(sx0 + segX * tSeg, sy0 + segY * tSeg);
        const crossed = Math.min(dist, pathDist) < radius * (p.touch ? 0.7 : 0.6);
        if (!pieces.current && cooldown === 0 && mouseSpeed > cutSpeed && crossed && now - p.t < 50) {
          const roll = Math.random();
          const count = roll < 0.45 ? 2 : roll < 0.8 ? 3 : 4;
          // Tailles inégales (surface totale conservée).
          const weights = Array.from({ length: count }, (_, i) => (i === 0 ? rand(1.2, 2.2) : rand(0.4, 1.2)));
          const total = weights.reduce((sum, value) => sum + value, 0);
          const nx = -mdy;
          const ny = mdx;
          const kick = Math.min(1900, 480 + mouseSpeed * 0.36);
          pieces.current = weights.map((weight, i) => {
            const side = i % 2 === 0 ? 1 : -1;
            const spread = randn() * 0.7;
            const base = Math.atan2(ny * side, nx * side) + spread;
            const speedK = i === 0 ? rand(0.15, 0.4) : rand(0.6, 1.3);
            return {
              x: Math.cos(base) * radius * 0.2,
              y: Math.sin(base) * radius * 0.2,
              vx: Math.cos(base) * kick * speedK + mdx * rand(0, 250),
              vy: Math.sin(base) * kick * speedK + mdy * rand(0, 250),
              r: radius * Math.sqrt(weight / total) * 1.03,
              pull: rand(9, 16),
              phase: rand(0, 6.3),
              wait: i === 0 ? 0 : rand(0.15, 0.7),
            };
          });
          offsets.fill(0);
          velocities.fill(0);
        }

        const list = pieces.current;
        if (list) {
          // Le plus gros morceau revient au centre, les autres sont rattirés vers lui.
          const main = list[0];
          main.vx += (-main.pull * main.x - 3 * main.vx) * dt;
          main.vy += (-main.pull * main.y - 3 * main.vy) * dt;
          for (let i = 1; i < list.length; i++) {
            const piece = list[i];
            const ox = piece.x - main.x;
            const oy = piece.y - main.y;
            const d = Math.hypot(ox, oy) || 1;
            piece.wait -= dt;
            if (piece.wait > 0) {
              // Lancé : il glisse puis ralentit.
              piece.vx -= piece.vx * 3.2 * dt;
              piece.vy -= piece.vy * 3.2 * dt;
            } else {
              // Comme une goutte de mercure : attirée de plus en plus fort en approchant.
              const attract = piece.pull * radius * (1.2 + 2.2 * Math.max(0, 1 - d / (radius * 3)));
              piece.vx += ((-ox / d) * attract * 1.6 - 4.2 * piece.vx + randn() * 40) * dt;
              piece.vy += ((-oy / d) * attract * 1.6 - 4.2 * piece.vy + randn() * 40) * dt;
            }
          }
          for (const piece of list) {
            piece.x += piece.vx * dt;
            piece.y += piece.vy * dt;
          }
          // Fusion : un morceau qui touche le corps principal est absorbé.
          for (let i = list.length - 1; i >= 1; i--) {
            const piece = list[i];
            const gap = Math.hypot(piece.x - main.x, piece.y - main.y);
            const slow = Math.hypot(piece.vx - main.vx, piece.vy - main.vy) < 500;
            if (gap < main.r * 0.6 && slow) {
              main.r = Math.sqrt(main.r * main.r + piece.r * piece.r);
              // Le morceau absorbé pousse le corps principal un instant.
              main.vx += piece.vx * (piece.r / main.r) * 0.5;
              main.vy += piece.vy * (piece.r / main.r) * 0.5;
              list.splice(i, 1);
            }
          }
          if (list.length === 1 && Math.hypot(main.x, main.y) < radius * 0.1) {
            pieces.current = null;
            cooldown = 0.6;
            // Tremblement à la reconstitution.
            for (let i = 0; i < VERTICES; i++) velocities[i] += radius * rand(-1.5, 5);
          }
        } else {
          // ---- Déformation : plus la souris va vite, plus la bulle se tord.
          const reach = radius * 2.6;
          const influence = Math.max(0, Math.min(1, (reach - dist) / (reach - radius * 0.6)));
          const force = influence * Math.min(Math.pow(mouseSpeed / 1000, 1.9), 14);
          // Un geste vif à côté de la bulle la pousse (sans la couper).
          if (influence > 0 && mouseSpeed > 300 && now - p.t < 80) {
            const shove = influence * Math.min(mouseSpeed, 3000) * 2.4 * dt;
            body.vx += mdx * shove;
            body.vy += mdy * shove;
          }
          const stiffness = 150;
          const damping = 8;
          for (let i = 0; i < VERTICES; i++) {
            const a = (i / VERTICES) * Math.PI * 2;
            const ux = Math.cos(a);
            const uy = Math.sin(a);
            const align = ux * mdx + uy * mdy;
            let diff = Math.abs(a - cursorAngle) % (Math.PI * 2);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            const close = Math.exp(-(diff * diff) / 0.3);
            const push = force * radius * (0.65 * align + 0.55 * close * Math.max(0.2, align + 0.6));
            const accel = -stiffness * offsets[i] - damping * velocities[i] + push * 85;
            velocities[i] += accel * dt;
            offsets[i] += velocities[i] * dt;
          }
          for (let i = 0; i < VERTICES; i++) {
            smoothed[i] =
              offsets[i] * 0.6 + (offsets[(i - 1 + VERTICES) % VERTICES] + offsets[(i + 1) % VERTICES]) * 0.2;
          }
          for (let i = 0; i < VERTICES; i++) {
            offsets[i] = Math.max(-radius * 0.6, Math.min(radius * 1.9, smoothed[i]));
          }
        }
      }

      // ---- Dessin
      const button = buttonRef.current;
      if (button) button.style.transform = `translate(${x - radius * 1.5}px, ${y - radius * 1.5}px)`;
      // Écrasement contre le mur : le côté du mur s'aplatit, le côté opposé
      // ne bouge presque pas, la bulle s'élargit le long du mur.
      const squashX = wallX.pen / (radius * 2);
      const squashY = wallY.pen / (radius * 2);
      const sx = (1 - squashX) / Math.sqrt(1 - squashY);
      const sy = (1 - squashY) / Math.sqrt(1 - squashX);
      const tx = -wallX.side * wallX.pen * 0.5;
      const ty = -wallY.side * wallY.pen * 0.5;
      bodyRef.current?.setAttribute(
        'transform',
        `translate(${f2(tx)} ${f2(ty)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) rotate(${heading.toFixed(1)}) scale(${(1 + stretch).toFixed(3)} ${(1 - stretch * 0.7).toFixed(3)}) rotate(${(-heading).toFixed(1)})`,
      );
      const list = pieces.current;
      // Pendant la reconstitution, le liquide « porte » plus loin : les ponts se forment plus tôt.
      // Le filtre « liquide » ne sert qu'à relier les morceaux : on ne le calcule
      // que pendant la coupure, dans une zone ajustée autour d'eux (gros gain sur téléphone).
      const goo = gooRef.current;
      if (goo && !!list !== gooOn) {
        gooOn = !!list;
        if (gooOn) goo.setAttribute('filter', `url(#${gooId})`);
        else goo.removeAttribute('filter');
      }
      if (list) {
        blurRef.current?.setAttribute('stdDeviation', f2(radius * 0.15));
        let ext = radius * 2.2;
        for (const piece of list) ext = Math.max(ext, Math.abs(piece.x) + piece.r * 2.2, Math.abs(piece.y) + piece.r * 2.2);
        const filter = filterRef.current;
        if (filter) {
          filter.setAttribute('x', f2(-ext));
          filter.setAttribute('y', f2(-ext));
          filter.setAttribute('width', f2(ext * 2));
          filter.setAttribute('height', f2(ext * 2));
        }
      }
      if (list) {
        shapeRef.current?.setAttribute('d', '');
        for (let i = 0; i < MAX_PIECES; i++) {
          const el = pieceRefs.current[i];
          const piece = list[i];
          if (!el) continue;
          if (!piece) {
            el.setAttribute('d', '');
            continue;
          }
          // Goutte étirée dans le sens où elle file, comme du mercure.
          const v = Math.hypot(piece.vx, piece.vy);
          const sx = 1 + Math.min(0.55, v / 1400);
          const sy = 1 / Math.sqrt(sx);
          const angle = (Math.atan2(piece.vy, piece.vx) * 180) / Math.PI;
          el.setAttribute('d', bubblePath(piece.r * 1.06, ripple * 1.5 + piece.phase, 1.5, phases, undefined, noiseSmooth, 0.06));
          el.setAttribute(
            'transform',
            `translate(${f2(piece.x)} ${f2(piece.y)}) rotate(${angle.toFixed(1)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) rotate(${(-angle).toFixed(1)})`,
          );
        }
      } else {
        for (const el of pieceRefs.current) el?.setAttribute('d', '');
        shapeRef.current?.setAttribute(
          'd',
          bubblePath(radius, ripple, wobble, phases, offsets, noiseSmooth, hovered.current ? 0.05 : 0.03),
        );
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [radius, phases, reducedMotion]);

  const explode = (event: React.MouseEvent) => {
    if (burst.current) return;
    // Sur téléphone, glisser le doigt sert à jouer avec la bulle : seul un vrai
    // toucher (sans déplacement) la fait éclater.
    const start = tapStart.current;
    tapStart.current = null;
    if (event.detail > 0 && start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 14) return;
    burst.current = true;
    if ('vibrate' in navigator) navigator.vibrate?.(18);
    // À l'endroit du clic (ou au centre de la bulle au clavier).
    const fromPointer = event.detail > 0;
    const x = fromPointer ? event.clientX : position.current.x;
    const y = fromPointer ? event.clientY : position.current.y;
    // Direction du coup : celle du dernier geste, sinon au hasard.
    const p = pointer.current;
    const direction = Math.hypot(p.vx, p.vy) > 250 ? Math.atan2(p.vy, p.vx) : null;
    bodyRef.current?.setAttribute('transform', 'scale(1.14)');
    window.setTimeout(() => {
      const created = makeSplat(x, y, radius, direction);
      setSplat(created);
      onSplat?.(created);
    }, reducedMotion ? 0 : 80);
    window.setTimeout(onBurst, reducedMotion ? 500 : 1150);
  };

  const size = radius * 3;
  const area = radius * 9;

  return (
    <>
      {/* Éclaboussure (dessin vectoriel : nette à toutes les tailles) */}
      {splat && (
        <svg className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true" shapeRendering="geometricPrecision">
          <g transform={`translate(${splat.x} ${splat.y})`}>
            <SplatShapes splat={splat} animated={!reducedMotion} />
          </g>
        </svg>
      )}

      {/* La bulle */}
      {!splat && (
        <button
          ref={buttonRef}
          type="button"
          aria-label="Entrer dans la galerie"
          data-cursor-plain
          onClick={explode}
          onPointerDown={(event) => (tapStart.current = { x: event.clientX, y: event.clientY })}
          onPointerEnter={() => (hovered.current = true)}
          onPointerLeave={() => (hovered.current = false)}
          onFocus={() => (hovered.current = true)}
          onBlur={() => (hovered.current = false)}
          className="fixed left-0 top-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
          style={{ width: size, height: size, transform: 'translate(-9999px, -9999px)', WebkitTapHighlightColor: 'transparent', willChange: 'transform' }}
        >
          <motion.svg
            width={size}
            height={size}
            viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
            initial={reducedMotion ? false : { scale: 0 }}
            animate={{ scale: visible ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 11, mass: 0.9 }}
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Matière liquide : les formes proches se relient par des ponts d'encre. */}
              <filter
                ref={filterRef}
                id={gooId}
                filterUnits="userSpaceOnUse"
                x={-area}
                y={-area}
                width={area * 2}
                height={area * 2}
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation={radius * 0.11} result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 30 -13" />
              </filter>
            </defs>
            <g ref={gooRef} fill={INK}>
              <g ref={bodyRef}>
                <path ref={shapeRef} d={bubblePath(radius, 0, 1, phases)} />
              </g>
              {Array.from({ length: MAX_PIECES }, (_, i) => (
                <path
                  key={i}
                  ref={(el) => {
                    pieceRefs.current[i] = el;
                  }}
                  d=""
                />
              ))}
            </g>
          </motion.svg>
        </button>
      )}
    </>
  );
}
