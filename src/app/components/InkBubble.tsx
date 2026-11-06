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
  /** Impact central aux bords festonnés. */
  core: string;
  /** Jets effilés terminés par une goutte ronde. */
  spines: string;
  /** Gouttes (chapelets, larmes, bruine), regroupées par distance pour l'animation. */
  flecks: string[];
}

/** Cercle en chemin SVG. */
function circlePath(cx: number, cy: number, r: number): string {
  return `M${f2(cx - r)},${f2(cy)} a${f2(r)},${f2(r)} 0 1 0 ${f2(r * 2)},0 a${f2(r)},${f2(r)} 0 1 0 ${f2(-r * 2)},0 Z`;
}

/** Goutte en larme : tête ronde au bout, queue effilée vers l'impact. */
function teardrop(cx: number, cy: number, angle: number, head: number, tail: number): string {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;
  const pts: Point[] = [];
  // Queue (vers le centre) puis tour de la tête.
  const tipX = cx - ux * tail;
  const tipY = cy - uy * tail;
  pts.push([tipX, tipY]);
  for (let i = 0; i <= 10; i++) {
    const t = -Math.PI / 2 + (i / 10) * Math.PI;
    const k = Math.cos(t);
    const along = Math.sin(t);
    pts.push([cx + px * head * along * -1 + ux * head * k * 0.9, cy + py * head * along * -1 + uy * head * k * 0.9]);
  }
  return smoothClosedPath(pts, 0.7);
}

