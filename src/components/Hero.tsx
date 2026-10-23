import Image from "next/image";
import { dictionaries, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Lang, Settings } from "@/lib/types";
import { ArrowDoodle, FlameDoodle, HatDoodle, KibbehDoodle, PotDoodle, Scribble } from "./Chalk";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The top of the board: the kitchen's name chalked big, Em Milana and Milana in a chalk ring, doodles around. */
export function Hero({ settings, lang }: { settings: Settings; lang: Lang }) {
  const t = dictionaries[lang];
  const s = settingsText(settings, lang);

  const stats = [
    [t.statFollowers, t.statFollowersLabel],
    [t.statHands, t.statHandsLabel],
    [t.statFrozen, t.statFrozenLabel],
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pt-8 pb-12 md:grid-cols-[1.1fr_1fr] md:gap-4 md:px-10 md:pt-14 md:pb-16">
        <div className="order-2 md:order-1">
          <p className="chalk font-chalk text-[calc(1.2rem*var(--cs))] text-chalk-pink">{t.heroKicker}</p>
          <h1 className="chalk chalky mt-3 font-chalk text-[calc(3.1rem*var(--cs))] leading-[1.1] font-semibold sm:text-[calc(4rem*var(--cs))] lg:text-[calc(4.8rem*var(--cs))]">
            {t.heroTitle}
            <span className="relative block w-fit text-chalk-yellow">
              {t.heroTitleAccent}
              <Scribble className="absolute -bottom-1 start-0 h-3 w-full text-chalk-yellow/80" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[1.02rem] leading-8 text-chalk/80">{s.welcome}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#menu" className="chalk-box chalk inline-flex h-12 items-center gap-2 px-5 font-chalk text-[calc(1.3rem*var(--cs))] text-chalk-yellow transition-transform hover:-rotate-1">
              {t.browse}
              <ArrowDoodle className="h-5 w-9 rotate-90" />
            </a>
            <a
              href={whatsappUrl(settings.whatsappNumber, "")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 border-b-2 border-dashed border-chalk-mint/60 font-semibold text-chalk-mint hover:border-chalk-mint"
            >
              <WhatsAppIcon className="size-5" />
              {t.orderOnWhatsapp}
            </a>
          </div>

          {/* chalked notes, not cards */}
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t-2 border-dashed border-chalk/20 pt-5">
            {stats.map(([value, label], i) => (
              <div key={label} className={i ? "border-s-2 border-dashed border-chalk/20 ps-3" : ""}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="chalk block font-chalk text-[calc(1.55rem*var(--cs))] leading-none whitespace-nowrap text-chalk-lav" dir="auto">
                    {value}
                  </span>
                  <span className="mt-1.5 block text-[0.75rem] leading-snug text-chalk/60">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[17.5rem] sm:max-w-[24rem] md:order-2 md:max-w-[27rem]">
          {/* a chalk ring around the portrait, drawn twice like a quick hand would */}
          <div className="relative aspect-square">
            <svg viewBox="0 0 200 200" className="chalky absolute -inset-[5%] text-chalk/85" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden>
              <path d="M100 8c52 0 92 38 92 90s-40 94-94 94S8 152 8 100 48 9 104 8" strokeWidth="2.4" />
              <path d="M90 12c50-4 96 34 98 86 2 50-38 88-90 90" strokeWidth="1.3" opacity=".6" />
            </svg>
            <div className="absolute inset-[3%] overflow-hidden rounded-full bg-chalk-lav">
              <Image src="/portrait.png" alt={`${settings.brandLatin}: ${s.brandSubtitle}`} fill sizes="(min-width: 768px) 420px, 76vw" priority className="origin-bottom scale-[1.24] object-cover object-bottom" />
            </div>
            <HatDoodle className="chalky absolute -top-[16%] left-1/2 w-[46%] -translate-x-1/2 text-chalk" />
          </div>

          <KibbehDoodle className="chalky absolute -start-[8%] bottom-[4%] w-[28%] -rotate-12 text-chalk-yellow sm:-start-[20%]" />
          <span className="chalk absolute -start-[2%] bottom-[-7%] -rotate-6 font-chalk text-[calc(1.15rem*var(--cs))] text-chalk-yellow sm:-start-[14%]">{t.doodleKibbeh}</span>
          <PotDoodle className="chalky absolute -end-[14%] top-[2%] w-[30%] rotate-6 text-chalk-lav sm:-end-[20%]" />
          <FlameDoodle className="chalky absolute -end-[6%] bottom-[2%] w-[13%] text-chalk-pink sm:-end-[10%]" />
          <span className="chalk absolute -end-[8%] bottom-[-8%] rotate-3 font-chalk text-[calc(1rem*var(--cs))] whitespace-nowrap text-chalk-pink sm:-end-[14%]">{t.doodlePan}</span>
        </div>
      </div>
    </section>
  );
}
