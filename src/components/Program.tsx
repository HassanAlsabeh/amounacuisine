"use client";

import { useMemo, useState } from "react";
import { categoryName, productText } from "@/lib/i18n";
import { formatPrice, isPriced } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { AddControl, Choices, DishStamp, HalftonePhoto, StampHit, useDish } from "./DishStamp";
import { useI18n } from "./I18nProvider";

const ALL = "all";
/** The three print inks, handed out to the categories in turn. */
const INKS = ["var(--color-tomato)", "var(--color-mustard)", "var(--color-teal)"];

/** Tonight's programme: striped marquee tabs over a staggered wall of dish stamps and tickets. */
export function Program({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const [active, setActive] = useState(ALL);

  // only tabs with something behind them
  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [
      { id: ALL, label: t.all, emoji: "🎬", count: products.length },
      ...categories.filter((c) => counts.get(c.id)).map((c) => ({ id: c.id, label: categoryName(c, lang), emoji: c.emoji, count: counts.get(c.id)! })),
    ];
  }, [products, categories, lang, t.all]);

  const catOf = useMemo(() => new Map(categories.map((c, i) => [c.id, { category: c, ink: INKS[i % INKS.length] }])), [categories]);
  const serialOf = useMemo(() => new Map(products.map((p, i) => [p.id, i + 1])), [products]);

  const shown = active === ALL ? products : products.filter((p) => p.category === active);
  // deals on sale get the big poster; the rest go on the wall
  const features = shown.filter((p) => p.featured && p.available);
  const wall = shown.filter((p) => !features.includes(p));

  return (
    <section id="menu" className="paper py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="riso text-center font-display text-[2.6rem] leading-tight sm:text-6xl">{t.menuTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-medium text-brown-2">{t.menuHint}</p>
      </div>

      <div role="tablist" aria-label={t.menuTitle} className="no-scrollbar mt-8 flex snap-x gap-2.5 overflow-x-auto px-4 pt-1 pb-3 md:flex-wrap md:justify-center">
        {tabs.map((k, i) => {
          const on = k.id === active;
          return (
            <button
              key={k.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(k.id)}
              className={`group relative flex w-[7.6rem] shrink-0 snap-start flex-col text-center transition-transform sm:w-36 ${on ? "" : "hover:-translate-y-1"}`}
            >
              <span aria-hidden className="stripes-3 block h-2.5" style={{ opacity: on ? 1 : 0.85 }} />
              <span className={`relative flex flex-1 flex-col items-center px-2 pt-2.5 pb-2 ${on ? "bg-mustard text-brown" : "bg-brown text-paper-3"}`}>
                {on && <span aria-hidden className="bulbs bulbs-blink absolute inset-1" />}
                <span className="text-xl leading-none" aria-hidden>{k.emoji}</span>
                <span className="mt-1 font-display text-lg leading-tight">{k.label}</span>
                <span className={`mt-0.5 font-sign text-[0.62rem] ${on ? "text-tomato-deep" : "text-mustard"}`}>{t.items(k.count)}</span>
              </span>
              <span aria-hidden className={`block h-1.5 ${on ? "bg-tomato" : i % 2 ? "bg-teal" : "bg-tomato"}`} />
            </button>
          );
        })}
      </div>

      <div key={active} className="mx-auto max-w-6xl px-4">
        {features.map((p) => (
          <Feature key={p.id} product={p} ink={catOf.get(p.category)?.ink ?? INKS[0]} />
        ))}

        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 pb-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {wall.map((p, i) => {
            const cat = catOf.get(p.category);
            return (
              <li
                key={p.id}
                className="deal-in odd:-rotate-[0.7deg] even:rotate-[0.8deg] max-md:even:translate-y-7 md:max-lg:[&:nth-child(3n+2)]:translate-y-10 lg:even:translate-y-10"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <DishStamp
                  product={p}
                  category={cat?.category}
                  ink={cat?.ink ?? INKS[0]}
                  serial={serialOf.get(p.id) ?? i + 1}
                  look={i % 4 === 1 || i % 4 === 2 ? "ticket" : "stamp"}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The main feature: a deal billed as the night's big film, price in a starburst. */
function Feature({ product: p, ink }: { product: Product; ink: string }) {
  const { lang, t } = useI18n();
  const { settings } = useCart();
  const dish = useDish(p);
  const text = productText(p, lang);
  const price = p.variants[0].price;

  return (
    <article className="deal-in group relative mt-10 overflow-hidden bg-teal text-paper-3">
      <div aria-hidden className="dots absolute inset-0 text-teal-deep" />
      <div aria-hidden className="sunburst absolute top-1/2 left-1/2 size-[44rem] -translate-1/2 opacity-25 md:left-1/4 rtl:md:left-3/4" />
      <div className="relative grid items-center gap-8 px-5 py-9 md:grid-cols-2 md:gap-12 md:px-12 md:py-12">
        <div className="relative mx-auto w-full max-w-md -rotate-2">
          <div className="perforated bg-paper-3">
            <HalftonePhoto product={p} ink={ink} live={dish.inCart} sizes="(min-width: 768px) 440px, 85vw" className="aspect-[5/4]">
              <StampHit dish={dish} className="inset-0" />
            </HalftonePhoto>
          </div>
          {isPriced(price) && (
            <span className="burst absolute -end-4 -top-6 grid size-24 rotate-12 place-items-center bg-mustard font-sign text-3xl text-brown sm:size-28 sm:text-4xl" dir="ltr">
              {formatPrice(price, settings.currency)}
            </span>
          )}
        </div>

        <div className="text-center md:text-start">
          <p className="ribbon inline-block bg-tomato px-6 py-1 text-sm font-extrabold">{t.featureKicker}</p>
          <h3 className="riso-mustard mt-4 font-display text-[2.5rem] leading-[1.15] sm:text-6xl">{text.name}</h3>
          {text.description && <p className="mx-auto mt-3 max-w-md text-paper-3/85 md:mx-0">{text.description}</p>}
          {dish.hasChoices && (
            <div className="mx-auto max-w-xs md:mx-0">
              <Choices product={p} dish={dish} onInk />
            </div>
          )}
          <div className="mt-6 flex justify-center md:justify-start">
            {dish.plainQty > 0 && !dish.hasChoices ? (
              <AddControl product={p} dish={dish} onInk />
            ) : (
              <button type="button" onClick={dish.add} className="ticket inline-flex h-13 items-center bg-mustard px-9 text-base font-extrabold text-brown [--y:50%] hover:bg-mustard-soft active:scale-95">
                {t.featureCta}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
