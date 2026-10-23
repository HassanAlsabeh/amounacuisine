import { notFound } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { ChalkFilter } from "@/components/Chalk";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowTo } from "@/components/HowTo";
import { I18nProvider } from "@/components/I18nProvider";
import { Menu } from "@/components/Menu";
import { PadSheet, PinnedPad } from "@/components/OrderPad";
import { getCategories, getProducts, getSettings, getTextOverrides } from "@/lib/catalog";
import { isLang } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [settings, categories, products, texts] = await Promise.all([getSettings(), getCategories(), getProducts(), getTextOverrides()]);

  return (
    <I18nProvider lang={lang} overrides={texts[lang]}>
      <CartProvider settings={settings}>
        <ChalkFilter />
        <Header settings={settings} />
        {/* the slate, set into the wooden frame */}
        <div className="px-2 pt-1 sm:px-4 lg:px-5">
          <div className="board overflow-x-clip rounded-[3px]">
            <main>
              <Hero settings={settings} lang={lang} />
              <div className="mx-auto max-w-7xl gap-12 px-5 pb-6 md:px-10 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem]">
                <Menu products={products} categories={categories} />
                <aside className="hidden pt-4 lg:block">
                  <PinnedPad />
                </aside>
              </div>
              <HowTo lang={lang} />
            </main>
            <Footer settings={settings} lang={lang} />
          </div>
        </div>
        <PadSheet />
      </CartProvider>
    </I18nProvider>
  );
}
