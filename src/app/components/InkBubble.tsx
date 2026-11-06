// Page d'accueil : une bulle d'encre noire flotte sur la page blanche.
// Un clic (ou Entrée) la fait éclater : une tache d'encre s'étale sur le fond,
// des gouttelettes sont projetées, puis on part vers la galerie.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const INK = '#000000';
const PAPER = '#ffffff';

type Point = [number, number];

/** Courbe fermée lisse passant par tous les points (Catmull-Rom → Bézier). */
function smoothClosedPath(points: Point[], tension = 1): string {
  const n = points.length;
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return `${d} Z`;
}

/** Contour de la bulle : un cercle qui ondule comme un liquide. */
function bubblePath(r: number, t: number, wobble: number, phases: number[]): string {
  const count = 12;
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const k =
      1 +
      wobble *
        (0.05 * Math.sin(2 * a + t * 1.3 + phases[0]) +
          0.035 * Math.sin(3 * a - t * 1.9 + phases[1]) +
          0.02 * Math.sin(5 * a + t * 2.6 + phases[2]));
    points.push([Math.cos(a) * r * k, Math.sin(a) * r * k]);
  }
  return smoothClosedPath(points);
}

/** Arc de reflet (comme les deux traits dans la bulle du logo). */
function arc(r: number, from: number, to: number): string {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = Math.cos(rad(from)) * r;
  const y1 = Math.sin(rad(from)) * r;
  const x2 = Math.cos(rad(to)) * r;
  const y2 = Math.sin(rad(to)) * r;
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r.toFixed(2)},${r.toFixed(2)} 0 0 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

// ---------- Tache d'encre ----------

interface Splat {
  x: number;
  y: number;
  stain: string;
  satellites: Array<{ d: string; delay: number }>;
  drops: Array<{ dx: number; dy: number; rx: number; ry: number; angle: number; delay: number; duration: number }>;
}

function makeSplat(x: number, y: number, r: number): Splat {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  // Tache principale : contour irrégulier avec quelques coulures en pointe.
  const count = 36;
  const base = r * 2.3;
  const radii = Array.from({ length: count }, () => base * rand(0.82, 1.08));
  // Coulures : un lobe allongé qui s'affine progressivement (pas une aiguille).
  const spikes = new Set<number>();
  while (spikes.size < 5) spikes.add(Math.floor(Math.random() * count));
  for (const i of spikes) {
    const reach = rand(1.35, 1.95);
    radii[i] = base * reach;
    radii[(i + 1) % count] = Math.max(radii[(i + 1) % count], base * (1 + (reach - 1) * 0.45));
    radii[(i - 1 + count) % count] = Math.max(radii[(i - 1 + count) % count], base * (1 + (reach - 1) * 0.45));
  }
  const stainPoints: Point[] = radii.map((radius, i) => {
    const a = (i / count) * Math.PI * 2 + rand(-0.04, 0.04);
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  });

  // Petites taches collées au bord.
  const satellites = Array.from({ length: 5 }, () => {
    const a = rand(0, Math.PI * 2);
    const dist = base * rand(1.05, 1.45);
    const sr = r * rand(0.18, 0.42);
    const cx = Math.cos(a) * dist;
    const cy = Math.sin(a) * dist;
    const pts: Point[] = Array.from({ length: 8 }, (_, i) => {
      const b = (i / 8) * Math.PI * 2;
      const rr = sr * rand(0.8, 1.15);
      return [cx + Math.cos(b) * rr, cy + Math.sin(b) * rr];
    });
    return { d: smoothClosedPath(pts), delay: rand(0.04, 0.12) };
  });

  // Gouttelettes projetées, étirées dans le sens de la projection.
  const drops = Array.from({ length: 22 }, () => {
    const a = rand(0, Math.PI * 2);
    const dist = r * rand(2.6, 7.5);
    const size = r * rand(0.05, 0.2) * (1.6 - dist / (r * 7.5));
    return {
      dx: Math.cos(a) * dist,
      dy: Math.sin(a) * dist,
      rx: size * rand(1.2, 2.4),
      ry: size,
      angle: (a * 180) / Math.PI,
      delay: rand(0, 0.06),
      duration: rand(0.28, 0.5),
    };
  });

  return { x, y, stain: smoothClosedPath(stainPoints, 0.9), satellites, drops };
}

// ---------- Composant ----------

interface InkBubbleProps {
  /** Appelé quand la tache a fini de s'étaler. */
  onBurst: () => void;
}

