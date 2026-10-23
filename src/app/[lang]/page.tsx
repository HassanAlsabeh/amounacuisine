import { notFound } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowTo } from "@/components/HowTo";
import { I18nProvider } from "@/components/I18nProvider";
import { Menu } from "@/components/Menu";
import { OfferBand } from "@/components/OfferBand";
import { Tray } from "@/components/Tray";
import { getCategories, getProducts, getSettings, getTextOverrides } from "@/lib/catalog";
import { isLang } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [settings, categories, products, texts] = await Promise.all([getSettings(), getCategories(), getProducts(), getTextOverrides()]);

  return (
    <I18nProvider lang={lang} overrides={texts[lang]}>
      <CartProvider settings={settings}>
        <Header settings={settings} />
        <main>
          <Hero settings={settings} lang={lang} />
          <Menu products={products} categories={categories} />
          <OfferBand products={products} />
          <HowTo settings={settings} />
        </main>
        <Footer settings={settings} categories={categories} lang={lang} />
        <Tray products={products} />
      </CartProvider>
    </I18nProvider>
  );
}
