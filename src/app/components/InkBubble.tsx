// Page d'accueil : une bulle d'encre noire flotte sur la page blanche.
// Survolée, elle se déforme comme un liquide, d'autant plus que la souris va vite.
// Un clic (ou Entrée) la fait éclater en tache d'encre style comics, puis on part
// vers la galerie.
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

// ---------- Tache d'encre, style comics ----------

interface Splat {
  x: number;
  y: number;
  core: string;
  /** Bras épais qui s'affinent et finissent en goutte ronde. */
  arms: Array<{ d: string; delay: number }>;
  /** Gouttes en forme de larme lancées vers l'extérieur (pointe vers le centre). */
  tears: Array<{ d: string; x: number; y: number; angle: number; delay: number }>;
  /** Points ronds. */
  dots: Array<{ x: number; y: number; r: number; delay: number }>;
}

const fmt = (n: number) => n.toFixed(2);

/** Bras d'éclaboussure le long de l'axe x, puis tourné de `angle` (radians). */
function armPath(start: number, end: number, base: number, neck: number, bulb: number, angle: number): string {
  const neckX = end - bulb * 1.2;
  const local: Array<[string, ...Point[]]> = [
    ['M', [start, -base / 2]],
    ['C', [start + (neckX - start) * 0.3, -base * 0.16], [neckX - (neckX - start) * 0.35, -neck / 2], [neckX, -neck / 2]],
  ];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rot = ([px, py]: Point): string => `${fmt(px * cos - py * sin)},${fmt(px * sin + py * cos)}`;
  let d = '';
  for (const [cmd, ...pts] of local) d += `${cmd}${pts.map(rot).join(' ')} `;
  // Goutte au bout du bras.
  d += `A${fmt(bulb)},${fmt(bulb)} 0 1 1 ${rot([neckX, neck / 2])} `;
  d += `C${rot([neckX - (neckX - start) * 0.35, neck / 2])} ${rot([start + (neckX - start) * 0.3, base * 0.16])} ${rot([start, base / 2])} Z`;
  return d;
}

/** Goutte en larme : rond en bas, pointe en haut (orientée ensuite). */
function tearPath(radius: number, length: number): string {
  const r = radius;
  const L = length;
  return `M0,${fmt(-L)} C${fmt(r * 0.55)},${fmt(-L * 0.55)} ${fmt(r)},${fmt(-r * 0.35)} ${fmt(r)},0 A${fmt(r)},${fmt(r)} 0 1 1 ${fmt(-r)},0 C${fmt(-r)},${fmt(-r * 0.35)} ${fmt(-r * 0.55)},${fmt(-L * 0.55)} 0,${fmt(-L)} Z`;
}

function makeSplat(x: number, y: number, r: number): Splat {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);
  const R = r * 1.9;

  // Corps : rond, bords lisses et francs.
  const ph = [rand(0, 6.3), rand(0, 6.3)];
  const corePoints: Point[] = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(3 * a + ph[0]) + 0.05 * Math.sin(5 * a + ph[1]);
    return [Math.cos(a) * R * k, Math.sin(a) * R * k];
  });

  // Bras : répartis autour, longueurs contrastées (quelques longs, beaucoup de courts).
  const armCount = Math.round(rand(6, 8));
  const offset = rand(0, Math.PI * 2);
  const armAngles: number[] = [];
  const arms = Array.from({ length: armCount }, (_, i) => {
    const angle = offset + (i / armCount) * Math.PI * 2 + rand(-0.22, 0.22);
    armAngles.push(angle);
    const long = Math.random() < 0.35;
    const end = R * (long ? rand(2.0, 2.5) : rand(1.45, 1.8));
    const bulb = R * (long ? rand(0.24, 0.32) : rand(0.19, 0.26));
    return {
      d: armPath(R * 0.55, end, R * rand(0.75, 1.0), R * rand(0.2, 0.28), bulb, angle),
      delay: rand(0, 0.05),
    };
  });

  // Larmes : dans l'axe de certains bras, plus loin, et entre les bras.
  const tears = Array.from({ length: Math.round(rand(6, 9)) }, (_, i) => {
    const angle = i < armCount && Math.random() < 0.6 ? armAngles[i] + rand(-0.08, 0.08) : rand(0, Math.PI * 2);
    const dist = R * rand(2.5, 3.6);
    const radius = R * rand(0.1, 0.17);
    return {
      d: tearPath(radius, radius * rand(2.4, 3.4)),
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      // Pointe vers le centre : la goutte file vers l'extérieur.
      angle: (angle * 180) / Math.PI + 90 + 180,
      delay: rand(0.03, 0.1),
    };
  });

  // Points ronds de tailles variées.
  const dots = Array.from({ length: 16 }, () => {
    const angle = rand(0, Math.PI * 2);
    const dist = R * rand(1.45, 3.4);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: R * rand(0.025, 0.09),
      delay: rand(0.02, 0.12),
    };
  });

  return { x, y, core: smoothClosedPath(corePoints), arms, tears, dots };
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
      {/* Tache d'encre style comics (dessin vectoriel : net à toutes les tailles) */}
      {splat && (
        <svg className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true" shapeRendering="geometricPrecision">
          <g transform={`translate(${splat.x} ${splat.y})`} fill={INK}>
            {/* Impact « pop » : la tache dépasse sa taille puis rebondit. */}
            <motion.g
              initial={reducedMotion ? false : { scale: 0.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 700, damping: 13, mass: 0.7 }}
            >
              <path d={splat.core} />
              {splat.arms.map((arm, i) => (
                <motion.path
                  key={`a${i}`}
                  d={arm.d}
                  initial={reducedMotion ? false : { scale: 0.35 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: arm.delay, type: 'spring', stiffness: 520, damping: 12 }}
                />
              ))}
            </motion.g>
            {splat.tears.map((tear, i) => (
              <motion.g
                key={`t${i}`}
                initial={reducedMotion ? false : { x: 0, y: 0, scale: 0.3 }}
                animate={{ x: tear.x, y: tear.y, scale: 1 }}
                transition={{ delay: tear.delay, duration: 0.38, ease: [0.15, 0.85, 0.3, 1.15] }}
              >
                <path d={tear.d} transform={`rotate(${tear.angle.toFixed(1)})`} />
              </motion.g>
            ))}
            {splat.dots.map((dot, i) => (
              <motion.circle
                key={`p${i}`}
                r={dot.r}
                initial={reducedMotion ? false : { cx: 0, cy: 0, scale: 0 }}
                animate={{ cx: dot.x, cy: dot.y, scale: 1 }}
                transition={{ delay: dot.delay, duration: 0.42, ease: [0.15, 0.85, 0.3, 1.1] }}
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
