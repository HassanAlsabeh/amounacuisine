import Image from "next/image";
import { dictionaries, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Lang, Settings } from "@/lib/types";
import { HatDoodle } from "./Chalk";
import { socialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Sticks of chalk lying on the ledge, in the board's colours. */
const STICKS = [
  ["bg-chalk", "w-14 -rotate-3"],
  ["bg-chalk-yellow", "w-10 rotate-2"],
  ["bg-chalk-pink", "w-8 -rotate-6"],
  ["bg-chalk-lav", "w-12 rotate-1"],
];

/** The bottom of the board: how to reach the kitchen, chalked, above the wooden ledge with its chalk and eraser. */
export function Footer({ settings, lang }: { settings: Settings; lang: Lang }) {
  const t = dictionaries[lang];
  const s = settingsText(settings, lang);
  const links = socialLinks(settings, t);

  return (
    <footer id="contact">
      <div className="mx-auto grid max-w-7xl gap-10 border-t-2 border-dashed border-chalk/15 px-5 pt-12 pb-10 md:grid-cols-[1.3fr_1fr] md:px-10">
        <div className="flex items-start gap-4">
          <span className="relative block size-16 shrink-0 overflow-hidden rounded-full border-2 border-chalk/80 bg-white">
            <Image src={settings.logo} alt="" fill sizes="64px" className="scale-[1.35] object-cover object-[50%_42%]" />
          </span>
          <div>
            <p className="chalk font-chalk text-[2.2rem] leading-none font-bold" dir="ltr" lang="en">
              {settings.brandLatin}
            </p>
            <p className="mt-1.5 text-sm text-chalk/70">{s.tagline}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-chalk/55">{s.noCallsNotice}</p>
          </div>
        </div>

        <div>
          <h2 className="chalk font-chalk text-[calc(1.6rem*var(--cs))] text-chalk-yellow">{t.navContact}</h2>
          <a
            href={whatsappUrl(settings.whatsappNumber, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex min-h-11 w-fit items-center gap-2 font-semibold text-chalk-mint hover:text-chalk"
          >
            <WhatsAppIcon className="size-5" />
            <span dir="ltr">+961 {settings.whatsappDisplay}</span>
          </a>
          <a href="mailto:amounacuisine95@gmail.com" className="flex min-h-11 w-fit items-center text-sm text-chalk/75 hover:text-chalk" dir="ltr">
            amounacuisine95@gmail.com
          </a>
          {links.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-chalk/55">{t.followUs}</span>
              {links.map(({ key, href, label, Icon }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="chalk-box grid size-11 place-items-center text-chalk/85 hover:text-chalk-yellow">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative px-5 pb-4 md:px-10">
        <HatDoodle className="chalky absolute end-6 bottom-6 w-20 text-chalk/20 md:end-12" />
        <p className="text-xs text-chalk/40">
          © {new Date().getFullYear()} {settings.brandLatin} · {t.footerNote}
        </p>
      </div>

      {/* the chalk ledge along the bottom of the frame */}
      <div className="wood relative flex h-7 items-end gap-3 px-6 shadow-[0_-3px_6px_rgba(0,0,0,0.35)] md:px-12" aria-hidden>
        {STICKS.map(([color, shape], i) => (
          <span key={i} className={`mb-2 block h-2.5 rounded-[3px] shadow-[0_2px_1px_rgba(0,0,0,0.35)] ${color} ${shape}`} />
        ))}
        <span className="ms-auto mb-1.5 block h-5 w-20 rounded-[3px] bg-[linear-gradient(#7a5638_0_45%,#ddd6c8_45%)] shadow-[0_3px_2px_rgba(0,0,0,0.4)]" />
      </div>
    </footer>
  );
}
