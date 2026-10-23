/* Chalk doodles for the board, all single-line drawings in currentColor. */

type Props = { className?: string };

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** The grain that makes edges look chalked: put `.chalky` on anything to use it. Rendered once per page. */
export function ChalkFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="chalk" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="4" result="noise" />
        {/* turn the noise into speckled holes in the stroke */}
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.4 0 0 0 1.9" result="grain" />
        <feComposite in="SourceGraphic" in2="grain" operator="in" result="dusty" />
        <feDisplacementMap in="dusty" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

export function KibbehDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 80 48" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <path d="M4 25C14 8 30 4 41 4s27 5 35 21C67 40 53 44 41 44S13 41 4 25Z" />
      <path d="M15 21c8-5 17-8 26-8M14 29c10-2 22-4 34-3M26 36c9 0 18-1 26-4M49 13c5 1 10 3 14 6" strokeWidth="1.8" />
    </svg>
  );
}

export function PotDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 96 86" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <path d="M33 22c-4-5 4-9 0-15M48 20c-4-6 5-10 0-17M63 22c-4-5 4-9 0-15" strokeWidth="2" />
      <path d="M14 36h68M10 36c-5 0-6 7 0 7h4M86 36c5 0 6 7 0 7h-4" />
      <path d="M16 36c-1 14 0 27 3 38 1 4 4 6 8 6h42c4 0 7-2 8-6 3-11 4-24 3-38" />
      <path d="M40 30c2-4 14-4 16 0" />
      <path d="M24 50c12 3 34 3 48 0" strokeWidth="1.6" />
    </svg>
  );
}

export function FlameDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 48 64" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <path d="M24 61C11 60 4 51 5 40c1-9 8-14 9-24 6 4 8 10 8 15 3-8 2-18-3-27 15 7 23 21 22 35-1 14-6 21-17 22Z" />
      <path d="M24 55c-6 0-10-4-9-10 1-4 4-6 5-10 4 3 5 6 5 9 2-2 3-5 3-8 4 4 5 8 4 12-1 4-4 7-8 7Z" strokeWidth="1.8" />
    </svg>
  );
}

/** A tray of pastries going into the oven. */
export function OvenDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 90 70" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <path d="M8 40h74l-6 18H14L8 40Z" />
      <path d="M5 40h6M79 40h6" />
      <path d="M17 39c0-8 13-8 13 0M37 39c0-9 15-9 15 0M59 39c0-8 13-8 13 0" strokeWidth="2" />
      <path d="M22 26c-3-4 3-7 0-11M45 24c-3-5 3-8 0-13M67 26c-3-4 3-7 0-11" strokeWidth="1.8" />
    </svg>
  );
}

/** A plate with a fork and a spoon: ready to eat. */
export function PlateDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 96 60" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <ellipse cx="48" cy="32" rx="26" ry="22" />
      <ellipse cx="48" cy="32" rx="16" ry="13" strokeWidth="1.8" />
      <path d="M8 8v14c0 4 3 5 3 5v28M5 8v10M11 8v10" strokeWidth="2" />
      <path d="M86 8c-5 0-6 8-6 12s2 7 5 7v28" strokeWidth="2" />
    </svg>
  );
}

export function StarDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 48 48" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <path d="M24 4l5 13 14 1-11 9 4 14-12-8-12 8 4-14L5 18l14-1 5-13Z" />
    </svg>
  );
}

/** A starburst for a price on the special. */
export function BurstDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <path d="M60 6l9 18 19-9-2 21 21 2-12 17 17 12-20 7 7 20-21-3-3 21-15-15-15 15-3-21-21 3 7-20-20-7 17-12-12-17 21-2-2-21 19 9 9-18Z" />
    </svg>
  );
}

/** The chef's hat from the logo, chalked. */
export function HatDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 120 80" {...line} strokeWidth="2.6" className={className} aria-hidden>
      <path d="M28 66c-3-9-4-17 0-22-14-2-20-16-11-26 7-8 19-6 24 0 3-11 16-16 26-10 6-8 21-7 26 3 12-3 22 8 18 19-3 8-11 11-17 10 2 7 1 17-3 26" />
      <path d="M28 66c22-6 44-6 63 0" />
    </svg>
  );
}

/** Curly arrow, drawn pointing to the inline end (flip it with rtl:-scale-x-100). */
export function ArrowDoodle({ className }: Props) {
  return (
    <svg viewBox="0 0 70 40" {...line} strokeWidth="2.4" className={className} aria-hidden>
      <path d="M4 30c10-20 26-24 34-14 5 7-3 13-7 7-4-7 10-16 34-12" />
      <path d="M57 4l8 7-9 6" />
    </svg>
  );
}

/** A quick wobbly underline. */
export function Scribble({ className, drawn = false }: Props & { drawn?: boolean }) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" {...line} strokeWidth="3" className={className} aria-hidden>
      <path d="M3 9c30-6 62-7 96-4s66 3 98-3" pathLength={1} className={drawn ? "draw" : undefined} />
    </svg>
  );
}

/** A chalk ring drawn around whatever it sits on (absolutely positioned by the caller). */
export function ChalkCircle({ className }: Props) {
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" {...line} strokeWidth="2.4" className={className} aria-hidden>
      <path d="M120 6C70 2 14 8 6 28c-7 18 40 28 96 26s92-10 92-28C194 9 150 3 92 7" pathLength={1} className="draw" />
    </svg>
  );
}

/** A line of chalk struck through a sold-out dish. */
export function ChalkStrike({ className }: Props) {
  return (
    <svg viewBox="0 0 200 10" preserveAspectRatio="none" {...line} strokeWidth="2.4" className={className} aria-hidden>
      <path d="M2 7C50 3 120 6 198 3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Tally marks for how many are on the order: four strokes and a fifth across.
 * Each stroke is keyed by its position, so only the newest one is drawn in.
 */
export function Tally({ count, className }: { count: number; className?: string }) {
  const groups = Math.ceil(count / 5);
  const w = groups * 28 - 6;
  return (
    <svg viewBox={`0 0 ${w} 20`} width={w} height="20" {...line} strokeWidth="2.6" className={className} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const g = Math.floor(i / 5);
        const k = i % 5;
        const x = g * 28;
        const d = k < 4 ? `M${x + 2 + k * 5} 3l${k % 2 ? 0.6 : -0.4} 14` : `M${x - 1} 15L${x + 20} 5`;
        return <path key={i} d={d} pathLength={1} className="draw" />;
      })}
    </svg>
  );
}
