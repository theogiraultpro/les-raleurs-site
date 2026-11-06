// Page d'accueil : une bulle d'encre noire flotte sur la page blanche et se déforme
// selon la vitesse de la souris. Coupée d'un geste vif, elle se sépare en morceaux
// qui se lancent des tentacules et se reconstituent (inspiration Venom).
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

interface Tendril {
  /** Morceau d'où part la tentacule, et celui qu'elle vise. */
  src?: Piece;
  dst?: Piece;
  aim: number;
  /** Point de départ (centre du morceau) et rayon de ce morceau. */
  ox: number;
  oy: number;
  baseR: number;
  angle: number;
  length: number;
  width: number;
  life: number;
  age: number;
  curl: number;
  phase: number;
}

/** Tentacule d'encre : part du bord, s'affine et se tord (forme pleine). */
function tendrilPath(td: Tendril, t: number): string {
  const r = td.baseR;
  const grow = Math.pow(Math.sin(Math.PI * Math.min(1, td.age / td.life)), 0.7);
  const L = td.length * grow;
  if (L < r * 0.05) return '';
  const steps = 10;
  const left: Point[] = [];
  const right: Point[] = [];
  let px = td.ox + Math.cos(td.angle) * r * 0.7;
  let py = td.oy + Math.sin(td.angle) * r * 0.7;
  for (let s = 0; s <= steps; s++) {
    const u = s / steps;
    const dir = td.angle + td.curl * Math.pow(u, 1.4) * Math.sin(t * 3.1 + td.phase + u * 2.5);
    if (s > 0) {
      px += Math.cos(dir) * (L / steps + (r * 0.25) / steps);
      py += Math.sin(dir) * (L / steps + (r * 0.25) / steps);
    }
    const w = td.width * Math.pow(1 - u, 1.25) * (0.6 + 0.4 * grow) + r * 0.012;
    const nx = -Math.sin(dir);
    const ny = Math.cos(dir);
    left.push([px + nx * w * 0.5, py + ny * w * 0.5]);
    right.push([px - nx * w * 0.5, py - ny * w * 0.5]);
  }
  return polygonPath([...left, ...right.reverse()]);
}

