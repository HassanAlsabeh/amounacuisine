import { notFound } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { Feature } from "@/components/Feature";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { I18nProvider } from "@/components/I18nProvider";
import { Method } from "@/components/Method";
import { OrderSummary } from "@/components/OrderSummary";
import { Reel } from "@/components/Reel";
import { TopBar } from "@/components/TopBar";
import { getCategories, getProducts, getSettings, getTextOverrides } from "@/lib/catalog";
import { isLang } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [settings, categories, products, texts] = await Promise.all([getSettings(), getCategories(), getProducts(), getTextOverrides()]);

  return (
    <I18nProvider lang={lang} overrides={texts[lang]}>
      <CartProvider settings={settings}>
        <TopBar settings={settings} />
        <main>
          <Hero settings={settings} />
          <Reel products={products} categories={categories} />
          <Feature products={products} />
          <Method settings={settings} />
        </main>
        <Footer settings={settings} categories={categories} />
        <OrderSummary products={products} />
      </CartProvider>
    </I18nProvider>
  );
}
