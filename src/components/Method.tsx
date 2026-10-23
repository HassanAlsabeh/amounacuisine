"use client";

import { whatsappUrl } from "@/lib/order";
import type { Settings } from "@/lib/types";
import { pad } from "@/lib/ui";
import { useI18n } from "./I18nProvider";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** How ordering works, as three numbered columns between hairlines. */
export function Method({ settings }: { settings: Settings }) {
  const { t } = useI18n();
  const steps = [
    [t.step1, t.step1Text],
    [t.step2, t.step2Text],
    [t.step3, t.step3Text],
  ];

  return (
    <section id="how" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[76rem] px-4 sm:px-6">
        <h2 className="flex max-w-3xl items-baseline gap-4 font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
          <span className="text-base font-bold text-saffron sm:text-lg">02</span>
          {t.howTitle}
        </h2>
        <ol className="mt-10 grid border-t border-line sm:mt-14 sm:grid-cols-3">
          {steps.map(([title, text], i) => (
            <li key={title} className={`border-b border-line py-8 sm:border-b-0 sm:py-10 ${i ? "sm:border-s sm:ps-8" : ""} ${i < 2 ? "sm:pe-8" : ""}`}>
              <span className="numeral-outline block font-display text-7xl leading-none font-extrabold sm:text-8xl">{pad(i + 1)}</span>
              <h3 className="mt-6 font-display text-xl font-bold sm:text-2xl">{title}</h3>
              <p className="mt-2 leading-relaxed text-bone-2">{text}</p>
            </li>
          ))}
        </ol>
        <a
          href={whatsappUrl(settings.whatsappNumber, "")}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 flex items-center justify-between gap-4 border border-line-strong p-5 transition-colors hover:border-saffron sm:mt-14 sm:p-8"
        >
          <span className="flex items-center gap-3 font-semibold text-bone-2 group-hover:text-bone">
            <WhatsAppIcon className="size-5 text-saffron" />
            {t.contact}
          </span>
          <span className="font-display text-2xl font-extrabold tabular-nums sm:text-5xl" dir="ltr">
            {settings.whatsappDisplay}
          </span>
        </a>
      </div>
    </section>
  );
}
