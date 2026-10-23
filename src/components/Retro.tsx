type Props = { className?: string };

/** One wavy band from x=0 to x=1200, `top` px down, `h` px thick: a '70s swoosh. */
function band(top: number, h: number, amp: number) {
  const wave = (y: number) => `Q150 ${y - amp} 300 ${y} T600 ${y} T900 ${y} T1200 ${y}`;
  const back = (y: number) => `Q1050 ${y + amp} 900 ${y} T600 ${y} T300 ${y} T0 ${y}`;
  return `M0 ${top} ${wave(top)} L1200 ${top + h} ${back(top + h)} Z`;
}

/** The three-ink wavy stripes that run between sections. */
export function WaveStripes({ className }: Props) {
  const inks = ["var(--color-tomato)", "var(--color-mustard)", "var(--color-teal)"];
  return (
    <svg viewBox="0 0 1200 64" preserveAspectRatio="none" className={className} aria-hidden>
      {inks.map((fill, i) => (
        <path key={fill} d={band(12 + i * 15, 15.5, 22)} fill={fill} />
      ))}
    </svg>
  );
}

/** A wavy edge to finish a block; the block's colour is `currentColor`. */
export function WaveEdge({ className }: Props) {
  return (
    <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M0 12 Q150 -4 300 12 T600 12 T900 12 T1200 12 V24 H0 Z" fill="currentColor" />
    </svg>
  );
}

export function ScissorsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.6 7.6 20 17M8.6 16.4 20 7M13.5 12h.01" />
    </svg>
  );
}

/** A ticket stub, for the coupon book button. */
export function TicketIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Z" />
      <path d="M15 6.5v2M15 11v2M15 15.5v2" />
    </svg>
  );
}
