import { dictionaries } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { ArrowDoodle } from "./Chalk";

/** Three steps chalked across the board, with arrows from one to the next. */
export function HowTo({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const steps = [
    [t.step1, t.step1Text, "text-chalk-yellow"],
    [t.step2, t.step2Text, "text-chalk-pink"],
    [t.step3, t.step3Text, "text-chalk-lav"],
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl border-t-2 border-dashed border-chalk/15 px-5 py-12 md:px-10 md:py-16">
      <h2 className="chalk chalky font-chalk text-[calc(2.2rem*var(--cs))] leading-tight font-semibold">{t.howTitle}</h2>
      <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
        {steps.map(([title, text, ink], i) => (
          <li key={title} className="relative flex gap-4">
            <span className={`chalk chalk-box grid size-12 shrink-0 place-items-center font-chalk text-[calc(1.6rem*var(--cs))] font-bold ${ink}`}>{i + 1}</span>
            <div className="min-w-0">
              <h3 className={`chalk font-chalk text-[calc(1.35rem*var(--cs))] leading-tight font-semibold ${ink}`}>{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-chalk/65">{text}</p>
            </div>
            {i < steps.length - 1 && <ArrowDoodle className="chalky absolute -end-5 top-2 hidden h-6 w-10 text-chalk/40 md:block rtl:-scale-x-100" />}
          </li>
        ))}
      </ol>
    </section>
  );
}
