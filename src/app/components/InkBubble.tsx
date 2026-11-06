// Page d'accueil : une bulle d'encre noire flotte sur la page blanche.
// Survolée, elle se déforme comme un liquide, d'autant plus que la souris va vite.
// Un clic (ou Entrée) la fait éclater en tache d'encre, puis on part vers la galerie.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const INK = '#000000';

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

/** Nombre de points du contour de la bulle (chacun réagit comme un ressort). */
const VERTICES = 28;

/** Contour de la bulle : un cercle qui ondule comme un liquide, déformé par `offsets`. */
function bubblePath(r: number, t: number, wobble: number, phases: number[], offsets?: Float32Array): string {
  const points: Point[] = [];
  for (let i = 0; i < VERTICES; i++) {
    const a = (i / VERTICES) * Math.PI * 2;
    const k =
      1 +
      wobble *
        (0.05 * Math.sin(2 * a + t * 1.3 + phases[0]) +
          0.035 * Math.sin(3 * a - t * 1.9 + phases[1]) +
          0.02 * Math.sin(5 * a + t * 2.6 + phases[2]));
    const radius = r * k + (offsets ? offsets[i] : 0);
    points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
  }
  return smoothClosedPath(points);
}

// ---------- Tache d'encre ----------

interface Splat {
  x: number;
  y: number;
  stain: string;
  satellites: Array<{ d: string; delay: number }>;
  drops: Array<{ dx: number; dy: number; rx: number; ry: number; angle: number; delay: number; duration: number }>;
}

/** Rayon interpolé sur un contour fermé (Catmull-Rom périodique). */
function periodicRadius(radii: number[], position: number): number {
  const n = radii.length;
  const i = Math.floor(position);
  const t = position - i;
  const p0 = radii[(i - 1 + n) % n];
  const p1 = radii[i % n];
  const p2 = radii[(i + 1) % n];
  const p3 = radii[(i + 2) % n];
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  );
}

