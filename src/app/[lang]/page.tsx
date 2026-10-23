import { notFound } from "next/navigation";
import { BoxOffice } from "@/components/BoxOffice";
import { CartProvider } from "@/components/CartProvider";
import { CouponBooklet } from "@/components/CouponBooklet";
import { HowTo } from "@/components/HowTo";
import { I18nProvider } from "@/components/I18nProvider";
import { Marquee } from "@/components/Marquee";
import { PosterHero } from "@/components/PosterHero";
import { Program } from "@/components/Program";
import { getCategories, getProducts, getSettings, getTextOverrides } from "@/lib/catalog";
import { isLang } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [settings, categories, products, texts] = await Promise.all([getSettings(), getCategories(), getProducts(), getTextOverrides()]);

  return (
    <I18nProvider lang={lang} overrides={texts[lang]}>
      <CartProvider settings={settings}>
        <Marquee settings={settings} />
        <main>
          <PosterHero settings={settings} products={products} />
          <Program products={products} categories={categories} />
          <HowTo />
        </main>
        <BoxOffice settings={settings} categories={categories} />
        <CouponBooklet products={products} />
      </CartProvider>
    </I18nProvider>
  );
}
