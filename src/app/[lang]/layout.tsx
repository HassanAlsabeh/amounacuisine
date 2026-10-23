import type { Metadata, Viewport } from "next";
import { Lalezar, Readex_Pro } from "next/font/google";
import { getSettings } from "@/lib/catalog";
import { DEFAULT_LANG, dirOf, isLang, settingsText } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

/* Headings: Lalezar's chunky, friendly strokes in both scripts. Body: Readex Pro, Arabic and Latin. */
const lalezar = Lalezar({ variable: "--font-lalezar", subsets: ["arabic", "latin"], weight: "400" });
const readex = Readex_Pro({ variable: "--font-readex", subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600", "700"] });

const fontVars = [lalezar, readex].map((f) => f.variable).join(" ");

type Params = Promise<{ lang: string }>;

/*
 * Nothing is pre-rendered at build time, so the build never needs the database
 * (a new Vercel project builds before its database is connected). Each language
 * page is rendered on its first visit and then cached until the next admin save.
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  const s = await getSettings();
  const t = settingsText(s, isLang(lang) ? lang : DEFAULT_LANG);
  return {
    metadataBase: new URL(SITE_URL),
    title: `${t.siteName} | ${s.brandLatin}`,
    description: t.welcome,
    icons: { icon: s.logo, apple: s.logo },
    alternates: { canonical: `/${lang}`, languages: { ar: "/ar", en: "/en", "x-default": "/ar" } },
    openGraph: {
      type: "website",
      url: `/${lang}`,
      siteName: t.siteName,
      title: t.siteName,
      description: t.welcome,
      images: [s.logo],
      locale: lang === "en" ? "en_US" : "ar_LB",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#e6e9f6",
};

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Params }>) {
  // an unknown language still needs a document around the page's 404
  const raw = (await params).lang;
  const lang = isLang(raw) ? raw : DEFAULT_LANG;

  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body className={`${fontVars} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
