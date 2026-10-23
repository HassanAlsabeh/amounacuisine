import "server-only";

import { getTextOverrides } from "./catalog";
import { withOverrides } from "./i18n";
import type { Lang } from "./types";

/** Interface strings for server components, including the admin's text edits. */
export async function getDictionary(lang: Lang) {
  const overrides = await getTextOverrides();
  return withOverrides(lang, overrides[lang]);
}
