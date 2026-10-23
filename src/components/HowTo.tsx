"use client";

import { useI18n } from "./I18nProvider";

/** Ordering in three panels, printed one per ink like the back of an old tin. */
export function HowTo() {
  const { t } = useI18n();
  const steps = [
    [t.step1, t.step1Text, "bg-tomato text-paper-3", "-rotate-1"],
    [t.step2, t.step2Text, "bg-mustard text-brown", "rotate-1 md:translate-y-5"],
    [t.step3, t.step3Text, "bg-teal text-paper-3", "-rotate-[0.6deg]"],
  ];

  return (
    <section id="how" className="border-t-[3px] border-brown bg-paper-2 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="riso text-center font-display text-[2.4rem] leading-tight sm:text-6xl">{t.howTitle}</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3 md:gap-7">
          {steps.map(([title, text, ink, tilt], i) => (
            <li key={title} className={`relative border-[3px] border-brown p-5 pt-4 ${ink} ${tilt}`}>
              <span aria-hidden className="block font-display text-6xl leading-none [text-shadow:3px_3px_0_var(--color-brown)]" dir="ltr">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display text-2xl leading-tight">{title}</h3>
              <p className="mt-1.5 leading-relaxed font-medium opacity-90">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
