"use client";

import Image from "next/image";
import { productText, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Product, Settings } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import { WaveStripes } from "./Retro";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The film poster: Em Milana and Milana in front of a sunburst, with the bill's credits underneath. */
export function PosterHero({ settings, products }: { settings: Settings; products: Product[] }) {
  const { lang, t } = useI18n();
  const s = settingsText(settings, lang);

  return (
    <>
      <section className="paper relative overflow-hidden">
        <div aria-hidden className="dots absolute -end-24 -top-24 size-96 text-mustard/50 [mask:radial-gradient(closest-side,#000,transparent)]" />
        <div aria-hidden className="dots absolute -start-28 bottom-0 size-80 text-teal/25 [mask:radial-gradient(closest-side,#000,transparent)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 pt-6 pb-10 md:grid-cols-[1.1fr_1fr] md:gap-10 md:pt-12 md:pb-16">
          {/* the portrait on its sunburst */}
          <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[24rem] md:order-2 md:max-w-[27rem]">
            <div aria-hidden className="sunburst animate-spin-slow absolute -inset-[22%] rounded-full" />
            <div className="relative mx-auto aspect-[335/390] w-[86%]">
              <span aria-hidden className="absolute top-[22%] left-[3.3%] h-[78.5%] w-[91.3%] rounded-full bg-brown" />
              <Image
                src="/portrait.png"
                alt={`${settings.brandLatin}: ${s.brandSubtitle}`}
                fill
                sizes="(min-width: 768px) 380px, 75vw"
                priority
                className="object-contain [filter:sepia(0.45)_saturate(1.25)_contrast(1.05)]"
              />
            </div>

            <span className="burst absolute -end-1 top-[14%] grid size-[6.6rem] rotate-12 place-items-center bg-tomato text-center text-paper-3 sm:size-28">
              <span className="leading-none">
                <span className="block font-sign text-[1.15rem]" dir="auto">{t.heroAudience}</span>
                <span className="mt-0.5 block text-[0.7rem] font-bold">{t.heroAudienceLabel}</span>
              </span>
            </span>
            <span className="ribbon absolute -start-2 bottom-[16%] -rotate-6 bg-teal px-5 py-1 text-sm font-extrabold text-paper-3">{t.heroHandmade}</span>
            <span className="ribbon absolute -end-1 bottom-[3%] rotate-3 bg-mustard px-5 py-1 text-sm font-extrabold text-brown">{t.heroFrozen}</span>
          </div>

          <div className="relative text-center md:order-1 md:text-start">
            <p className="ribbon inline-block bg-brown px-6 py-1 text-sm font-bold text-mustard-soft">{t.heroPresents}</p>
            <h1 className="mt-4 font-display text-[3.5rem] leading-[1.1] text-brown sm:text-7xl lg:text-[5.6rem]">
              {t.heroTitle}
              <span className="riso block">{t.heroTitleAccent}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-8 text-brown-2 md:mx-0">{s.welcome}</p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <a href="#menu" className="ticket inline-flex h-13 items-center bg-brown px-8 text-base font-extrabold text-paper-3 [--y:50%] hover:bg-tomato">
                {t.browse}
              </a>
              <a
                href={whatsappUrl(settings.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="ticket inline-flex h-13 items-center gap-2 bg-teal px-7 text-base font-extrabold text-paper-3 [--y:50%] hover:bg-teal-deep"
              >
                <WhatsAppIcon className="size-5" />
                {t.orderOnWhatsapp}
              </a>
            </div>

            {/* the bill's credits block */}
            <dl className="mx-auto mt-8 max-w-lg border-y-[3px] border-double border-brown py-3 text-sm leading-relaxed md:mx-0">
              <div>
                <dt className="inline font-extrabold text-tomato">{t.heroStarring}: </dt>
                <dd className="inline font-semibold">{t.heroStars}</dd>
              </div>
              <div>
                <dt className="inline font-extrabold text-teal">{t.heroDirected}: </dt>
                <dd className="inline font-semibold">{t.heroDirector}</dd>
              </div>
            </dl>
          </div>
        </div>
        <WaveStripes className="block h-9 w-full sm:h-12" />
      </section>

      <Ticker names={products.map((p) => productText(p, lang).name)} />
    </>
  );
}

/** The dish names running past like letters on a cinema marquee. */
function Ticker({ names }: { names: string[] }) {
  const run = names.map((n, i) => (
    <span key={i} className="flex items-center gap-6 px-3">
      <span className="font-display text-2xl text-mustard">{n}</span>
      <span className="text-tomato" aria-hidden>✦</span>
    </span>
  ));
  return (
    <div className="overflow-hidden border-y-[3px] border-brown bg-brown py-2.5" aria-hidden>
      {/* two copies side by side, so the loop has no seam */}
      <div className="ticker flex w-max whitespace-nowrap">
        <div className="flex">{run}</div>
        <div className="flex">{run}</div>
      </div>
    </div>
  );
}
