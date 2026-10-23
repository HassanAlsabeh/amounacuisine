"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { settingsText } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { useCart } from "./CartProvider";
import { RegisterIcon } from "./FreezerIcons";
import { useI18n } from "./I18nProvider";
import { LangSwitch } from "./LangSwitch";

/** The store's navy fascia, with the checkout lane button that "beeps" whenever a box lands in it. */
export function TopBar({ settings }: { settings: Settings }) {
  const { lang, t } = useI18n();
  const { totals, open } = useCart();
  const s = settingsText(settings, lang);
  const button = useRef<HTMLButtonElement>(null);
  const [beep, setBeep] = useState(0);

  useEffect(() => {
    const el = button.current;
    if (!el) return;
    const onScan = () => setBeep((n) => n + 1);
    el.addEventListener("scanned", onScan);
    return () => el.removeEventListener("scanned", onScan);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b-4 border-cherry bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-2.5">
          <span className="relative block size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white">
            <Image src={settings.logo} alt="" fill sizes="44px" className="scale-[1.35] object-cover object-[50%_42%]" priority />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-poster text-[1.35rem] uppercase sm:text-2xl" dir="ltr">
              {settings.brandLatin}
            </span>
            <span className="mt-0.5 block truncate text-[0.72rem] font-semibold text-sky">{s.brandSubtitle}</span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-6 font-display text-[0.95rem] font-semibold md:flex">
          <a href="#menu" className="hover:text-flash">{t.navMenu}</a>
          <a href="#how" className="hover:text-flash">{t.navHow}</a>
          <a href="#contact" className="hover:text-flash">{t.navContact}</a>
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-4">
          <LangSwitch className="grid h-10 min-w-10 place-items-center rounded-sm border-2 border-white/30 px-2 text-sm font-bold hover:border-white" />
          <button
            ref={button}
            type="button"
            data-order-target
            onClick={(e) => open(e.currentTarget)}
            aria-label={`${t.cart} (${totals.units})`}
            className="relative flex h-10 items-center gap-2 overflow-hidden rounded-sm bg-cherry px-3 font-display font-bold transition-colors hover:bg-cherry-deep"
          >
            <RegisterIcon className="size-5" />
            <span className="hidden text-sm sm:inline">{t.cart}</span>
            <span key={`units-${totals.units}`} className="animate-bump grid h-6 min-w-6 place-items-center rounded-[2px] bg-flash px-1 font-poster text-sm text-navy">
              {totals.units}
            </span>
            {beep > 0 && <span key={`beep-${beep}`} aria-hidden className="beep laser pointer-events-none absolute inset-x-0 top-1/2 h-0.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
