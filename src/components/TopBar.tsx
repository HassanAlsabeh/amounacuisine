"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/order";
import type { Settings } from "@/lib/types";
import { ADDED_EVENT, pad } from "@/lib/ui";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { CheckIcon } from "./Icons";

/** A thin bar over everything: brand, numbered sections, language, and the order counter that opens the summary. */
export function TopBar({ settings }: { settings: Settings }) {
  const { lang, t } = useI18n();
  const { totals, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [note, setNote] = useState({ text: "", on: false });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // drop "Kibbeh · added" under the counter for a moment after each add
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onAdded = (e: Event) => {
      clearTimeout(timer);
      setNote({ text: (e as CustomEvent<string>).detail, on: true });
      timer = setTimeout(() => setNote((n) => ({ ...n, on: false })), 2200);
    };
    window.addEventListener(ADDED_EVENT, onAdded);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(ADDED_EVENT, onAdded);
    };
  }, []);

  const showTotal = totals.units > 0 && totals.unpricedLines < totals.units && totals.subtotal > 0;
  const nav = [
    ["#menu", t.navMenu],
    ["#how", t.navHow],
    ["#contact", t.navContact],
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-500 ${scrolled ? "border-line bg-night/85 backdrop-blur-md" : "border-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-[76rem] items-center gap-3 px-4 sm:px-6">
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-2.5">
          <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-lav">
            <Image src={settings.logo} alt="" fill sizes="36px" className="scale-[1.3] object-cover object-[50%_42%]" priority />
          </span>
          <span className="truncate font-display text-[1.05rem] font-bold tracking-tight" dir="ltr">
            {settings.brandLatin}
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-7 text-sm md:flex">
          {nav.map(([href, label], i) => (
            <a key={href} href={href} className="group flex items-baseline gap-1.5 text-bone-2 transition-colors hover:text-bone">
              <span className="font-display text-[0.7rem] text-saffron">{pad(i + 1)}</span>
              {label}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-stretch md:ms-6">
          <Link
            href={`/${lang === "ar" ? "en" : "ar"}`}
            hrefLang={lang === "ar" ? "en" : "ar"}
            aria-label={t.switchLangLabel}
            className="grid h-10 min-w-10 place-items-center border border-e-0 border-line-strong px-2.5 text-sm font-bold transition-colors hover:bg-bone hover:text-night"
          >
            {t.switchLang}
          </Link>
          <button
            type="button"
            onClick={(e) => open(e.currentTarget)}
            aria-label={`${t.cart} (${totals.units})`}
            className={`flex h-10 items-center gap-2.5 border px-3 text-sm font-bold transition-colors ${
              totals.units > 0 ? "border-saffron bg-saffron text-night hover:bg-bone" : "border-line-strong hover:bg-bone hover:text-night"
            }`}
          >
            <span>{t.cart}</span>
            <span className="flex overflow-hidden font-display tabular-nums" dir="ltr">
              [<span key={totals.units} className="animate-bump inline-block">{pad(totals.units)}</span>]
            </span>
            {showTotal && (
              <span className="hidden border-s border-night/30 ps-2.5 font-display tabular-nums sm:inline">{formatPrice(totals.total, settings.currency)}</span>
            )}
          </button>
        </div>
      </div>

      {/* the "+1" note, sliding out from under the bar */}
      <div className="pointer-events-none absolute end-4 top-full overflow-hidden sm:end-6" aria-live="polite">
        <p className={`ticker flex max-w-[78vw] items-center gap-2 bg-bone px-3 py-2 text-sm font-semibold text-night ${note.on ? "is-on" : ""}`}>
          <CheckIcon className="size-4 shrink-0 text-saffron-deep" />
          <span className="truncate">{note.text}</span>
          <span className="shrink-0 text-night/55">· {t.added}</span>
        </p>
      </div>
    </header>
  );
}