/** Filament visqueux entre deux morceaux : épais aux bouts, fin au milieu. */
function strandPath(ax: number, ay: number, bx: number, by: number, width: number, bend: number): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  const steps = 12;
  const left: Point[] = [];
  const right: Point[] = [];
  for (let s = 0; s <= steps; s++) {
    const u = s / steps;
    const x = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * cx + u * u * bx;
    const y = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * cy + u * u * by;
    const tx = 2 * (1 - u) * (cx - ax) + 2 * u * (bx - cx);
    const ty = 2 * (1 - u) * (cy - ay) + 2 * u * (by - cy);
    const tl = Math.hypot(tx, ty) || 1;
    const w = width * (0.28 + 0.72 * Math.pow(2 * u - 1, 2));
    left.push([x - (ty / tl) * w * 0.5, y + (tx / tl) * w * 0.5]);
    right.push([x + (ty / tl) * w * 0.5, y - (tx / tl) * w * 0.5]);
  }
  return polygonPath([...left, ...right.reverse()]);
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

  // Jets : partent du bord, s'affinent en se courbant un peu, finissent en goutte.
  let spines = '';
  const tips: Array<{ a: number; d: number; head: number }> = [];
  const spineCount = Math.round(rand(12, 19));
  for (let i = 0; i < spineCount; i++) {
    const a = aimed(0.75, 0.5);
    const toward = Math.max(0, Math.cos(a - dir));
    const len = R * rand(0.45, 1.5) * (1 + toward * 0.9);
    const w0 = R * rand(0.14, 0.3);
    const neck = R * rand(0.025, 0.05);
    const bend = rand(-0.12, 0.12);
    const start = R * 0.72;
    const steps = 16;
    const left: Point[] = [];
    const right: Point[] = [];
    let endX = 0;
    let endY = 0;
    for (let s2 = 0; s2 <= steps; s2++) {
      const u = s2 / steps;
      const ang = a + bend * u * u;
      const d = start + len * u;
      const cx = Math.cos(ang) * d;
      const cy = Math.sin(ang) * d;
      const w = w0 * Math.pow(1 - u, 2.4) + neck;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      left.push([cx + nx * w * 0.5, cy + ny * w * 0.5]);
      right.push([cx - nx * w * 0.5, cy - ny * w * 0.5]);
      endX = cx;
      endY = cy;
    }
    const head = Math.max(neck * 1.3, R * rand(0.05, 0.11) * (0.8 + len / (R * 2.5)));
    spines += polygonPath([...left, ...right.reverse()]) + ' ' + circlePath(endX, endY, head) + ' ';
    tips.push({ a: a + bend, d: start + len, head });
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
const MAX_TENDRILS = 14;

export function InkBubble({ onSplat, onBurst }: InkBubbleProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const shapeRef = useRef<SVGPathElement>(null);
  const tendrilsRef = useRef<SVGPathElement>(null);
  const strandsRef = useRef<SVGPathElement>(null);
  const pieceRefs = useRef<Array<SVGPathElement | null>>([]);
  const position = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, t: 0 });
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
      if (p.t && dt < 0.2) {
        // Vitesse lissée, en pixels par seconde.
        p.vx = p.vx * 0.5 + ((event.clientX - p.x) / dt) * 0.5;
        p.vy = p.vy * 0.5 + ((event.clientY - p.y) / dt) * 0.5;
      }
      p.x = event.clientX;
      p.y = event.clientY;
      p.t = now;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
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
    let nextTendril = rand(0.6, 1.6);
    const offsets = new Float32Array(VERTICES);
    const velocities = new Float32Array(VERTICES);
    const smoothed = new Float32Array(VERTICES);
    const noise = new Float32Array(VERTICES);
    const noiseSmooth = new Float32Array(VERTICES);
    const tendrils: Tendril[] = [];

    /** Tentacule d'un morceau vers un autre (seulement pendant la reconstitution). */
    const spawnTendril = (from: Piece, to: Piece) => {
      if (tendrils.length >= MAX_TENDRILS) return;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const gap = Math.max(0, Math.hypot(dx, dy) - from.r * 0.7);
      tendrils.push({
        src: from,
        dst: to,
        aim: randn() * 0.35,
        ox: from.x,
        oy: from.y,
        baseR: from.r,
        angle: Math.atan2(dy, dx) + randn() * 0.35,
        length: gap * rand(0.45, 1.05),
        width: from.r * rand(0.18, 0.34),
        life: rand(0.35, 0.8),
        age: 0,
        curl: rand(0.3, 1) * (Math.random() < 0.5 ? -1 : 1),
        phase: rand(0, 6.3),
      });
    };

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

        // ---- Tentacules (uniquement quand la bulle est coupée) : les morceaux se lancent
        // des filaments pour s'agripper et se recoller.
        nextTendril -= dt;
        const cut = pieces.current;
        if (cut && cut.length > 1 && nextTendril <= 0) {
          const i = 1 + Math.floor(Math.random() * (cut.length - 1));
          if (Math.random() < 0.5) spawnTendril(cut[i], cut[0]);
          else spawnTendril(cut[0], cut[i]);
          nextTendril = rand(0.04, 0.12);
        }
        for (const td of tendrils) {
          td.age += dt;
          // La tentacule suit son morceau et vise toujours sa cible.
          if (td.src && td.dst) {
            td.ox = td.src.x;
            td.oy = td.src.y;
            td.baseR = td.src.r;
            td.angle = Math.atan2(td.dst.y - td.src.y, td.dst.x - td.src.x) + td.aim;
          }
        }
        for (let i = tendrils.length - 1; i >= 0; i--) {
          const td = tendrils[i];
          const gone = td.src && pieces.current && !pieces.current.includes(td.src);
          if (td.age >= td.life || gone) tendrils.splice(i, 1);
        }

        // ---- Coupure : un geste vif qui traverse le cœur coupe la bulle en morceaux.
        if (!pieces.current && cooldown === 0 && mouseSpeed > 1600 && dist < radius * 0.6 && now - p.t < 50) {
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
              pull: rand(7, 17),
              phase: rand(0, 6.3),
            };
          });
          tendrils.length = 0;
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
            // Errance aléatoire, comme une matière vivante.
            piece.vx += (-piece.pull * ox - 2.1 * piece.vx + randn() * 320) * dt;
            piece.vy += (-piece.pull * oy - 2.1 * piece.vy + randn() * 320) * dt;
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
            if (gap < main.r * 0.55 && slow) {
              main.r = Math.sqrt(main.r * main.r + piece.r * piece.r);
              list.splice(i, 1);
            }
          }
          if (list.length === 1 && Math.hypot(main.x, main.y) < radius * 0.1) {
            pieces.current = null;
            tendrils.length = 0;
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
      if (list) {
        shapeRef.current?.setAttribute('d', '');
        let strands = '';
        const main = list[0];
        for (let i = 0; i < MAX_PIECES; i++) {
          const el = pieceRefs.current[i];
          const piece = list[i];
          if (!el) continue;
          if (!piece) {
            el.setAttribute('d', '');
            continue;
          }
          el.setAttribute('d', bubblePath(piece.r, ripple * 1.5 + piece.phase, 1.8, phases, undefined, noiseSmooth, 0.12));
          el.setAttribute('transform', `translate(${f2(piece.x)} ${f2(piece.y)})`);
          if (i > 0) {
            // Filaments : s'amincissent avec la distance puis cassent.
            const gap = Math.hypot(piece.x - main.x, piece.y - main.y) - piece.r - main.r * 0.6;
            // Plusieurs filaments, du plus épais au plus fin ; les fins cassent les premiers.
            const fibers: Array<[number, number, number]> = [
              [0.4, 1, 4.2],
              [0.22, -1.7, 3.4],
              [0.12, 2.6, 2.6],
              [0.06, -0.6, 2],
            ];
            for (const [weight, bendK, reachK] of fibers) {
              const thickness = radius * weight * Math.pow(Math.max(0, 1 - gap / (radius * reachK)), 0.7);
              if (thickness > radius * 0.018) {
                const bend = Math.sin(ripple * 2 + piece.phase + bendK) * radius * 0.3 * bendK;
                strands += strandPath(main.x, main.y, piece.x, piece.y, thickness, bend) + ' ';
              }
            }
            // Filament secondaire entre deux petits morceaux proches.
            const other = list[i + 1];
            if (other) {
              const g2 = Math.hypot(other.x - piece.x, other.y - piece.y) - other.r - piece.r;
              const t2 = radius * 0.14 * Math.max(0, 1 - g2 / (radius * 2.4));
              if (t2 > radius * 0.018) strands += strandPath(piece.x, piece.y, other.x, other.y, t2, radius * 0.2) + ' ';
            }
          }
        }
        strandsRef.current?.setAttribute('d', strands);
        tendrilsRef.current?.setAttribute('d', tendrils.map((td) => tendrilPath(td, ripple)).join(' '));
      } else {
        for (const el of pieceRefs.current) el?.setAttribute('d', '');
        strandsRef.current?.setAttribute('d', '');
        shapeRef.current?.setAttribute(
          'd',
          bubblePath(radius, ripple, wobble, phases, offsets, noiseSmooth, hovered.current ? 0.05 : 0.03),
        );
        tendrilsRef.current?.setAttribute('d', '');
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [radius, phases, reducedMotion]);

  const explode = (event: React.MouseEvent) => {
    if (burst.current) return;
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
                <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.11} result="blur" />
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
            {/* Tentacules et filaments : dessinés nets, hors du filtre, pour rester fins. */}
            <g fill={INK}>
              <path ref={tendrilsRef} d="" />
              <path ref={strandsRef} d="" />
            </g>
          </motion.svg>
        </button>
      )}
    </>
  );
}
