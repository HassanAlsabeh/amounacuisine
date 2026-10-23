"use client";

import { useI18n } from "./I18nProvider";
import { MinusIcon, PlusIcon } from "./Icons";

/** Square − amount + control on a hairline frame. `label` is the amount as shown (a count or a weight). */
export function Stepper({
  label,
  onDecrease,
  onIncrease,
  canDecrease = true,
  size = "md",
}: {
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease?: boolean;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const box = size === "sm" ? "h-9 w-9" : "h-12 w-12";

  return (
    <div className="inline-flex items-stretch border border-line-strong">
      <button type="button" aria-label={t.decrease} onClick={onDecrease} disabled={!canDecrease} className={`${box} grid place-items-center transition-colors hover:bg-bone/10 disabled:opacity-30`}>
        <MinusIcon className="size-3.5" />
      </button>
      <output
        aria-live="polite"
        className={`grid place-items-center border-x border-line-strong px-2 font-display font-bold tabular-nums ${size === "sm" ? "min-w-12 text-sm" : "min-w-20 text-lg"}`}
      >
        <span key={label} className="animate-bump whitespace-nowrap">{label}</span>
      </output>
      <button type="button" aria-label={t.increase} onClick={onIncrease} className={`${box} grid place-items-center transition-colors hover:bg-bone/10`}>
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  );
}
