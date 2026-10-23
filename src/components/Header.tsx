"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Settings } from "@/lib/types";
import { settingsText } from "@/lib/i18n";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { TrayIcon } from "./Kitchenware";

export function Header({ settings }: { settings: Settings }) {
  const { lang, t } = useI18n();
  const { totals, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const s = settingsText(settings, lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b-2 transition-colors ${scrolled ? "border-ink bg-cream/95 backdrop-blur" : "border-transparent bg-lav-2"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:h-[72px]">
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-2.5">
          <span className="relative block size-11 shrink-0 overflow-hidden rounded-full border-2 border-ink bg-white">
            <Image src={settings.logo} alt="" fill sizes="44px" className="scale-[1.35] object-cover object-[50%_42%]" priority />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-[1.35rem] sm:text-2xl" dir="ltr">
              {settings.brandLatin}
            </span>
            <span className="block truncate text-[0.7rem] font-medium text-ink-2">{s.brandSubtitle}</span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-6 text-sm font-semibold md:flex">
          <a href="#menu" className="hover:text-tomato">{t.navMenu}</a>
          <a href="#how" className="hover:text-tomato">{t.navHow}</a>
          <a href="#contact" className="hover:text-tomato">{t.navContact}</a>
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-4">
          <Link
            href={lang === "ar" ? "/en" : "/ar"}
            aria-label={t.switchLangLabel}
            className="press grid h-10 min-w-10 place-items-center rounded-md border-2 border-ink bg-white px-2 text-sm font-bold shadow-sticker-sm"
          >
            {lang === "ar" ? "EN" : "ع"}
          </Link>
          <button
            type="button"
            data-order-target
            onClick={(e) => open(e.currentTarget)}
            aria-label={`${t.cart} (${totals.units})`}
            className="press relative flex h-10 items-center gap-2 rounded-md border-2 border-ink bg-butter px-3 font-bold shadow-sticker-sm"
          >
            <TrayIcon className="h-5 w-7" />
            <span className="hidden text-sm sm:inline">{t.cart}</span>
            {totals.units > 0 && (
              <span key={totals.units} className="animate-bump absolute -end-2.5 -top-2.5 grid size-6 place-items-center rounded-full border-2 border-ink bg-tomato text-xs font-bold text-white">
                {totals.units}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
