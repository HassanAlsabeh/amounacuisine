"use client";

import { createContext, useContext, useMemo } from "react";
import { withOverrides, type Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const I18nContext = createContext<{ lang: Lang; t: Dict } | null>(null);

export function I18nProvider({
  lang,
  overrides,
  children,
}: {
  lang: Lang;
  /** Admin text edits for this language. */
  overrides?: Record<string, string>;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ lang, t: withOverrides(lang, overrides) }), [lang, overrides]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Current language plus its interface strings. */
export function useI18n(): { lang: Lang; t: Dict } {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
