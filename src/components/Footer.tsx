"use client";

import Image from "next/image";
import { categoryName, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Category, Settings } from "@/lib/types";
import { pad } from "@/lib/ui";
import { useI18n } from "./I18nProvider";
import { socialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";

const EMAIL = "amounacuisine95@gmail.com";

/** Contact, the menu index, and the brand name set as wide as the screen, like end credits. */
export function Footer({ settings, categories }: { settings: Settings; categories: Category[] }) {
  const { lang, t } = useI18n();
  const s = settingsText(settings, lang);
  const links = socialLinks(settings, t);

  return (
    <footer id="contact" className="overflow-hidden border-t border-line bg-night-2">
      <div className="mx-auto grid max-w-[76rem] gap-12 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] md:pt-20">
        <div>
          <p className="font-display font-bold text-saffron">03</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="relative block size-16 shrink-0 overflow-hidden rounded-full bg-lav">
              <Image src={settings.logo} alt="" fill sizes="64px" className="scale-[1.3] object-cover object-[50%_42%]" />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold" dir="ltr">{settings.brandLatin}</p>
              <p className="text-sm text-bone-2">{s.tagline}</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone-3">{s.noCallsNotice}</p>
        </div>

        <div>
          <h2 className="border-b border-line pb-3 text-xs font-bold text-bone-3">{t.navContact}</h2>
          <a href={whatsappUrl(settings.whatsappNumber, "")} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 border-b border-line py-4">
            <span className="flex items-center gap-2.5 text-sm text-bone-2 group-hover:text-bone">
              <WhatsAppIcon className="size-4 text-saffron" />
              {t.whatsapp}
            </span>
            <span className="font-display font-bold tabular-nums" dir="ltr">+961 {settings.whatsappDisplay}</span>
          </a>
          <a href={`mailto:${EMAIL}`} className="group flex items-center justify-between gap-3 border-b border-line py-4">
            <span className="text-sm text-bone-2 group-hover:text-bone">{t.email}</span>
            <span className="truncate text-sm font-semibold" dir="ltr">{EMAIL}</span>
          </a>
          {links.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-line py-3">
              <span className="text-sm text-bone-2">{t.followUs}</span>
              <div className="flex">
                {links.map(({ key, href, label, Icon }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="-ms-px grid size-10 place-items-center border border-line-strong transition-colors hover:bg-bone hover:text-night">
                    <Icon className="size-[1.1rem]" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="border-b border-line pb-3 text-xs font-bold text-bone-3">{t.footerSections}</h2>
          <ul>
            {categories.map((c, i) => (
              <li key={c.id}>
                <a href="#menu" className="group flex items-baseline gap-3 border-b border-line py-3 text-sm text-bone-2 hover:text-bone">
                  <span className="font-display text-xs font-bold text-bone-3 group-hover:text-saffron">{pad(i + 1)}</span>
                  {categoryName(c, lang)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* end credits */}
      <p aria-hidden className="mx-auto max-w-[76rem] px-4 font-display text-[19vw] leading-[0.78] font-extrabold tracking-[-0.06em] whitespace-nowrap text-night-3 select-none sm:px-6 xl:text-[14.5rem]" dir="ltr">
        {settings.brandLatin.split(" ")[0]}
        <span className="text-saffron">.</span>
      </p>
      <p className="mx-auto max-w-[76rem] border-t border-line px-4 py-5 text-xs text-bone-3 sm:px-6">
        © {new Date().getFullYear()} {settings.brandLatin} · {t.footerNote}
      </p>
    </footer>
  );
}
