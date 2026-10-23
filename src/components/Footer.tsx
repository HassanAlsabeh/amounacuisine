"use client";

import Image from "next/image";
import { categoryName, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import { toneAt } from "@/lib/tones";
import type { Category, Settings } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import { useMenuFilter } from "./MenuFilter";
import { socialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The bottom tier: who we are, the menu's compartments and how to reach the kitchen. */
export function Footer({ settings, categories }: { settings: Settings; categories: Category[] }) {
  const { lang, t } = useI18n();
  const { pick } = useMenuFilter();
  const s = settingsText(settings, lang);
  const links = socialLinks(settings, t);

  return (
    <footer id="contact" className="mx-auto max-w-6xl px-3 pb-6 sm:px-5 sm:pb-10">
      <div className="bento grid md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="relative block size-16 shrink-0 overflow-hidden rounded-full border border-line bg-white">
              <Image src={settings.logo} alt="" fill sizes="64px" className="scale-[1.35] object-cover object-[50%_42%]" />
            </span>
            <div>
              <p className="font-display text-2xl leading-none font-bold" dir="ltr">
                {settings.brandLatin}
              </p>
              <p className="mt-1.5 text-sm text-ink-2">{s.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-2">{s.noCallsNotice}</p>
        </div>

        <nav aria-label={t.footerSections} className="p-5 sm:p-8">
          <h2 className="font-display text-sm font-bold">{t.footerSections}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1">
            {categories.map((c, i) => (
              <li key={c.id}>
                <button type="button" onClick={() => pick(c.id, true)} className="flex items-center gap-2 py-1 text-sm text-ink-2 hover:text-ink">
                  <span aria-hidden className={`size-2.5 rounded-[2px] ${toneAt(i).swatch}`} />
                  {categoryName(c, lang)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="bg-pista p-5 sm:p-8">
          <h2 className="font-display text-sm font-bold">{t.navContact}</h2>
          <a
            href={whatsappUrl(settings.whatsappNumber, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-12 items-center gap-2 rounded-cell bg-whatsapp px-4 font-display font-semibold text-white hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon className="size-5" />
            {t.contact}
            <span dir="ltr" className="ms-auto text-sm text-white/85">
              +961 {settings.whatsappDisplay}
            </span>
          </a>
          <a href="mailto:amounacuisine95@gmail.com" className="mt-3 inline-block text-sm text-ink-2 hover:text-ink" dir="ltr">
            amounacuisine95@gmail.com
          </a>
          {links.length > 0 && (
            <div className="mt-5 flex items-center gap-2">
              <span className="me-1 text-sm text-ink-2">{t.followUs}</span>
              {links.map(({ key, href, label, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-cell border border-line bg-box hover:bg-butter"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <p className="px-5 py-3 text-xs text-ink-3 md:col-span-3 sm:px-8">
          © {new Date().getFullYear()} {settings.brandLatin} · {t.footerNote}
        </p>
      </div>
    </footer>
  );
}
