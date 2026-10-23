"use client";

import { useI18n } from "./I18nProvider";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Three compartments, three steps; each drawn as the box looks at that point. */
export function HowTo() {
  const { t } = useI18n();
  const steps = [
    { title: t.step1, text: t.step1Text, art: <PackedArt />, bg: "bg-pista" },
    { title: t.step2, text: t.step2Text, art: <LidArt />, bg: "bg-lav" },
    { title: t.step3, text: t.step3Text, art: <SentArt />, bg: "bg-butter" },
  ];

  return (
    <section id="how" aria-labelledby="how-title" className="bento grid md:grid-cols-[1.1fr_repeat(3,1fr)]">
      <h2 id="how-title" className="flex items-end p-5 font-display text-3xl leading-tight font-extrabold tracking-tight sm:p-8 sm:text-4xl">
        {t.howTitle}
      </h2>
      <ol className="contents">
        {steps.map((s, i) => (
          <li key={s.title} className={`flex gap-4 p-5 sm:p-6 md:flex-col ${s.bg}`}>
            <div className="shrink-0">{s.art}</div>
            <div>
              <h3 className="font-display text-lg font-bold">
                <span className="me-2 text-ink-3 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const ART = "relative block h-16 w-20 overflow-hidden rounded-[4px] border border-line";

/** A box being filled: three slots packed, one still free. */
function PackedArt() {
  return (
    <span aria-hidden className={`${ART} grid grid-cols-2 gap-px bg-line`}>
      <span className="bg-apri" />
      <span className="bg-butter" />
      <span className="bg-lav" />
      <span className="bg-box" />
    </span>
  );
}

/** The closed lid, held by its band. */
function LidArt() {
  return (
    <span aria-hidden className={`${ART} bg-lav-deep/25`}>
      <span className="absolute inset-y-0 start-1/2 w-3 -translate-x-1/2 bg-lav-deep rtl:translate-x-1/2" />
      <span className="absolute inset-x-3 top-1/2 h-5 -translate-y-1/2 rounded-[2px] border border-line bg-box" />
    </span>
  );
}

/** Sent: the box on its way over WhatsApp. */
function SentArt() {
  return (
    <span aria-hidden className={`${ART} grid place-items-center bg-whatsapp text-white`}>
      <WhatsAppIcon className="size-8" />
    </span>
  );
}
