import { notFound } from "next/navigation";
import { Aisle } from "@/components/Aisle";
import { CartProvider } from "@/components/CartProvider";
import { Checkout } from "@/components/Checkout";
import { FreezerHero } from "@/components/FreezerHero";
import { I18nProvider } from "@/components/I18nProvider";
import { OrderSteps } from "@/components/OrderSteps";
import { PackBack } from "@/components/PackBack";
import { StoreFooter } from "@/components/StoreFooter";
import { Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { getCategories, getProducts, getSettings, getTextOverrides } from "@/lib/catalog";
import { isLang, withOverrides } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [settings, categories, products, texts] = await Promise.all([getSettings(), getCategories(), getProducts(), getTextOverrides()]);
  // server components read the same admin-edited strings as the client ones
  const t = withOverrides(lang, texts[lang]);

  return (
    <I18nProvider lang={lang} overrides={texts[lang]}>
      <CartProvider settings={settings}>
        <TopBar settings={settings} />
        <main>
          <FreezerHero settings={settings} lang={lang} t={t} products={products} />
          <Ticker text={t.ticker} />
          <Aisle products={products} categories={categories} />
          <OrderSteps settings={settings} t={t} />
        </main>
        <StoreFooter settings={settings} categories={categories} lang={lang} t={t} />
        <PackBack categories={categories} />
        <Checkout products={products} categories={categories} />
      </CartProvider>
    </I18nProvider>
  );
}
