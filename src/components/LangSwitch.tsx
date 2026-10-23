"use client";

import Link from "next/link";
import { useI18n } from "./I18nProvider";

/** Link to the same page in the other language. The cart lives in localStorage, so it carries over. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();
  const other = lang === "ar" ? "en" : "ar";

  return (
    <Link href={`/${other}`} hrefLang={other} lang={other} aria-label={t.switchLangLabel} className={className}>
      {t.switchLang}
    </Link>
  );
}
