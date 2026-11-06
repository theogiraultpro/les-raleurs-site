import { useEffect, useRef, useState } from 'react';

const isTouchDevice =
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches);

type CursorState = {
  size: number;
  invert: boolean;
};

const DEFAULT: CursorState = { size: 14, invert: false };

function getElementCursorState(target: HTMLElement): CursorState {
  // Éléments où le curseur garde sa taille normale (bulle d'encre de l'accueil)
  if (target.closest?.('[data-cursor-plain]')) return DEFAULT;

  // Product cards — use the image inside for sizing, apply inversion on the whole card
  const card = target.closest('[data-cursor-card]') as HTMLElement | null;
  if (card) {
    const cardImg = card.querySelector('img') as HTMLElement | null;
    const ref = cardImg ?? card;
    const rect = ref.getBoundingClientRect();
    const minDim = Math.min(rect.width, rect.height);
    const size = Math.max(22, Math.min(38, minDim * 0.09));
    return { size, invert: true };
  }

  // Standalone images (product pages, thumbnails, gallery)
  const img = target.closest('img') as HTMLElement | null;
  if (img) {
    const rect = img.getBoundingClientRect();
    const minDim = Math.min(rect.width, rect.height);
    const size = Math.max(36, Math.min(80, minDim * 0.28));
    return { size, invert: true };
  }

  // Buttons and links
  const btn = target.closest('button, a') as HTMLElement | null;
  if (btn) {
    const rect = btn.getBoundingClientRect();
    const minDim = Math.min(rect.width, rect.height);
    const size = Math.max(28, Math.min(56, minDim * 0.9));
    return { size, invert: false };
  }

  return DEFAULT;
}

export default function CustomCursor() {
  if (isTouchDevice) return null;

  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<CursorState>(DEFAULT);

  useEffect(() => {
    const l1 = layer1Ref.current;
    const l2 = layer2Ref.current;
    if (!l1 || !l2) return;

    let raf: number;
    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;
    let velX = 0, velY = 0;
    let prevMouseX = -100, prevMouseY = -100;
    let rotation = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      velX = lerp(velX, mouseX - prevMouseX, 0.2);
      velY = lerp(velY, mouseY - prevMouseY, 0.2);
      prevMouseX = lerp(prevMouseX, mouseX, 0.25);
      prevMouseY = lerp(prevMouseY, mouseY, 0.25);

      const speed = Math.sqrt(velX * velX + velY * velY);
      const targetRot = speed > 0.5 ? Math.atan2(velY, velX) * (180 / Math.PI) : 0;
      rotation = lerp(rotation, targetRot, 0.08);

      curX = lerp(curX, mouseX, 0.18);
      curY = lerp(curY, mouseY, 0.18);

      const t = `translate(${curX}px, ${curY}px) translate(-50%, -50%) rotate(${rotation}deg)`;
      l1.style.transform = t;
      l2.style.transform = t;

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const state = getElementCursorState(e.target as HTMLElement);
      setCursor(prev =>
        prev.size === state.size && prev.invert === state.invert ? prev : state
      );
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const px = `${cursor.size}px`;

  return (
    <>
      <div
        ref={layer1Ref}
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{
          zIndex: 9998,
          width: px,
          height: px,
          backgroundColor: 'white',
          mixBlendMode: 'difference',
          transition: 'width 0.18s ease, height 0.18s ease',
        }}
      />
      <div
        ref={layer2Ref}
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{
          zIndex: 9999,
          width: px,
          height: px,
          backgroundColor: '#808080',
          mixBlendMode: 'saturation',
          transition: 'width 0.18s ease, height 0.18s ease, opacity 0.18s ease',
          opacity: cursor.invert ? 1 : 0,
        }}
      />
    </>
  );
}
