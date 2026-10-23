"use client";

import Image from "next/image";
import Link from "next/link";
import { settingsText } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";

const CELL_TONES = ["bg-apri", "bg-butter", "bg-pista", "bg-lav"];

/** A tiny four-compartment box; one compartment fills for each dish packed. */
export function BoxGlyph({ filled, className = "" }: { filled: number; className?: string }) {
  return (
    <span aria-hidden className={`grid grid-cols-2 gap-[2px] rounded-[3px] border-[1.5px] border-current p-[2px] ${className}`}>
      {CELL_TONES.map((tone, i) => (
        <span key={i} className={`rounded-[1px] transition-colors duration-300 ${i < filled ? `${tone} ring-1 ring-current/70` : "bg-current/10"}`} />
      ))}
    </span>
  );
}

/** The header is the box's lid: brand on one side, the packed box on the other. */
export function Lid({ settings }: { settings: Settings }) {
  const { lang, t } = useI18n();
  const { lines, totals, open } = useCart();
  const s = settingsText(settings, lang);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-box/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:px-5">
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-2.5">
          <span className="relative block size-10 shrink-0 overflow-hidden rounded-full border border-line bg-white">
            <Image src={settings.logo} alt="" fill sizes="40px" className="scale-[1.35] object-cover object-[50%_42%]" priority />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-lg font-bold tracking-tight" dir="ltr">
              {settings.brandLatin}
            </span>
            <span className="mt-1 block truncate text-xs text-ink-2">{s.brandSubtitle}</span>
          </span>
        </Link>

        <nav className="ms-auto hidden h-full items-stretch text-sm font-medium md:flex">
          {[
            ["#menu", t.navMenu],
            ["#how", t.navHow],
            ["#contact", t.navContact],
          ].map(([href, label]) => (
            <a key={href} href={href} className="grid place-items-center border-s border-line/15 px-5 hover:bg-butter/60">
              {label}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <Link
            href={lang === "ar" ? "/en" : "/ar"}
            hrefLang={lang === "ar" ? "en" : "ar"}
            aria-label={t.switchLangLabel}
            className="grid h-10 min-w-10 place-items-center rounded-cell border border-line px-2 font-display text-sm font-semibold hover:bg-lav"
          >
            {lang === "ar" ? "EN" : "ع"}
          </Link>
          <button
            type="button"
            data-box-target
            onClick={(e) => open(e.currentTarget)}
            aria-label={`${t.cartTitle} (${totals.units})`}
            className="flex h-10 items-center gap-2 rounded-cell bg-ink ps-2.5 pe-3 text-box transition-colors hover:bg-ink-2"
          >
            <BoxGlyph filled={Math.min(lines.length, 4)} className="size-6" />
            <span className="hidden font-display text-sm font-semibold sm:inline">{t.cart}</span>
            <span key={totals.units} className="animate-pop min-w-5 rounded-[3px] bg-butter px-1 text-center font-display text-sm font-bold text-ink tabular-nums">
              {totals.units}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
