import type { Metadata, Viewport } from "next";
import { Caveat, Kalam, Mada, Marhey } from "next/font/google";
import { getSettings } from "@/lib/catalog";
import { DEFAULT_LANG, dirOf, isLang, settingsText } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

/*
 * Chalk on the board: Caveat for Latin, Marhey's rounded hand for Arabic. The waiter's pen on the
 * order pad: Kalam (Arabic falls back to Marhey). Body text: Mada, clean in both scripts.
 * The Latin-only fonts get no metric-matched fallback face: it would cover Arabic letters
 * with Arial before Marhey ever got them.
 */
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["400", "600", "700"], adjustFontFallback: false });
const marhey = Marhey({ variable: "--font-marhey", subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"] });
const kalam = Kalam({ variable: "--font-kalam", subsets: ["latin"], weight: ["400", "700"], adjustFontFallback: false });
const mada = Mada({ variable: "--font-mada", subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600", "700"] });

const fontVars = [caveat, marhey, kalam, mada].map((f) => f.variable).join(" ");

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
  themeColor: "#6e4222",
};

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Params }>) {
  // an unknown language still needs a document around the page's 404
  const raw = (await params).lang;
  const lang = isLang(raw) ? raw : DEFAULT_LANG;

  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body className={`${fontVars} wood font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
