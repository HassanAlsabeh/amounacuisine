type Props = { className?: string };

/** The puffed chef's hat from the logo, drawn as a single ink line. */
export function ChefHat({ className }: Props) {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M28 66c-3-9-4-17 0-22-14-2-20-16-11-26 7-8 19-6 24 0 3-11 16-16 26-10 6-8 21-7 26 3 12-3 22 8 18 19-3 8-11 11-17 10 2 7 1 17-3 26" />
      <path d="M28 66c22-6 44-6 63 0" />
      <path d="M48 30c2 6 1 12-2 17M73 27c1 7 0 14-3 19" opacity=".55" />
    </svg>
  );
}

/** A baking tray seen from the side: the shop's cart. */
export function TrayIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M2 11h28l-3 8H5l-3-8Z" />
      <path d="M1 11h3M28 11h3" />
      <ellipse cx="10" cy="8" rx="3.4" ry="2.4" />
      <ellipse cx="17" cy="7.4" rx="3.4" ry="2.4" />
      <ellipse cx="23.5" cy="8" rx="2.8" ry="2.2" />
    </svg>
  );
}

/** A little flame for the burner under the turned knob. */
export function Flame({ className }: Props) {
  return (
    <svg viewBox="0 0 20 26" className={className} aria-hidden>
      <path d="M10 1c1.5 5 7 7.5 7 14a7 7 0 0 1-14 0c0-3.5 2-5.5 3.5-7 .2 2.4 1.2 3.6 2.4 4C8 8.5 8.7 4.5 10 1Z" fill="var(--color-tomato)" />
      <path d="M10 12c.7 2.4 3.4 3.4 3.4 6.4a3.4 3.4 0 0 1-6.8 0c0-1.7.9-2.6 1.7-3.4.2 1 .6 1.6 1.1 1.8-.2-1.7.1-3.4.6-4.8Z" fill="var(--color-butter)" />
    </svg>
  );
}

/** A fork, drawn beside the hero plate. */
export function Fork({ className }: Props) {
  return (
    <svg viewBox="0 0 24 120" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={className} aria-hidden>
      <path d="M5 4v24c0 6 3 9 7 9s7-3 7-9V4M12 4v26M12 37v78" />
    </svg>
  );
}

/** A butter knife, drawn beside the hero plate. */
export function Knife({ className }: Props) {
  return (
    <svg viewBox="0 0 24 120" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 116V60M12 60c-5 0-7-4-7-10 0-18 3-34 9-46 3 12 3 34 2 56h-4Z" />
    </svg>
  );
}