export function InkBubble({ onBurst }: InkBubbleProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const shapeRef = useRef<SVGPathElement>(null);
  const shineRef = useRef<SVGGElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const hovered = useRef(false);
  const burst = useRef(false);
  const [radius, setRadius] = useState(56);
  const [splat, setSplat] = useState<Splat | null>(null);
  const [visible, setVisible] = useState(false);

  const phases = useMemo(() => Array.from({ length: 6 }, () => Math.random() * Math.PI * 2), []);

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

  // Dérive lente et ondulation, image par image (sans repasser par React).
  useEffect(() => {
    let raf = 0;
    let clock = 0;
    let ripple = 0;
    let wobble = 1;
    let last = performance.now();
    let prev = { x: 0, y: 0 };
    let stretch = 0;
    let heading = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (burst.current) return;

      // Au survol, la bulle ralentit et frémit davantage.
      const speed = hovered.current ? 0.25 : 1;
      clock += dt * (reducedMotion ? 0 : speed);
      wobble += ((hovered.current ? 1.45 : 1) - wobble) * Math.min(1, dt * 6);
      ripple += dt * (reducedMotion ? 0 : hovered.current ? 3.2 : 1.6);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const marginX = radius * 1.6;
      const marginTop = radius * 1.6;
      const marginBottom = radius * 1.6 + 70; // laisse le logo respirer
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

      // Étirement dans le sens du mouvement.
      const vx = (x - prev.x) / Math.max(dt, 0.001);
      const vy = (y - prev.y) / Math.max(dt, 0.001);
      prev = { x, y };
      const v = Math.hypot(vx, vy);
      stretch += (Math.min(0.12, v / 900) - stretch) * Math.min(1, dt * 4);
      if (v > 4) heading = (Math.atan2(vy, vx) * 180) / Math.PI;

      const button = buttonRef.current;
      if (button) button.style.transform = `translate(${x - radius * 1.5}px, ${y - radius * 1.5}px)`;
      bodyRef.current?.setAttribute(
        'transform',
        `rotate(${heading.toFixed(1)}) scale(${(1 + stretch).toFixed(3)} ${(1 - stretch * 0.7).toFixed(3)}) rotate(${(-heading).toFixed(1)})`,
      );
      shapeRef.current?.setAttribute('d', bubblePath(radius, ripple, wobble, phases));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [radius, phases, reducedMotion]);

  const explode = () => {
    if (burst.current) return;
    burst.current = true;
    if ('vibrate' in navigator) navigator.vibrate?.(18);
    const { x, y } = position.current;
    // Petit gonflement avant d'éclater.
    shineRef.current?.setAttribute('opacity', '0');
    bodyRef.current?.setAttribute('transform', 'scale(1.14)');
    window.setTimeout(() => setSplat(makeSplat(x, y, radius)), reducedMotion ? 0 : 90);
    window.setTimeout(onBurst, reducedMotion ? 500 : 1150);
  };

  const size = radius * 3;

  return (
    <>
      {/* Tache d'encre laissée sur le fond */}
      {splat && (
        <svg className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true">
          <g transform={`translate(${splat.x} ${splat.y})`} fill={INK}>
            <motion.path
              d={splat.stain}
              initial={reducedMotion ? false : { scale: 0.25 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 26, mass: 0.6 }}
            />
            {splat.satellites.map((s, i) => (
              <motion.path
                key={`s${i}`}
                d={s.d}
                initial={reducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: s.delay, type: 'spring', stiffness: 600, damping: 22 }}
              />
            ))}
            {!reducedMotion &&
              splat.drops.map((drop, i) => (
                <motion.ellipse
                  key={`d${i}`}
                  rx={drop.rx}
                  ry={drop.ry}
                  initial={{ x: 0, y: 0, rotate: drop.angle, scale: 0.4 }}
                  animate={{ x: drop.dx, y: drop.dy, rotate: drop.angle, scale: 1 }}
                  transition={{ delay: drop.delay, duration: drop.duration, ease: [0.12, 0.8, 0.25, 1] }}
                />
              ))}
          </g>
        </svg>
      )}

      {/* La bulle */}
      {!splat && (
        <button
          ref={buttonRef}
          type="button"
          aria-label="Entrer dans la galerie"
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
            <g ref={bodyRef}>
              <path ref={shapeRef} d={bubblePath(radius, 0, 1, phases)} fill={INK} />
            </g>
            <g ref={shineRef} fill="none" stroke={PAPER} strokeLinecap="round">
              <path d={arc(radius * 0.7, -62, -28)} strokeWidth={radius * 0.085} />
              <path d={arc(radius * 0.52, -58, -38)} strokeWidth={radius * 0.065} />
            </g>
          </motion.svg>
        </button>
      )}
    </>
  );
}
