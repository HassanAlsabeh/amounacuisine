import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** The two shop pages, each pointing at its other-language twin. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { ar: `${SITE_URL}/ar`, en: `${SITE_URL}/en` };
  return [
    { url: `${SITE_URL}/ar`, changeFrequency: "weekly", priority: 1, alternates: { languages } },
    { url: `${SITE_URL}/en`, changeFrequency: "weekly", priority: 0.8, alternates: { languages } },
  ];
}
