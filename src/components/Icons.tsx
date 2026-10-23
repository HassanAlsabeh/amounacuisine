type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function BasketIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M5 11 9 4M19 11 15 4" />
      <path d="M2.5 11h19l-1.8 8.1a2 2 0 0 1-2 1.6H6.3a2 2 0 0 1-2-1.6L2.5 11Z" />
      <path d="M9 15v2M12 15v2M15 15v2" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M10.5 4.2c3.6-.3 6.6 2.4 6.7 5.9.2 3.6-2.6 6.6-6.1 6.8-3.6.2-6.7-2.5-6.9-6-.2-3.5 2.6-6.4 6.3-6.7Z" />
      <path d="m15.6 15.4 4.6 4.5" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} className={className} aria-hidden>
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

/** A mouneh jar with a ridged lid: the order button. */
export function JarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.8} className={className} aria-hidden>
      <path d="M6.5 3.5h11v3h-11z" />
      <path d="M8.5 3.5v3M11 3.5v3M13.5 3.5v3M16 3.5v3" strokeWidth={1} />
      <path d="M7 6.5c-1.6 1-2.5 2.6-2.5 4.5v7.5a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5V11c0-1.9-.9-3.5-2.5-4.5" />
      <path d="M8 12.5h8v4H8z" strokeWidth={1.3} />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.4} className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.4} className={className} aria-hidden>
      <path d="M5 12h14" />
    </svg>
  );
}

/** Hand-drawn arrow pointing forward in the reading direction (flipped in RTL by the caller). */
export function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 16" {...stroke} strokeWidth={1.8} className={className} aria-hidden>
      <path d="M2 9c8-2 17-2 27-1M23 3.5c2 1.8 4 3.2 6.2 4.6-2.4 1.2-4.4 2.8-6 4.6" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M9 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
    </svg>
  );
}
