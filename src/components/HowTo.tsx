"use client";

import { whatsappUrl } from "@/lib/order";
import type { Settings } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Three steps, as stickers slapped on the lavender wall. */
export function HowTo({ settings }: { settings: Settings }) {
  const { t } = useI18n();
  const steps = [
    { title: t.step1, text: t.step1Text, icon: "📋", tilt: "-rotate-2", bg: "bg-white" },
    { title: t.step2, text: t.step2Text, icon: "💬", tilt: "rotate-1", bg: "bg-butter-soft" },
    { title: t.step3, text: t.step3Text, icon: "🍳", tilt: "-rotate-1", bg: "bg-white" },
  ];

  return (
    <section id="how" className="bg-lav py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-4xl leading-tight sm:text-5xl">{t.howTitle}</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-5">
          {steps.map((s, i) => (
            <li key={s.title} className={`relative rounded-md border-2 border-ink p-5 pt-7 shadow-sticker ${s.bg} ${s.tilt}`}>
              <span className="absolute -top-5 start-4 grid size-11 place-items-center rounded-full border-2 border-ink bg-tomato font-display text-2xl text-white">{i + 1}</span>
              <span className="absolute end-4 top-3 text-3xl" aria-hidden>{s.icon}</span>
              <h3 className="font-display text-2xl">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-center">
          <a
            href={whatsappUrl(settings.whatsappNumber, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex h-12 items-center gap-2 rounded-md border-2 border-ink bg-whatsapp px-5 font-bold text-white shadow-sticker"
          >
            <WhatsAppIcon className="size-5" />
            {t.contact} · <span dir="ltr">{settings.whatsappDisplay}</span>
          </a>
        </p>
      </div>
    </section>
  );
}
