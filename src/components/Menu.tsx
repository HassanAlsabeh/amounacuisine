"use client";

import { useMemo } from "react";
import { categoryName } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import { toneAt, type Tone } from "@/lib/tones";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { DishTile, type TileSize } from "./DishTile";
import { useI18n } from "./I18nProvider";
import { ALL, useMenuFilter } from "./MenuFilter";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Grid cells a tile covers at 2, 3 and 4 columns. */
const CELLS: Record<TileSize, [number, number, number]> = { one: [1, 1, 1], wide: [2, 2, 2], big: [2, 4, 4] };

/* The closing compartment fills whatever the last row has left (indexed by cells used, mod columns). */
const FILL_2 = ["col-span-2", "col-span-1"];
const FILL_3 = ["md:col-span-3", "md:col-span-2", "md:col-span-1"];
const FILL_4 = ["lg:col-span-4", "lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];

/** The deal is big; every fifth other dish runs wide, so the box never looks like a plain grid. */
function sizesOf(products: Product[]): TileSize[] {
  let k = 0;
  return products.map((p) => (p.featured ? "big" : k++ % 5 === 3 ? "wide" : "one"));
}

/** The menu tier: a strip of compartment tabs, then every dish in a compartment of its own size. */
export function Menu({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const { settings } = useCart();
  const { active, pick } = useMenuFilter();

  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [
      { id: ALL, label: t.all, count: products.length, tone: null as Tone | null },
      ...categories.flatMap((c, i) => (counts.get(c.id) ? [{ id: c.id, label: categoryName(c, lang), count: counts.get(c.id)!, tone: toneAt(i) }] : [])),
    ];
  }, [products, categories, lang, t.all]);

  const toneOf = useMemo(() => new Map(categories.map((c, i) => [c.id, toneAt(i)])), [categories]);
  const catOf = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const shown = active === ALL ? products : products.filter((p) => p.category === active);
  const sizes = sizesOf(shown);
  const used = [0, 1, 2].map((bp) => sizes.reduce((s, size) => s + CELLS[size][bp], 0));
  const fill = `${FILL_2[used[0] % 2]} ${FILL_3[used[1] % 3]} ${FILL_4[used[2] % 4]}`;

  return (
    <section id="menu" aria-labelledby="menu-title" className="bento grid grid-flow-row-dense grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <header className="col-span-full flex flex-col gap-2 p-5 sm:p-8 lg:flex-row lg:items-end lg:gap-10">
        <h2 id="menu-title" className="font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-[2.6rem] lg:max-w-md">
          {t.menuTitle}
        </h2>
        <p className="max-w-lg text-ink-2 lg:ms-auto">{t.menuHint}</p>
      </header>

      <div role="tablist" aria-label={t.menuTitle} className="hairlines col-span-full flex flex-wrap">
        {tabs.map((tab) => {
          const on = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={on}
              onClick={() => pick(tab.id)}
              className={`flex grow basis-[30%] flex-col items-start gap-1 px-3 py-3 text-start transition-colors sm:basis-0 sm:px-4 ${on ? "bg-ink text-box" : "hover:bg-counter"}`}
            >
              <span className="flex items-center gap-1.5">
                <span aria-hidden className={`size-2.5 rounded-[2px] ${tab.tone ? tab.tone.swatch : "bg-ink"} ${on ? "ring-2 ring-box/80" : ""}`} />
                <span className="font-display text-sm leading-tight font-semibold">{tab.label}</span>
              </span>
              <span className={`text-xs ${on ? "text-box/70" : "text-ink-3"}`}>{t.items(tab.count)}</span>
            </button>
          );
        })}
      </div>

      {shown.map((p, i) => (
        <DishTile
          key={`${active}:${p.id}`}
          product={p}
          size={sizes[i]}
          category={active === ALL ? catOf.get(p.category) : undefined}
          tone={toneOf.get(p.category) ?? toneAt(0)}
          delay={Math.min(i, 8) * 45}
        />
      ))}

      {/* the last compartment: anything that isn't on the menu */}
      <a
        key={`${active}:ask`}
        href={whatsappUrl(settings.whatsappNumber, "")}
        target="_blank"
        rel="noopener noreferrer"
        className={`drop-in group flex min-h-40 flex-col justify-between gap-4 p-4 sm:p-5 ${fill} slot-empty hover:bg-pista`}
      >
        <span>
          <span className="block font-display text-base font-bold">{t.fillerTitle}</span>
          <span className="mt-1 block text-sm leading-relaxed text-ink-2">{t.fillerText}</span>
        </span>
        <span className="inline-flex items-center gap-2 self-start rounded-cell border border-line bg-box px-3 py-2 font-display text-sm font-semibold">
          <WhatsAppIcon className="size-4 text-whatsapp" />
          <span dir="ltr">{settings.whatsappDisplay}</span>
        </span>
      </a>
    </section>
  );
}
