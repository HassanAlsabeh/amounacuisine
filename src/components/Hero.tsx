import Image from "next/image";
import { dictionaries, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Lang, Settings } from "@/lib/types";
import { Fork, Knife } from "./Kitchenware";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The logo's mother and daughter served on a plate, laid on the gingham kitchen cloth. */
export function Hero({ settings, lang }: { settings: Settings; lang: Lang }) {
  const t = dictionaries[lang];
  const s = settingsText(settings, lang);

  const stats = [
    [t.statFollowers, t.statFollowersLabel, "bg-white"],
    [t.statHands, t.statHandsLabel, "bg-butter-soft"],
    [t.statFrozen, t.statFrozenLabel, "bg-lav"],
  ];

  return (
    <section className="gingham relative overflow-hidden border-b-2 border-ink">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 md:grid-cols-[1.05fr_1fr] md:gap-6 md:pt-14 md:pb-20">
        <div className="relative z-10 order-2 md:order-1">
          <p className="inline-block -rotate-2 rounded-sm border-2 border-ink bg-butter px-3 py-1 text-sm font-bold shadow-sticker-sm">{t.heroKicker}</p>
          <h1 className="mt-5 font-display text-[3.4rem] leading-[1.05] sm:text-7xl lg:text-[5.4rem]">
            {t.heroTitle}
            <span className="relative block text-tomato">
              {t.heroTitleAccent}
              <svg viewBox="0 0 300 18" className="absolute -bottom-2 start-0 h-3 w-[min(100%,18rem)] text-ink" preserveAspectRatio="none" aria-hidden>
                <path d="M3 12c40-8 80-9 120-4s90 5 174-6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-8 text-ink-2">{s.welcome}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#menu" className="press inline-flex h-13 items-center rounded-md border-2 border-ink bg-ink px-6 text-base font-bold text-cream shadow-[4px_4px_0_var(--color-tomato)]">
              {t.browse}
            </a>
            <a
              href={whatsappUrl(settings.whatsappNumber, "")}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex h-13 items-center gap-2 rounded-md border-2 border-ink bg-whatsapp px-5 text-base font-bold text-white shadow-sticker"
            >
              <WhatsAppIcon className="size-5" />
              {t.orderOnWhatsapp}
            </a>
          </div>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-2.5 sm:gap-4">
            {stats.map(([value, label, bg], i) => (
              <div key={label} className={`rounded-md border-2 border-ink px-2.5 py-3 shadow-sticker-sm sm:px-4 ${bg} ${i === 1 ? "rotate-1" : i === 2 ? "-rotate-1" : ""}`}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block font-display text-[1.3rem] leading-none whitespace-nowrap sm:text-3xl" dir="auto">{value}</span>
                  <span className="mt-1.5 block text-[0.72rem] leading-snug text-ink-2 sm:text-xs">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[22rem] sm:max-w-[26rem] md:order-2 md:max-w-none">
          <Fork className="absolute top-[22%] -start-1 h-[58%] text-ink sm:-start-4" />
          <Knife className="absolute top-[22%] -end-1 h-[58%] text-ink sm:-end-4" />

          <div className="relative mx-auto mt-[12%] aspect-square w-[78%]">
            {/* the plate: a cream rim around the lavender portrait */}
            <div className="absolute inset-0 rounded-full border-[3px] border-ink bg-cream shadow-sticker-lg" />
            <div className="absolute inset-[7%] rounded-full border-2 border-dashed border-ink/25" />
            <div className="absolute -inset-x-[1%] bottom-[2%] -top-[30%]">
              <Image src="/portrait.png" alt={`${settings.brandLatin}: ${s.brandSubtitle}`} fill sizes="(min-width: 768px) 440px, 80vw" priority className="object-contain object-bottom" />
            </div>
          </div>

          <span className="animate-wobble absolute top-[8%] start-0 rounded-sm border-2 border-ink bg-tomato px-2.5 py-1 text-sm font-bold text-white shadow-sticker-sm">🔥 {t.stickerFry}</span>
          <span className="animate-wobble absolute end-0 top-[46%] rounded-sm border-2 border-ink bg-butter px-2.5 py-1 text-sm font-bold shadow-sticker-sm [animation-delay:-1.6s]">🥧 {t.stickerBake}</span>
          <span className="animate-wobble absolute bottom-[2%] start-[6%] rounded-sm border-2 border-ink bg-white px-2.5 py-1 text-sm font-bold shadow-sticker-sm [animation-delay:-3.1s]">🍽️ {t.stickerEat}</span>
        </div>
      </div>
    </section>
  );
}
