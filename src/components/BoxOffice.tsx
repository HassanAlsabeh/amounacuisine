"use client";

import Image from "next/image";
import { categoryName, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Category, Settings } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import { WaveStripes } from "./Retro";
import { socialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The end credits: "The End" in big letters, and the box office for getting in touch. */
export function BoxOffice({ settings, categories }: { settings: Settings; categories: Category[] }) {
  const { lang, t } = useI18n();
  const s = settingsText(settings, lang);
  const links = socialLinks(settings, t);

  return (
    <footer id="contact" className="bg-brown text-paper-3">
      <div className="bg-paper-2">
        <WaveStripes className="block h-9 w-full sm:h-12" />
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8">
        <p className="riso-mustard text-center font-display text-7xl leading-none sm:text-8xl">{t.theEnd}</p>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative block size-16 shrink-0 overflow-hidden rounded-full border-[3px] border-mustard bg-white">
                <Image src={settings.logo} alt="" fill sizes="64px" className="scale-[1.35] object-cover object-[50%_42%]" />
              </span>
              <div>
                <p className="font-display text-3xl leading-none text-mustard" dir="ltr">{settings.brandLatin}</p>
                <p className="mt-1.5 text-sm text-paper-3/75">{s.tagline}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper-3/75">{s.noCallsNotice}</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-tomato">{t.footerSections}</h2>
            <ul className="mt-3 space-y-1.5 text-sm font-semibold">
              {categories.map((c) => (
                <li key={c.id}>
                  <a href="#menu" className="text-paper-3/80 hover:text-mustard">
                    {c.emoji} {categoryName(c, lang)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* the ticket window */}
          <div className="border-[3px] border-dashed border-mustard/60 p-5">
            <h2 className="font-display text-2xl text-mustard">{t.boxOffice}</h2>
            <p className="mt-1 text-sm text-paper-3/70">{t.contact}</p>
            <a
              href={whatsappUrl(settings.whatsappNumber, "")}
              target="_blank"
              rel="noopener noreferrer"
              className="ticket mt-4 inline-flex h-12 items-center gap-2 bg-teal px-6 font-sign text-sm [--y:50%] hover:bg-teal-deep"
            >
              <WhatsAppIcon className="size-5" />
              <span dir="ltr">+961 {settings.whatsappDisplay}</span>
            </a>
            <a href="mailto:amounacuisine95@gmail.com" className="mt-3 block text-sm font-semibold text-paper-3/85 hover:text-mustard" dir="ltr">
              amounacuisine95@gmail.com
            </a>
            {links.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="me-1 text-sm text-paper-3/60">{t.followUs}</span>
                {links.map(({ key, href, label, Icon }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center bg-tomato hover:bg-mustard hover:text-brown">
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 border-t-2 border-paper-3/15 pt-5 text-xs text-paper-3/55">
          © {new Date().getFullYear()} {settings.brandLatin} · {t.footerNote}
        </p>
      </div>
    </footer>
  );
}