function makeSplat(x: number, y: number, r: number): Splat {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  // Forme générale : contour irrégulier avec quelques coulures en lobe.
  const count = 36;
  const base = r * 2.3;
  const radii = Array.from({ length: count }, () => base * rand(0.82, 1.08));
  const spikes = new Set<number>();
  while (spikes.size < 5) spikes.add(Math.floor(Math.random() * count));
  for (const i of spikes) {
    const reach = rand(1.35, 1.95);
    radii[i] = base * reach;
    radii[(i + 1) % count] = Math.max(radii[(i + 1) % count], base * (1 + (reach - 1) * 0.45));
    radii[(i - 1 + count) % count] = Math.max(radii[(i - 1 + count) % count], base * (1 + (reach - 1) * 0.45));
  }

  // Bord précis : 4 fois plus de points, avec de fines irrégularités d'encre.
  const fine = count * 4;
  const ph = [rand(0, 6.3), rand(0, 6.3), rand(0, 6.3)];
  const stainPoints: Point[] = Array.from({ length: fine }, (_, j) => {
    const a = (j / fine) * Math.PI * 2;
    const detail =
      1 + 0.022 * Math.sin(23 * a + ph[0]) + 0.014 * Math.sin(41 * a + ph[1]) + 0.008 * Math.sin(67 * a + ph[2]) + rand(-0.01, 0.01);
    const radius = periodicRadius(radii, (j / fine) * count) * detail;
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  });

  // Petites taches collées au bord.
  const satellites = Array.from({ length: 5 }, () => {
    const a = rand(0, Math.PI * 2);
    const dist = base * rand(1.05, 1.45);
    const sr = r * rand(0.18, 0.42);
    const cx = Math.cos(a) * dist;
    const cy = Math.sin(a) * dist;
    const pts: Point[] = Array.from({ length: 18 }, (_, i) => {
      const b2 = (i / 18) * Math.PI * 2;
      const rr = sr * (1 + 0.12 * Math.sin(3 * b2 + a) + rand(-0.05, 0.05));
      return [cx + Math.cos(b2) * rr, cy + Math.sin(b2) * rr];
    });
    return { d: smoothClosedPath(pts), delay: rand(0.04, 0.12) };
  });

  // Gouttelettes projetées, étirées dans le sens de la projection.
  const drops = Array.from({ length: 26 }, () => {
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

  return { x, y, stain: smoothClosedPath(stainPoints), satellites, drops };
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
  const position = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, t: 0 });
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

  // Dérive lente, ondulation et déformation élastique, image par image.
  useEffect(() => {
    let raf = 0;
    let clock = 0;
    let ripple = 0;
    let wobble = 1;
    let last = performance.now();
    let prev = { x: 0, y: 0 };
    let stretch = 0;
    let heading = 0;
    const offsets = new Float32Array(VERTICES);
    const velocities = new Float32Array(VERTICES);
    const smoothed = new Float32Array(VERTICES);

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (burst.current) return;

      // Au survol, la bulle ralentit pour se laisser attraper.
      const speed = hovered.current ? 0.25 : 1;
      clock += dt * (reducedMotion ? 0 : speed);
      wobble += ((hovered.current ? 1.2 : 1) - wobble) * Math.min(1, dt * 6);
      ripple += dt * (reducedMotion ? 0 : hovered.current ? 2.4 : 1.6);

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

      // Étirement léger dans le sens de la dérive.
      const vx = (x - prev.x) / Math.max(dt, 0.001);
      const vy = (y - prev.y) / Math.max(dt, 0.001);
      prev = { x, y };
      const v = Math.hypot(vx, vy);
      stretch += (Math.min(0.1, v / 900) - stretch) * Math.min(1, dt * 4);
      if (v > 4) heading = (Math.atan2(vy, vx) * 180) / Math.PI;

      // ---- Déformation par la souris : plus elle va vite, plus la bulle se tord.
      if (!reducedMotion) {
        const p = pointer.current;
        // La vitesse retombe si la souris s'arrête.
        if (now - p.t > 60) {
          p.vx *= 0.8;
          p.vy *= 0.8;
        }
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy);
        const reach = radius * 2.4;
        const influence = Math.max(0, Math.min(1, (reach - dist) / (reach - radius * 0.6)));
        const mouseSpeed = Math.hypot(p.vx, p.vy);
        // Poussée plus que proportionnelle à la vitesse : un passage rapide reste
        // moins longtemps sur la bulle, il doit donc pousser beaucoup plus fort.
        const force = influence * Math.min(Math.pow(mouseSpeed / 1000, 1.9), 12);
        const mdx = mouseSpeed > 1 ? p.vx / mouseSpeed : 0;
        const mdy = mouseSpeed > 1 ? p.vy / mouseSpeed : 0;
        const cursorAngle = Math.atan2(dy, dx);

        const stiffness = 170;
        const damping = 9;
        for (let i = 0; i < VERTICES; i++) {
          const a = (i / VERTICES) * Math.PI * 2;
          const ux = Math.cos(a);
          const uy = Math.sin(a);
          // L'encre est entraînée dans le sens du geste…
          const align = ux * mdx + uy * mdy;
          // …et tirée vers le curseur là où il la touche.
          let diff = Math.abs(a - cursorAngle) % (Math.PI * 2);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;
          const near = Math.exp(-(diff * diff) / 0.3);
          const push = force * radius * (0.6 * align + 0.5 * near * Math.max(0.2, align + 0.6));
          const accel = -stiffness * offsets[i] - damping * velocities[i] + push * 52;
          velocities[i] += accel * dt;
          offsets[i] += velocities[i] * dt;
        }
        // Tension de surface : chaque point est lissé avec ses voisins.
        for (let i = 0; i < VERTICES; i++) {
          const prevI = offsets[(i - 1 + VERTICES) % VERTICES];
          const nextI = offsets[(i + 1) % VERTICES];
          smoothed[i] = offsets[i] * 0.6 + (prevI + nextI) * 0.2;
        }
        for (let i = 0; i < VERTICES; i++) {
          offsets[i] = Math.max(-radius * 0.5, Math.min(radius * 1.5, smoothed[i]));
        }
      }

      const button = buttonRef.current;
      if (button) button.style.transform = `translate(${x - radius * 1.5}px, ${y - radius * 1.5}px)`;
      bodyRef.current?.setAttribute(
        'transform',
        `rotate(${heading.toFixed(1)}) scale(${(1 + stretch).toFixed(3)} ${(1 - stretch * 0.7).toFixed(3)}) rotate(${(-heading).toFixed(1)})`,
      );
      shapeRef.current?.setAttribute('d', bubblePath(radius, ripple, wobble, phases, offsets));
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
    bodyRef.current?.setAttribute('transform', 'scale(1.14)');
    window.setTimeout(() => setSplat(makeSplat(x, y, radius)), reducedMotion ? 0 : 90);
    window.setTimeout(onBurst, reducedMotion ? 500 : 1150);
  };

  const size = radius * 3;

  return (
    <>
      {/* Tache d'encre laissée sur le fond (dessin vectoriel : net à toutes les tailles) */}
      {splat && (
        <svg className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true" shapeRendering="geometricPrecision">
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
          </motion.svg>
        </button>
      )}
    </>
  );
}
