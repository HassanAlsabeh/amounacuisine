import type { Dict } from "@/lib/i18n";

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function PanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M2.5 11.5h13c0 3-2.9 5-6.5 5s-6.5-2-6.5-5Z" />
      <path d="M15.5 12.5 21.5 10" />
      <path d="M6.5 8.5c.6-1 .6-2 0-3M9.5 8.5c.6-1 .6-2 0-3M12.5 8.5c.6-1 .6-2 0-3" />
    </svg>
  );
}

export function OvenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <rect x="3" y="3.5" width="18" height="17" rx="1.5" />
      <path d="M3 8h18" />
      <rect x="6.5" y="11" width="11" height="6.5" rx="1" />
      <path d="M6.5 5.8h.01M9.5 5.8h.01M15 5.8h3" />
    </svg>
  );
}

export function PotIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M4.5 10.5h15v6.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-6.5Z" />
      <path d="M2 10.5h20M10 7.5h4M12 7.5V6" />
      <path d="M8.5 4.5c.5-.8.5-1.6 0-2.4M15.5 4.5c.5-.8.5-1.6 0-2.4" />
    </svg>
  );
}

export function PlateIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <circle cx="12" cy="12.5" r="7.5" />
      <circle cx="12" cy="12.5" r="4" />
      <path d="M2 4v5a1.5 1.5 0 0 0 3 0V4M3.5 9v11M21 4c-1.5 1-2 3-2 6h2v10" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M3 12.2V4a1 1 0 0 1 1-1h8.2a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-8.2 8.2a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z" />
      <circle cx="7.8" cy="7.8" r="1.4" />
    </svg>
  );
}

export function SnowflakeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7" />
      <path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2M3.6 10.4l3-.9-.6-3M20.4 13.6l-3 .9.6 3M3.6 13.6l3 .9-.6 3M20.4 10.4l-3-.9.6-3" />
    </svg>
  );
}

/** A cash register: the checkout button. */
export function RegisterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M5 11h14l1.5 9h-17L5 11Z" />
      <path d="M7 11V7h10v4M9 4h6v3H9z" />
      <path d="M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 17h7" />
    </svg>
  );
}

/** How each line of boxes is cooked, by category id; categories added later get a snowflake. */
const METHODS: Record<string, { Icon: (p: IconProps) => React.ReactElement; key: keyof Dict }> = {
  fry: { Icon: PanIcon, key: "methodFry" },
  bake: { Icon: OvenIcon, key: "methodBake" },
  cook: { Icon: PotIcon, key: "methodCook" },
  eat: { Icon: PlateIcon, key: "methodEat" },
  offers: { Icon: TagIcon, key: "methodCook" },
};

export function cookingMethod(categoryId: string, t: Dict) {
  const m = METHODS[categoryId];
  return { Icon: m?.Icon ?? SnowflakeIcon, text: String(m ? t[m.key] : t.methodOther) };
}

/** Decorative barcode drawn from a string of digits, so each one is different. */
export function Barcode({ digits, className }: { digits: string; className?: string }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (const ch of `5${digits}0`) {
    const d = Number(ch) || 0;
    for (const w of [1 + (d % 3), 1 + ((d >> 1) % 2), 2 + (d % 2)]) {
      bars.push({ x, w });
      x += w + 1 + ((d + w) % 2);
    }
  }
  return (
    <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className={className} aria-hidden>
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y="0" width={b.w} height="40" fill="currentColor" />
      ))}
    </svg>
  );
}
