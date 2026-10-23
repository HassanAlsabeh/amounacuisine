"use client";

import Image from "next/image";
import Link from "next/link";
import { settingsText } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { LangSwitch } from "./LangSwitch";

/** The top rail of the board's wooden frame: the sign, the language, and (on phones) the order pad. */
export function Header({ settings }: { settings: Settings }) {
  const { lang, t } = useI18n();
  const { totals, open } = useCart();
  const s = settingsText(settings, lang);

  return (
    <header className="wood sticky top-0 z-40 shadow-[0_6px_10px_-4px_rgba(0,0,0,0.55)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-5">
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-2.5">
          <span className="relative block size-11 shrink-0 overflow-hidden rounded-full border-2 border-chalk/80 bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)]">
            <Image src={settings.logo} alt="" fill sizes="44px" className="scale-[1.35] object-cover object-[50%_42%]" priority />
          </span>
          <span className="min-w-0 leading-none">
            <span className="chalk block truncate font-chalk text-[1.45rem] leading-none font-bold sm:text-[1.7rem]" dir="ltr" lang="en">
              {settings.brandLatin}
            </span>
            <span className="mt-0.5 block truncate text-[0.72rem] text-chalk/70">{s.brandSubtitle}</span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-6 font-chalk text-[calc(1.15rem*var(--cs))] text-chalk/85 md:flex">
          <a href="#menu" className="chalk hover:text-chalk-yellow">{t.navMenu}</a>
          <a href="#how" className="chalk hover:text-chalk-yellow">{t.navHow}</a>
          <a href="#contact" className="chalk hover:text-chalk-yellow">{t.navContact}</a>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2.5 md:ms-4">
          <LangSwitch className="chalk-box chalk grid h-9 place-items-center px-2.5 font-chalk text-base text-chalk hover:text-chalk-yellow" />

          {/* the waiter's pad, hanging on the frame (on wide screens it's pinned to the board instead) */}
          <button
            type="button"
            data-order-target
            onClick={(e) => open(e.currentTarget)}
            aria-label={`${t.padOpen} (${totals.units})`}
            className="relative -rotate-3 overflow-hidden rounded-[3px] bg-paper text-pen shadow-[2px_3px_0_rgba(0,0,0,0.35)] lg:hidden"
          >
            <span className="block h-2 bg-binding" />
            <span className="flex h-9 items-center gap-1.5 px-2 font-pen text-[0.8rem] font-bold">
              {t.padTab}
              <span key={totals.units} className={`grid min-w-6 place-items-center rounded-full border-[1.5px] border-pen px-1 text-xs tabular-nums ${totals.units ? "animate-bump" : "opacity-50"}`}>
                {totals.units}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
