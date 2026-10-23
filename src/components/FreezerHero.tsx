import Image from "next/image";
import type { Dict } from "@/lib/i18n";
import { settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Lang, Product, Settings } from "@/lib/types";
import { SnowflakeIcon } from "./FreezerIcons";
import { FrostGlass } from "./FrostGlass";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** A glass freezer door steamed up with cold; the condensation wipes away to show Em Milana and Milana inside. */
export function FreezerHero({ settings, lang, t, products }: { settings: Settings; lang: Lang; t: Dict; products: Product[] }) {
  const s = settingsText(settings, lang);
  const shelf = products.filter((p) => p.image && p.available).slice(0, 3);

  const facts = [
    [t.factFollowers, t.factFollowersValue],
    [t.factHands, t.factHandsValue],
    [t.factEffort, t.factEffortValue],
  ];

  return (
    <section className="frost relative overflow-hidden border-b-4 border-navy bg-frost">
      <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-8 px-4 pt-8 pb-12 md:grid-cols-[1.1fr_1fr] md:grid-rows-[auto_1fr] md:pt-14 md:pb-16">
        <div>
          <p className="inline-flex -rotate-2 items-center gap-1.5 bg-flash px-3 py-1 font-display text-sm font-bold">
            <SnowflakeIcon className="size-4" />
            {t.heroKicker}
          </p>
          <h1 className="mt-4 font-display text-[3.1rem] leading-[0.98] font-extrabold tracking-tight sm:text-7xl lg:text-[5.6rem]">
            {t.heroTitle}
            <span className="block text-cherry">{t.heroTitleAccent}</span>
          </h1>
        </div>

        {/* the freezer door */}
        <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[25rem] md:col-start-2 md:row-span-2 md:row-start-1 md:max-w-[27rem] md:self-center">
          <div className="steel relative rounded-[22px] p-2.5 pt-0 shadow-[0_30px_50px_-28px_rgba(10,37,64,0.7),inset_0_0_0_1px_rgba(10,37,64,0.15)] sm:p-3 sm:pt-0">
            <div className="flex h-11 items-center justify-between px-2">
              <span className="font-poster text-sm text-navy-2 uppercase" dir="ltr">
                {settings.brandLatin} · Cold
              </span>
              <span className="register led rounded-[3px] px-2 py-0.5 font-poster text-sm" dir="ltr">
                −18°C
              </span>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] border-[5px] border-[#c3d0dd] bg-frost-2">
              <div className="freezer-inside absolute inset-0" />
              {/* the cold strip light along the top */}
              <span className="absolute inset-x-6 top-2 h-1.5 rounded-full bg-white shadow-[0_0_24px_8px_rgba(255,255,255,0.9)]" />
              <div className="absolute inset-x-[8%] top-[9%] bottom-[24%]">
                <Image src="/portrait.png" alt={`${settings.brandLatin}: ${s.brandSubtitle}`} fill sizes="(min-width: 768px) 380px, 80vw" priority className="object-contain object-bottom" />
              </div>
              {/* a wire shelf with boxes from the menu */}
              <div className="absolute inset-x-0 bottom-0 h-[24%]">
                <div className="flex h-full items-end justify-center gap-2 px-4 pb-[6%]">
                  {shelf.map((p, i) => (
                    <span key={p.id} className={`relative block aspect-[4/5] w-[24%] overflow-hidden border-2 border-white bg-white shadow-box ${i === 1 ? "-translate-y-1" : ""}`}>
                      <Image src={p.image!.src} alt="" fill sizes="90px" className="object-cover" />
                      <span className="absolute inset-x-0 top-0 h-[18%] bg-cherry" />
                    </span>
                  ))}
                </div>
                <span className="absolute inset-x-0 bottom-[4%] h-1.5 bg-[repeating-linear-gradient(90deg,#9fb2c5_0_2px,transparent_2px_9px)] shadow-[0_-1px_0_#9fb2c5,0_1px_0_#9fb2c5]" />
              </div>
              <FrostGlass hint={t.wipeHint} />
              <span aria-hidden className="glass-shine pointer-events-none absolute inset-0" />
            </div>
          </div>
          {/* the door handle */}
          <span aria-hidden className="chrome-bar absolute -end-2.5 top-[22%] h-[46%] w-3.5 rounded-full shadow-[0_6px_10px_-4px_rgba(10,37,64,0.6)]" />
          <span aria-hidden className="absolute inset-x-6 -bottom-2 h-2 rounded-b-md bg-navy/80" />
        </div>

        <div>
          <p className="max-w-xl text-[1.05rem] leading-8 text-navy-2">{s.welcome}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#menu" className="inline-flex h-13 items-center gap-2 rounded-sm border-b-4 border-cherry-deep bg-cherry px-6 font-display text-lg font-bold text-white transition-transform active:translate-y-0.5">
              <SnowflakeIcon className="size-5" />
              {t.browse}
            </a>
            <a
              href={whatsappUrl(settings.whatsappNumber, "")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center gap-2 rounded-sm border-b-4 border-whatsapp-dark bg-whatsapp px-5 font-display text-lg font-bold text-white transition-transform active:translate-y-0.5"
            >
              <WhatsAppIcon className="size-5" />
              {t.orderOnWhatsapp}
            </a>
          </div>

          {/* the back-of-the-box facts panel */}
          <dl className="mt-8 max-w-sm border-2 border-navy bg-white px-3 pt-1.5 pb-2">
            <p className="font-display text-[1.7rem] leading-tight font-extrabold">{t.factsTitle}</p>
            <p className="border-b-[7px] border-navy pb-1 text-sm">{t.factsServing}</p>
            {facts.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 border-b border-navy/40 py-1 last:border-b-0">
                <dt className="font-semibold">{label}</dt>
                <dd className="font-poster text-xl" dir="ltr">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
