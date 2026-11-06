// Page d'accueil : une bulle d'encre noire flotte sur la page blanche.
// Survolée, elle se déforme comme un liquide, d'autant plus que la souris va vite.
// Un clic (ou Entrée) la fait éclater en tache d'encre de Chine, puis on part
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

// ---------- Tache d'encre de Chine ----------

interface Splat {
  x: number;
  y: number;
  r: number;
  seed: number;
  /** Corps de la tache + coulures terminées par une goutte (passés au filtre « liquide »). */
  body: string;
  tips: Array<{ cx: number; cy: number; r: number; delay: number }>;
  /** Fines projections autour. */
  specks: Array<{ dx: number; dy: number; rx: number; ry: number; angle: number; delay: number; duration: number }>;
}

function makeSplat(x: number, y: number, r: number): Splat {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);
  const R = r * 2.2;

  // Corps : bord ondulé à plusieurs échelles (grosses vagues + petites irrégularités).
  const count = 64;
  const ph = Array.from({ length: 4 }, () => rand(0, Math.PI * 2));
  const corePoints: Point[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const k =
      1 +
      0.12 * Math.sin(3 * a + ph[0]) +
      0.08 * Math.sin(5 * a + ph[1]) +
      0.05 * Math.sin(9 * a + ph[2]) +
      0.03 * Math.sin(17 * a + ph[3]) +
      rand(-0.035, 0.035);
    corePoints.push([Math.cos(a) * R * k, Math.sin(a) * R * k]);
  }
  let body = smoothClosedPath(corePoints);

  // Coulures : rayons fins qui s'affinent puis finissent en goutte ronde.
  const tips: Splat['tips'] = [];
  const rays = Math.round(rand(11, 16));
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + rand(-0.25, 0.25);
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const px = -uy;
    const py = ux;
    const start = R * 0.75;
    const length = R * rand(0.35, 1.5);
    const w0 = R * rand(0.1, 0.22);
    const neck = w0 * rand(0.12, 0.25);
    const end = start + length;
    const at = (d: number, w: number, side: number): Point => [ux * d + px * w * side, uy * d + py * w * side];
    const ray: Point[] = [
      at(start, w0 / 2, -1),
      at(start + length * 0.35, w0 * 0.28, -1),
      at(start + length * 0.75, neck / 2, -1),
      at(end, neck * 0.3, -1),
      at(end, neck * 0.3, 1),
      at(start + length * 0.75, neck / 2, 1),
      at(start + length * 0.35, w0 * 0.28, 1),
      at(start, w0 / 2, 1),
    ];
    body += ' ' + smoothClosedPath(ray, 0.6);
    const tipR = Math.max(neck * 0.9, R * rand(0.04, 0.11));
    tips.push({ cx: ux * (end + tipR * 0.6), cy: uy * (end + tipR * 0.6), r: tipR, delay: rand(0.05, 0.14) });
    // Quelques gouttes détachées au bout de certaines coulures.
    if (Math.random() < 0.55) {
      const far = end + tipR * rand(2.2, 5);
      tips.push({ cx: ux * far, cy: uy * far, r: tipR * rand(0.35, 0.7), delay: rand(0.1, 0.2) });
    }
  }

  // Pluie de micro-gouttelettes, plus dense près du centre.
  const specks: Splat['specks'] = Array.from({ length: 70 }, () => {
    const a = rand(0, Math.PI * 2);
    const dist = R * (1.1 + Math.pow(Math.random(), 1.7) * 2.6);
    const size = Math.max(0.6, r * rand(0.012, 0.06) * (1.5 - (dist / R - 1.1) / 2.6));
    return {
      dx: Math.cos(a) * dist,
      dy: Math.sin(a) * dist,
      rx: size * rand(1, 2.2),
      ry: size,
      angle: (a * 180) / Math.PI,
      delay: rand(0, 0.08),
      duration: rand(0.25, 0.55),
    };
  });

  return { x, y, r, seed: Math.floor(rand(1, 999)), body, tips, specks };
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
    window.setTimeout(onBurst, reducedMotion ? 500 : 1300);
  };

  const size = radius * 3;

  return (
    <>
      {/* Tache d'encre de Chine laissée sur le fond.
          Le rendu « encre » est calculé une seule fois ; l'apparition est un simple
          agrandissement de l'image, confié à la carte graphique (fluide partout). */}
      {splat && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed"
          style={{
            left: splat.x - splat.r * 10,
            top: splat.y - splat.r * 10,
            width: splat.r * 20,
            height: splat.r * 20,
            willChange: 'transform',
          }}
          initial={reducedMotion ? false : { scale: 0.15 }}
          animate={reducedMotion ? { scale: 1 } : { scale: [0.15, 1, 1.035] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.1, times: [0, 0.28, 1], ease: ['easeOut', 'easeOut'] }}
        >
          <svg
            width={splat.r * 20}
            height={splat.r * 20}
            viewBox={`${-splat.r * 10} ${-splat.r * 10} ${splat.r * 20} ${splat.r * 20}`}
          >
            <defs>
              {/* Liquide : les formes qui se touchent fusionnent, puis le bord est rendu
                  irrégulier, comme l'encre qui boit le papier. */}
              <filter id="ink-liquid" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation={splat.r * 0.07} result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 24 -11" result="goo" />
                <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={3} seed={splat.seed} result="grain" />
                <feDisplacementMap in="goo" in2="grain" scale={splat.r * 0.13} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g fill={INK}>
              <g filter="url(#ink-liquid)">
                <path d={splat.body} />
                {splat.tips.map((tip, i) => (
                  <circle key={i} cx={tip.cx} cy={tip.cy} r={tip.r} />
                ))}
              </g>
              {splat.specks.map((speck, i) => (
                <ellipse
                  key={i}
                  rx={speck.rx}
                  ry={speck.ry}
                  transform={`translate(${speck.dx.toFixed(1)} ${speck.dy.toFixed(1)}) rotate(${speck.angle.toFixed(0)})`}
                />
              ))}
            </g>
          </svg>
        </motion.div>
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
