"use client";

import { useMemo, useState } from "react";
import { categoryName } from "@/lib/i18n";
import type { Category, Product } from "@/lib/types";
import { DishCard } from "./DishCard";
import { useI18n } from "./I18nProvider";
import { ChefHat, Flame } from "./Kitchenware";

const ALL = "all";

/** The menu, filtered by turning a knob on the stove's control panel. */
export function Menu({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const [active, setActive] = useState(ALL);

  // only knobs with something behind them
  const knobs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [
      { id: ALL, label: t.all, emoji: "👩‍🍳", count: products.length },
      ...categories.filter((c) => counts.get(c.id)).map((c) => ({ id: c.id, label: categoryName(c, lang), emoji: c.emoji, count: counts.get(c.id)! })),
    ];
  }, [products, categories, lang, t.all]);

  const shown = active === ALL ? products : products.filter((p) => p.category === active);
  const catOf = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  return (
    <section id="menu" className="parchment border-b-2 border-ink py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">{t.menuTitle}</h2>
            <p className="mt-2 max-w-xl text-ink-2">{t.menuHint}</p>
          </div>
          <ChefHat className="hidden w-28 shrink-0 -rotate-6 text-ink sm:block" />
        </div>

        {/* the stove's control panel */}
        <div className="mt-8 rounded-lg border-2 border-ink bg-steel shadow-sticker">
          <div role="tablist" aria-label={t.menuTitle} className="no-scrollbar flex gap-1 overflow-x-auto px-2 pt-3 pb-2 sm:justify-center sm:gap-4 sm:px-4">
            {knobs.map((k) => {
              const on = k.id === active;
              return (
                <button
                  key={k.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(k.id)}
                  className="group flex w-[5.4rem] shrink-0 flex-col items-center gap-1.5 rounded-md px-1 py-1 text-center outline-offset-2 focus-visible:outline-2 focus-visible:outline-butter sm:w-24"
                >
                  <span className="relative grid h-5 place-items-end" aria-hidden>
                    {on ? <Flame className="animate-flicker h-5 w-4 origin-bottom" /> : <span className="mb-0.5 block size-1.5 rounded-full bg-ink-3/60" />}
                  </span>
                  <span className={`relative grid size-14 place-items-center rounded-full border-2 border-ink shadow-[0_3px_0_#000] transition-transform ${on ? "" : "group-hover:-translate-y-0.5"}`}>
                    <span
                      className="knob-grip absolute inset-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.3,1.6,0.5,1)]"
                      style={{ transform: `rotate(${on ? 0 : -120}deg)` }}
                    >
                      <span className={`absolute top-1 left-1/2 h-4 w-1.5 -translate-x-1/2 rounded-full ${on ? "bg-tomato" : "bg-cream/80"}`} />
                    </span>
                    <span className="relative grid size-8 place-items-center rounded-full border border-black/40 bg-[#33314c] text-base">{k.emoji}</span>
                  </span>
                  <span className={`text-[0.78rem] leading-tight font-semibold ${on ? "text-butter" : "text-cream/80"}`}>{k.label}</span>
                  <span className="text-[0.66rem] text-cream/45">{t.items(k.count)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ul key={active} className="mt-10 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p, i) => (
            <li key={p.id} className="deal-in" style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}>
              <DishCard product={p} category={catOf.get(p.category)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
