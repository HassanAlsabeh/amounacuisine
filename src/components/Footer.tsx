import Image from "next/image";
import { categoryName, dictionaries, settingsText } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Category, Lang, Settings } from "@/lib/types";
import { ChefHat } from "./Kitchenware";
import { socialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The footer wears the chef's hat: its top edge is the hat's puffed scallop. */
export function Footer({ settings, categories, lang }: { settings: Settings; categories: Category[]; lang: Lang }) {
  const t = dictionaries[lang];
  const s = settingsText(settings, lang);
  const links = socialLinks(settings, t);

  return (
    <footer id="contact" className="bg-lav">
      <div className="scallop-top bg-ink pt-14 pb-10 text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative block size-16 overflow-hidden rounded-full border-2 border-cream bg-white">
                <Image src={settings.logo} alt="" fill sizes="64px" className="scale-[1.35] object-cover object-[50%_42%]" />
              </span>
              <div>
                <p className="font-display text-3xl leading-none" dir="ltr">{settings.brandLatin}</p>
                <p className="mt-1 text-sm text-cream/70">{s.tagline}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">{s.noCallsNotice}</p>
            <ChefHat className="mt-6 w-20 text-cream/30" />
          </div>

          <div>
            <h2 className="font-display text-xl text-butter">{t.footerSections}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <a href="#menu" className="text-cream/80 hover:text-cream">{c.emoji} {categoryName(c, lang)}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-butter">{t.navContact}</h2>
            <a
              href={whatsappUrl(settings.whatsappNumber, "")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-cream px-3 py-2 text-sm font-bold hover:bg-cream hover:text-ink"
            >
              <WhatsAppIcon className="size-4" />
              <span dir="ltr">+961 {settings.whatsappDisplay}</span>
            </a>
            <a href="mailto:amounacuisine95@gmail.com" className="mt-3 block text-sm text-cream/80 hover:text-cream" dir="ltr">
              amounacuisine95@gmail.com
            </a>
            {links.length > 0 && (
              <>
                <p className="mt-5 text-sm text-cream/60">{t.followUs}</p>
                <div className="mt-2 flex gap-2">
                  {links.map(({ key, href, label, Icon }) => (
                    <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-md border-2 border-cream hover:bg-cream hover:text-ink">
                      <Icon className="size-5" />
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl border-t border-cream/15 px-4 pt-5 text-xs text-cream/50">
          © {new Date().getFullYear()} {settings.brandLatin} · {t.footerNote}
        </p>
      </div>
    </footer>
  );
}
