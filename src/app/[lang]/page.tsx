import { notFound } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { HowTo } from "@/components/HowTo";
import { I18nProvider } from "@/components/I18nProvider";
import { Lid } from "@/components/Lid";
import { Lunchbox } from "@/components/Lunchbox";
import { Menu } from "@/components/Menu";
import { MenuFilterProvider } from "@/components/MenuFilter";
import { TopTier } from "@/components/TopTier";
import { getCategories, getProducts, getSettings, getTextOverrides } from "@/lib/catalog";
import { isLang } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [settings, categories, products, texts] = await Promise.all([getSettings(), getCategories(), getProducts(), getTextOverrides()]);

  return (
    <I18nProvider lang={lang} overrides={texts[lang]}>
      <CartProvider settings={settings}>
        <MenuFilterProvider>
          <Lid settings={settings} />
          {/* the box's tiers, stacked on the counter */}
          <main className="mx-auto max-w-6xl space-y-3 px-3 py-3 sm:space-y-5 sm:px-5 sm:py-5">
            <TopTier settings={settings} products={products} categories={categories} />
            <Menu products={products} categories={categories} />
            <HowTo />
          </main>
          <Footer settings={settings} categories={categories} />
          <Lunchbox products={products} />
        </MenuFilterProvider>
      </CartProvider>
    </I18nProvider>
  );
}