function makeSplat(x: number, y: number, r: number, direction: number | null): Splat {
  const R = r * 1.75;
  const dir = direction ?? rand(0, Math.PI * 2);
  const aimed = (spread: number, bias: number) =>
    Math.random() < bias ? dir + randn() * spread : rand(0, Math.PI * 2);

  // Impact : bord organique festonné, légèrement étiré dans le sens du coup.
  const ph = Array.from({ length: 4 }, () => rand(0, 6.3));
  const corePts: Point[] = [];
  const count = 64;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const toward = Math.cos(a - dir);
    const k =
      0.95 +
      0.1 * toward +
      0.07 * Math.sin(3 * a + ph[0]) +
      0.05 * Math.sin(5 * a + ph[1]) +
      0.035 * Math.sin(11 * a + ph[2]) +
      0.02 * Math.sin(19 * a + ph[3]) +
      rand(-0.02, 0.02);
    corePts.push([Math.cos(a) * R * k, Math.sin(a) * R * k]);
  }
  const core = smoothClosedPath(corePts, 0.9);

  // Jets : naissent à l'intérieur de l'impact (raccord arrondi, aucun trou),
  // s'affinent en se courbant un peu et finissent en pointe.
  let spines = '';
  const tips: Array<{ a: number; d: number; head: number }> = [];
  const spineCount = Math.round(rand(12, 19));
  for (let i = 0; i < spineCount; i++) {
    const a = aimed(0.75, 0.5);
    const toward = Math.max(0, Math.cos(a - dir));
    const len = R * rand(0.45, 1.5) * (1 + toward * 0.9);
    const w0 = R * rand(0.12, 0.26);
    const bend = rand(-0.12, 0.12);
    const start = R * 0.45;
    const edge = R * 0.85;
    const end = edge + len;
    const steps = 24;
    const left: Point[] = [];
    const right: Point[] = [];
    let endX = 0;
    let endY = 0;
    for (let s2 = 0; s2 <= steps; s2++) {
      const d = start + ((end - start) * s2) / steps;
      const u = Math.min(1, Math.max(0, (d - edge) / len));
      const ang = a + bend * u * u;
      const cx = Math.cos(ang) * d;
      const cy = Math.sin(ang) * d;
      // Corps qui s'effile jusqu'à la pointe + évasement au raccord avec l'impact.
      const w = w0 * Math.pow(1 - u, 1.7) + w0 * 0.9 * Math.exp(-Math.max(0, d - edge) / (R * 0.12));
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      left.push([cx + nx * w * 0.5, cy + ny * w * 0.5]);
      right.push([cx - nx * w * 0.5, cy - ny * w * 0.5]);
      endX = cx;
      endY = cy;
    }
    spines += polygonPath([...left, ...right.reverse()]) + ' ';
    tips.push({ a: a + bend, d: Math.hypot(endX, endY), head: R * rand(0.03, 0.06) });
  }

  const bands = ['', '', '', ''];
  const bandOf = (dist: number) => Math.max(0, Math.min(3, Math.floor(((dist / R - 1) / 4.2) * 4)));

  // Chapelets : gouttes de plus en plus petites dans le prolongement de certains jets.
  for (const tip of tips) {
    if (Math.random() < 0.4) continue;
    let d = tip.d + tip.head * rand(2, 3.5);
    let size = tip.head * rand(0.55, 0.8);
    const beads = Math.round(rand(2, 6));
    for (let k = 0; k < beads && size > R * 0.008; k++) {
      const a = tip.a + randn() * 0.03;
      bands[bandOf(d)] += teardrop(Math.cos(a) * d, Math.sin(a) * d, a, size, size * rand(1.2, 2)) + ' ';
      d += size * rand(3, 6) + R * rand(0.05, 0.2);
      size *= rand(0.55, 0.8);
    }
  }

  // Larmes isolées, tête vers l'extérieur.
  for (let i = 0; i < 16; i++) {
    const a = aimed(0.8, 0.55);
    const d = R * rand(1.5, 3.8);
    const head = R * rand(0.035, 0.09) * (1.3 - (d / R - 1.5) / 3.8);
    bands[bandOf(d)] += teardrop(Math.cos(a) * d, Math.sin(a) * d, a, head, head * rand(1.6, 3.4)) + ' ';
  }

  // Petites taches rondes et irrégulières près de l'impact.
  for (let i = 0; i < 14; i++) {
    const a = rand(0, Math.PI * 2);
    const d = R * rand(1.05, 1.6);
    const sr = R * rand(0.04, 0.14);
    const cx = Math.cos(a) * d;
    const cy = Math.sin(a) * d;
    const pts: Point[] = Array.from({ length: 9 }, (_, k) => {
      const b = (k / 9) * Math.PI * 2;
      const rr = sr * rand(0.8, 1.15);
      return [cx + Math.cos(b) * rr, cy + Math.sin(b) * rr];
    });
    bands[0] += smoothClosedPath(pts) + ' ';
  }

  // Bruine : micro-gouttes, plus denses dans le sens du coup.
  for (let i = 0; i < 90; i++) {
    const a = aimed(0.7, 0.6);
    const d = R * (1.2 + Math.pow(Math.random(), 1.4) * 4);
    const size = Math.max(0.7, R * rand(0.006, 0.03) * (1.4 - (d / R - 1.2) / 4));
    const stretchK = rand(1, 1.7);
    const cx = Math.cos(a) * d;
    const cy = Math.sin(a) * d;
    if (stretchK > 1.3) bands[bandOf(d)] += teardrop(cx, cy, a, size, size * stretchK * 1.6) + ' ';
    else bands[bandOf(d)] += circlePath(cx, cy, size) + ' ';
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
        initial={from(0.2)}
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
    let heading = 0;
    let cooldown = 0;
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
      const marginX = radius * 1.9;
      const marginTop = radius * 1.9;
      const marginBottom = radius * 1.9 + 70; // laisse le logo respirer
      const ax = w / 2 - marginX;
      const ay = (h - marginTop - marginBottom) / 2;
      const cy = marginTop + ay;
      const x = reducedMotion
        ? w / 2
        : w / 2 + ax * (0.62 * Math.sin(clock * 0.19 + phases[3]) + 0.38 * Math.sin(clock * 0.47 + phases[4]));
      const y = reducedMotion
        ? cy
        : cy + ay * (0.6 * Math.sin(clock * 0.23 + phases[5]) + 0.4 * Math.sin(clock * 0.41 + phases[0]));
      position.current = { x, y };

      // Étirement léger dans le sens de la dérive.
      const vx = (x - prev.x) / Math.max(dt, 0.001);
      const vy = (y - prev.y) / Math.max(dt, 0.001);
      prev = { x, y };
      const v = Math.hypot(vx, vy);
      stretch += (Math.min(0.1, v / 900) - stretch) * Math.min(1, dt * 4);
      if (v > 4) heading = (Math.atan2(vy, vx) * 180) / Math.PI;

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
      bodyRef.current?.setAttribute(
        'transform',
        `rotate(${heading.toFixed(1)}) scale(${(1 + stretch).toFixed(3)} ${(1 - stretch * 0.7).toFixed(3)}) rotate(${(-heading).toFixed(1)})`,
      );
      const list = pieces.current;
      // Pendant la reconstitution, le liquide « porte » plus loin : les ponts se forment plus tôt.
      blurRef.current?.setAttribute('stdDeviation', f2(radius * (list ? 0.15 : 0.11)));
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
          style={{ width: size, height: size, transform: 'translate(-9999px, -9999px)', WebkitTapHighlightColor: 'transparent' }}
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
            <g filter={`url(#${gooId})`} fill={INK}>
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
