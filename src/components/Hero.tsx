"use client";

import Image from "next/image";
import { settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Settings } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import { LineArrowIcon } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Opening shot: the Lebanese table, full-bleed and drifting, with the title set big over it and the chef's signed badge. */
export function Hero({ settings }: { settings: Settings }) {
  const { lang, t } = useI18n();
  const s = settingsText(settings, lang);
  const ar = lang === "ar";

  const stats = [
    [t.statFollowers, t.statFollowersLabel],
    [t.statHands, t.statHandsLabel],
    [t.statFrozen, t.statFrozenLabel],
  ];

  return (
    <section className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image src="/products/hero-spread.jpg" alt="" fill priority sizes="100vw" className="animate-kenburns object-cover brightness-[0.62] saturate-[1.15]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(19_16_14/0.7)_0%,rgb(19_16_14/0.15)_30%,rgb(19_16_14/0.55)_58%,var(--color-night)_94%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,transparent_40%,rgb(19_16_14/0.65)_100%)]" />
      </div>

      {/* the chef, signing off the menu */}
      <figure className="animate-rise absolute end-4 top-20 flex items-center gap-3 border border-line-strong bg-night/55 p-2 pe-4 backdrop-blur-md [animation-delay:500ms] sm:end-[max(1.5rem,calc((100vw-76rem)/2+1.5rem))] sm:top-28 sm:gap-4 sm:p-3 sm:pe-6">
        <span className="relative block h-16 w-14 shrink-0 sm:h-24 sm:w-20">
          <Image src="/portrait.png" alt={`${settings.brandLatin}: ${s.brandSubtitle}`} fill sizes="80px" className="object-contain object-bottom" priority />
        </span>
        <figcaption className="leading-tight">
          <span className="block text-[0.7rem] text-saffron sm:text-xs">{t.chefRole}</span>
          <span className="block font-display text-base font-bold sm:text-xl">{t.chefName}</span>
          <svg viewBox="0 0 120 14" className="mt-0.5 h-2.5 w-20 text-saffron sm:w-24" aria-hidden>
            <path d="M2 9c10-6 16-6 18 0s8 4 14-2 10-4 12 1 10 3 20-3 22-4 52 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="mt-1 hidden max-w-44 text-xs text-bone-2 sm:block">{t.chefLine}</span>
        </figcaption>
      </figure>

      <div className="mx-auto flex w-full max-w-[76rem] flex-1 flex-col justify-end px-4 pt-44 pb-10 sm:px-6 sm:pb-14">
        <p className="animate-rise flex items-center gap-3 text-sm text-bone-2 sm:text-base">
          <span className="h-px w-8 bg-saffron" />
          {t.heroKicker}
        </p>
        <h1
          className={`animate-rise mt-4 font-display font-extrabold [animation-delay:120ms] ${
            ar ? "text-[clamp(3.4rem,15vw,9rem)] leading-[1.08]" : "text-[clamp(3.1rem,12.5vw,8.6rem)] leading-[0.92] tracking-[-0.035em]"
          }`}
        >
          <span className="block">{t.heroTitle}</span>
          <span className="block text-saffron">{t.heroTitleAccent}</span>
        </h1>
        <p className="animate-rise mt-6 max-w-xl text-[0.98rem] leading-7 text-bone-2 [animation-delay:240ms] sm:text-lg sm:leading-8">{s.welcome}</p>

        <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:360ms]">
          <a href="#menu" className="group inline-flex h-14 items-center gap-4 bg-saffron px-6 font-bold text-night transition-colors hover:bg-bone">
            {t.browse}
            <LineArrowIcon className="size-5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
          </a>
          <a
            href={whatsappUrl(settings.whatsappNumber, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-2.5 border border-line-strong px-5 font-semibold transition-colors hover:border-bone hover:bg-bone hover:text-night"
          >
            <WhatsAppIcon className="size-5" />
            {t.orderOnWhatsapp}
          </a>
        </div>
      </div>

      <dl className="mx-auto grid w-full max-w-[76rem] grid-cols-3 border-t border-line sm:px-6">
        {stats.map(([value, label], i) => (
          <div key={label} className={`px-4 py-4 sm:px-6 sm:py-6 ${i ? "border-s border-line" : "sm:ps-0"}`}>
            <dt className="sr-only">{label}</dt>
            <dd>
              <span className="block font-display text-2xl leading-none font-bold whitespace-nowrap sm:text-4xl" dir="auto">{value}</span>
              <span className="mt-2 block text-xs leading-snug text-bone-3 sm:text-sm">{label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
