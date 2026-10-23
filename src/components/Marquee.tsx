"use client";

import Image from "next/image";
import Link from "next/link";
import { settingsText } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { LangSwitch } from "./LangSwitch";
import { TicketIcon } from "./Retro";

/** The cinema's front: a stripe of the three inks, the shop's name, and the coupon book button. */
export function Marquee({ settings }: { settings: Settings }) {
  const { lang, t } = useI18n();
  const { totals, open } = useCart();
  const s = settingsText(settings, lang);

  return (
    <header className="paper sticky top-0 z-40 border-b-[3px] border-brown">
      <div className="stripes-3 h-1.5" aria-hidden />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-2.5">
          <span className="relative block size-11 shrink-0 overflow-hidden rounded-full border-[3px] border-mustard bg-white outline-2 outline-brown">
            <Image src={settings.logo} alt="" fill sizes="44px" className="scale-[1.35] object-cover object-[50%_42%]" priority />
          </span>
          <span className="min-w-0 leading-none">
            <span className="riso block truncate font-display text-[1.15rem] sm:text-2xl" dir="ltr">
              {settings.brandLatin}
            </span>
            <span className="mt-1 block truncate text-[0.72rem] font-bold text-brown-2">{s.brandSubtitle}</span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-6 font-bold md:flex">
          <a href="#menu" className="decoration-tomato decoration-[3px] underline-offset-6 hover:underline">{t.navMenu}</a>
          <a href="#how" className="decoration-mustard decoration-[3px] underline-offset-6 hover:underline">{t.navHow}</a>
          <a href="#contact" className="decoration-teal decoration-[3px] underline-offset-6 hover:underline">{t.navContact}</a>
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-4">
          <LangSwitch className="grid h-10 place-items-center border-[2.5px] border-brown px-2.5 text-sm font-extrabold transition-colors hover:bg-brown hover:text-paper" />
          <button
            type="button"
            onClick={(e) => open(e.currentTarget)}
            aria-label={`${t.cart} (${totals.units})`}
            className="relative flex h-10 items-center gap-2 bg-tomato px-3.5 font-extrabold text-paper-3 transition-transform active:scale-95"
          >
            <TicketIcon className="hidden size-5 sm:block" />
            <span className="hidden text-sm sm:inline">{t.cartShort}</span>
            <span key={totals.units} className={`grid h-6 min-w-6 place-items-center bg-mustard px-1 font-sign text-xs text-brown ${totals.units ? "animate-bump" : ""}`}>
              {totals.units}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
