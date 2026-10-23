import Image from "next/image";
import { categoryName, settingsText, type Dict } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Category, Lang, Settings } from "@/lib/types";
import { Barcode, SnowflakeIcon } from "./FreezerIcons";
import { socialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The store's navy back wall: contact details, the freezer list and a barcode made of the shop's number. */
export function StoreFooter({ settings, categories, lang, t }: { settings: Settings; categories: Category[]; lang: Lang; t: Dict }) {
  const s = settingsText(settings, lang);
  const links = socialLinks(settings, t);

  return (
    <footer id="contact" className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative block size-16 overflow-hidden rounded-full border-2 border-white bg-white">
              <Image src={settings.logo} alt="" fill sizes="64px" className="scale-[1.35] object-cover object-[50%_42%]" />
            </span>
            <div>
              <p className="font-poster text-3xl leading-none uppercase" dir="ltr">{settings.brandLatin}</p>
              <p className="mt-1 text-sm text-sky">{s.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">{s.noCallsNotice}</p>
          <div className="mt-6 inline-block bg-white px-3 pt-2 pb-1 text-navy">
            <Barcode digits={settings.whatsappNumber} className="h-12 w-48" />
            <p className="mt-0.5 text-center font-poster text-xs tracking-[0.3em]" dir="ltr">{settings.whatsappNumber}</p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-extrabold text-flash">{t.footerSections}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <a href="#menu" className="flex items-center gap-2 text-white/80 hover:text-white">
                  <span className="size-2.5 shrink-0" style={{ background: c.color }} />
                  {categoryName(c, lang)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-extrabold text-flash">{t.navContact}</h2>
          <a
            href={whatsappUrl(settings.whatsappNumber, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 border-2 border-white px-3 py-2 text-sm font-bold hover:bg-white hover:text-navy"
          >
            <WhatsAppIcon className="size-4" />
            <span dir="ltr">+961 {settings.whatsappDisplay}</span>
          </a>
          <a href="mailto:amounacuisine95@gmail.com" className="mt-3 block text-sm text-white/80 hover:text-white" dir="ltr">
            amounacuisine95@gmail.com
          </a>
          {links.length > 0 && (
            <>
              <p className="mt-5 text-sm text-white/60">{t.followUs}</p>
              <div className="mt-2 flex gap-2">
                {links.map(({ key, href, label, Icon }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center border-2 border-white hover:bg-white hover:text-navy">
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-5 text-xs text-white/55">
          <SnowflakeIcon className="size-3.5 shrink-0 text-sky" />
          © {new Date().getFullYear()} {settings.brandLatin} · {t.footerNote}
        </p>
      </div>
    </footer>
  );
}
