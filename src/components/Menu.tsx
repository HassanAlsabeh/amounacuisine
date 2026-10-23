"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { chalkDust } from "@/lib/dust";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatPrice, isPriced } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { BurstDoodle, FlameDoodle, KibbehDoodle, OvenDoodle, PlateDoodle, PotDoodle, Scribble, StarDoodle } from "./Chalk";
import { DishLine } from "./DishLine";
import { useI18n } from "./I18nProvider";
import { PlusIcon } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

const ALL = "all";

/** Each section is chalked in its own pastel, in category order. */
const INKS = ["text-chalk-yellow", "text-chalk-pink", "text-chalk-lav", "text-chalk-mint", "text-chalk"];

/** A doodle beside each section's heading; categories the admin adds later get a kibbeh. */
const DOODLES: Record<string, typeof KibbehDoodle> = {
  fry: FlameDoodle,
  bake: OvenDoodle,
  cook: PotDoodle,
  eat: PlateDoodle,
  offers: StarDoodle,
};

/** The menu, chalked up as a list under "Today: …" headings. The words on top filter it. */
export function Menu({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const [active, setActive] = useState(ALL);

  // only categories with something in them, each with its own chalk colour
  const sections = useMemo(
    () =>
      categories
        .map((c, i) => ({ c, ink: INKS[i % INKS.length], items: products.filter((p) => p.category === c.id) }))
        .filter((s) => s.items.length),
    [products, categories],
  );
  const shown = active === ALL ? sections : sections.filter((s) => s.c.id === active);
  const tabs = [{ id: ALL, label: t.all }, ...sections.map((s) => ({ id: s.c.id, label: categoryName(s.c, lang) }))];

  return (
    <section id="menu" className="min-w-0 pb-6">
      <h2 className="chalk chalky font-chalk text-[calc(2.4rem*var(--cs))] leading-tight font-semibold sm:text-[calc(3rem*var(--cs))]">{t.menuTitle}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-chalk/60">{t.menuHint}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-chalk/50">
        <WhatsAppIcon className="size-3.5 text-chalk-lav" />= {t.priceLegend}
      </p>

      <Special products={products} />

      <div role="tablist" aria-label={t.menuTitle} className="no-scrollbar -mx-5 mt-8 flex items-center gap-1 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab, i) => {
          const on = tab.id === active;
          return (
            <span key={tab.id} className="flex shrink-0 items-center gap-1">
              {i > 0 && <span aria-hidden className="text-chalk/30">·</span>}
              <button
                role="tab"
                aria-selected={on}
                onClick={() => setActive(tab.id)}
                className={`chalk relative min-h-11 px-2 font-chalk text-[calc(1.25rem*var(--cs))] whitespace-nowrap transition-colors ${on ? "text-chalk-yellow" : "text-chalk/65 hover:text-chalk"}`}
              >
                {tab.label}
                {on && <Scribble key={active} drawn className="chalky absolute inset-x-1 bottom-1 h-2.5 w-[calc(100%-0.5rem)]" />}
              </button>
            </span>
          );
        })}
      </div>

      {shown.map(({ c, ink, items }) => {
        const Doodle = DOODLES[c.id] ?? KibbehDoodle;
        return (
          <div key={`${active}-${c.id}`} className="fade-in mt-9">
            <h3 className={`chalk flex items-end gap-3 font-chalk text-[calc(1.75rem*var(--cs))] leading-tight font-semibold ${ink}`}>
              {t.today(categoryName(c, lang))}
              <Doodle className="chalky mb-1 h-9 w-auto shrink-0 opacity-80" />
            </h3>
            <ul className="mt-2 divide-y divide-dashed divide-chalk/10">
              {items.map((p) => (
                <DishLine key={p.id} product={p} />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

/** The day's deal, boxed in yellow chalk with its price in a starburst. */
function Special({ products }: { products: Product[] }) {
  const { lang, t } = useI18n();
  const { add, settings } = useCart();
  const deals = products.filter((p) => p.featured && p.available);
  if (!deals.length) return null;

  return (
    <div className="mt-10 space-y-10">
      {deals.map((p) => {
        const text = productText(p, lang);
        const price = p.variants[0].price;
        const hasChoices = p.variants.length > 1 || p.options.length > 0;
        return (
          <article key={p.id} className="chalk-box relative p-4 pt-5 text-chalk-yellow sm:p-6">
            <div className="flex items-center gap-4 text-chalk">
              {p.image && (
                <span className="relative size-24 shrink-0 overflow-hidden rounded-full border-[3px] border-chalk/90 sm:size-32">
                  <Image src={p.image.src} alt={p.image.alt || text.name} fill sizes="128px" className="object-cover" />
                </span>
              )}
              <div className="min-w-0 pe-14 sm:pe-20">
                <p className="chalk flex items-center gap-1.5 font-chalk text-[calc(1.1rem*var(--cs))] text-chalk-pink">
                  <StarDoodle className="size-4" />
                  {t.specialKicker}
                </p>
                <h3 className="chalk mt-0.5 font-chalk text-[calc(1.6rem*var(--cs))] leading-tight font-semibold">{text.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-chalk/70">{text.description}</p>
              </div>
            </div>

            {isPriced(price) && (
              <span className="absolute -end-3 -top-7 grid size-24 rotate-12 place-items-center text-chalk-yellow sm:size-28">
                <BurstDoodle className="chalky absolute inset-0" />
                <span className="chalk relative font-chalk text-[calc(1.6rem*var(--cs))] font-bold">{formatPrice(price, settings.currency)}</span>
              </span>
            )}

            {hasChoices ? (
              <a href={`#dish-${p.id}`} className="chalk-box chalk mt-4 inline-flex min-h-11 items-center gap-2 px-4 font-chalk text-[calc(1.15rem*var(--cs))]">
                <PlusIcon className="size-4" />
                {t.specialCta}
              </a>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  add(buildLine(p, 0, [], p.weightStep ?? 1, false));
                  chalkDust(e.currentTarget);
                }}
                className="chalk-box chalk mt-4 inline-flex min-h-11 items-center gap-2 px-4 font-chalk text-[calc(1.15rem*var(--cs))] transition-transform hover:-rotate-1 active:scale-95"
              >
                <PlusIcon className="size-4" />
                {t.specialCta}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
