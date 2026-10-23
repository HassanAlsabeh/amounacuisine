import type { Settings } from "./types";

/** Settings saved before a field existed get its default, so every reader sees the full shape. */
export function withSettingsDefaults(s: Settings): Settings {
  return {
    ...s,
    brandSubtitle: s.brandSubtitle ?? "",
    en: { ...s.en, brandSubtitle: s.en.brandSubtitle ?? "" },
  };
}
