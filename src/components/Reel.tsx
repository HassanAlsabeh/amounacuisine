"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatPrice, formatWeight, isPriced } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { announceAdded, pad } from "@/lib/ui";
import { useCart } from "./CartProvider";
import { DishView } from "./DishView";
import { useI18n } from "./I18nProvider";
import { CheckIcon, LineArrowIcon, PlusIcon } from "./Icons";

const ALL = "all";

/**
 * The menu as a film reel: one tall photo panel per dish, snapping sideways. A big numbered index
 * picks the category; arrows, buttons or the ← → keys move along the reel; a tap opens the dish.
 */
export function Reel({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const { viewing, isOpen } = useCart();
  const [active, setActive] = useState(ALL);
  const [index, setIndex] = useState(0);
  const section = useRef<HTMLElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const inView = useRef(false);

  // only categories with something in them
  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [
      { id: ALL, label: t.all, count: products.length },
      ...categories.filter((c) => counts.get(c.id)).map((c) => ({ id: c.id, label: categoryName(c, lang), count: counts.get(c.id)! })),
    ];
  }, [products, categories, lang, t.all]);

  const shown = useMemo(() => (active === ALL ? products : products.filter((p) => p.category === active)), [products, active]);
  const catOf = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const goTo = useCallback((i: number, smooth = true) => {
    const el = strip.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", inline: "start", block: "nearest" });
  }, []);

  // which panel sits at the start edge of the reel (the end of the reel counts as the last one)
  const onScroll = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const inset = parseFloat(getComputedStyle(el).scrollPaddingInlineStart) || 0;
    const box = el.getBoundingClientRect();
    if (el.scrollWidth - el.clientWidth - Math.abs(el.scrollLeft) < 4) return setIndex(el.children.length - 1);
    let best = 0;
    let bestDist = Infinity;
    [...el.children].forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const dist = Math.abs(rtl ? box.right - inset - r.right : r.left - box.left - inset);
      if (dist < bestDist) [best, bestDist] = [i, dist];
    });
    setIndex(best);
  }, []);

  // the reel is keyed by category, so a new pick starts a fresh strip at its first dish
  const pick = (id: string) => {
    setActive(id);
    setIndex(0);
  };

  // ← → move along the reel while it's on screen and nothing is open over it
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.35 });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (viewing || isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (!inView.current || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      e.preventDefault();
      const forward = (e.key === "ArrowRight") === (lang !== "ar");
      goTo(Math.max(0, Math.min(shown.length - 1, index + (forward ? 1 : -1))));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing, isOpen, lang, goTo, index, shown.length]);

  // the reel follows the dish view when it steps to another dish
  useEffect(() => {
    const i = viewing ? shown.indexOf(viewing) : -1;
    if (i >= 0) goTo(i, false);
  }, [viewing, shown, goTo]);

  const step = (d: number) => goTo(Math.max(0, Math.min(shown.length - 1, index + d)));

  return (
    <section id="menu" ref={section} className="border-t border-line pt-16 pb-14 sm:pt-24 sm:pb-20">
      <div className="mx-auto max-w-[76rem] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="flex items-baseline gap-4 font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            <span className="text-base font-bold text-saffron sm:text-lg">01</span>
            {t.menuTitle}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-bone-2 sm:text-base">{t.menuLead}</p>
        </div>

        {/* the numbered index */}
        <div role="tablist" aria-label={t.menuTitle} className="no-scrollbar -mx-4 mt-10 flex overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab, i) => {
            const on = tab.id === active;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={on}
                onClick={() => pick(tab.id)}
                className="group relative flex shrink-0 flex-col items-start gap-2 pt-2 pb-4 pe-7 focus-visible:outline-offset-[-2px] sm:pe-10"
              >
                <span
                  className={`font-display text-[2.6rem] leading-none font-extrabold tabular-nums transition-colors sm:text-[3.4rem] ${
                    on ? "text-saffron" : "numeral-outline group-hover:[-webkit-text-stroke-color:var(--color-bone)]"
                  }`}
                >
                  {pad(i)}
                </span>
                <span className="text-start leading-tight">
                  <span className={`block text-sm font-bold whitespace-nowrap transition-colors ${on ? "text-bone" : "text-bone-3 group-hover:text-bone-2"}`}>{tab.label}</span>
                  <span className="block text-[0.7rem] text-bone-3">{t.items(tab.count)}</span>
                </span>
                <span
                  aria-hidden
                  className={`absolute start-0 end-7 -bottom-px h-0.5 bg-saffron transition-transform duration-500 ltr:origin-left rtl:origin-right sm:end-10 ${on ? "scale-x-100" : "scale-x-0"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <ul key={active} ref={strip} onScroll={onScroll} className="reel mt-8 flex gap-3 overflow-x-auto sm:mt-10 sm:gap-4" aria-label={tabs.find((x) => x.id === active)?.label}>
        {shown.map((p, i) => (
          <Panel key={p.id} product={p} n={i + 1} total={shown.length} current={i === index} delay={Math.min(i, 5) * 70} category={catOf.get(p.category)} />
        ))}
      </ul>

      <div className="mx-auto mt-6 flex max-w-[76rem] items-center gap-4 px-4 sm:mt-8 sm:gap-6 sm:px-6">
        <p className="font-display text-sm font-bold tabular-nums" dir="ltr">
          <span className="text-bone">{pad(index + 1)}</span>
          <span className="text-bone-3"> / {pad(shown.length)}</span>
        </p>
        <div className="relative h-px flex-1 bg-line">
          <span className="absolute inset-y-0 start-0 -my-px bg-saffron transition-[width] duration-500" style={{ width: `${((index + 1) / shown.length) * 100}%` }} />
        </div>
        <span className="hidden text-xs text-bone-3 lg:inline">{t.keysHint}</span>
        <div className="flex">
          <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label={t.prev} className="grid size-11 place-items-center border border-line-strong transition-colors hover:bg-bone hover:text-night disabled:pointer-events-none disabled:opacity-30">
            <LineArrowIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
          </button>
          <button type="button" onClick={() => step(1)} disabled={index >= shown.length - 1} aria-label={t.next} className="-ms-px grid size-11 place-items-center border border-line-strong transition-colors hover:bg-bone hover:text-night disabled:pointer-events-none disabled:opacity-30">
            <LineArrowIcon className="size-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>

      <DishView list={shown} categories={categories} />
    </section>
  );
}

/** One dish, full-photo: number on top, name, price and a quick add over a dark gradient at the foot. */
function Panel({ product: p, n, total, current, delay, category }: { product: Product; n: number; total: number; current: boolean; delay: number; category?: Category }) {
  const { lang, t } = useI18n();
  const { lines, add, view, settings } = useCart();
  const [added, setAdded] = useState(false);
  const [failed, setFailed] = useState(false);

  const text = productText(p, lang);
  const from = Math.min(...p.variants.map((v) => v.price));
  const priced = isPriced(from);
  const hasChoices = p.variants.length > 1 || p.options.length > 0;
  const photo = p.image && !failed ? p.image : null;

  const mine = lines.filter((l) => l.productId === p.id);
  const inOrder = mine.reduce((s, l) => s + l.qty, 0);
  const inOrderLabel = p.weightStep ? formatWeight(inOrder, lang) : String(inOrder);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(id);
  }, [added]);

  const quickAdd = () => {
    if (hasChoices) return view(p);
    add(buildLine(p, 0, [], p.weightStep ?? 1, false));
    announceAdded(text.name);
    setAdded(true);
  };

  return (
    <li
      className={`reveal relative h-[min(68svh,34rem)] shrink-0 snap-start sm:h-[34rem] ${p.featured ? "w-[84vw] sm:w-[32rem]" : "w-[76vw] sm:w-[21rem]"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <article className={`grain group relative h-full overflow-hidden bg-night-3 ${p.featured ? "ring-1 ring-saffron ring-inset" : ""}`}>
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt || text.name}
            fill
            sizes="(min-width: 640px) 512px, 84vw"
            onError={() => setFailed(true)}
            className={`object-cover transition-[filter,transform] duration-700 ${current ? "animate-kenburns" : "brightness-[0.7] group-hover:scale-[1.04] group-hover:brightness-90"} ${
              p.available ? "" : "grayscale"
            }`}
          />
        ) : (
          <div role="img" aria-label={text.name} className="grid h-full place-items-center text-8xl opacity-70">
            {p.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(19_16_14/0.55)_0%,transparent_22%,transparent_42%,rgb(19_16_14/0.88)_74%,var(--color-night)_100%)]" />

        {/* the whole panel opens the dish */}
        <button type="button" onClick={() => view(p)} aria-label={`${t.open}: ${text.name}`} className="absolute inset-0 z-10 focus-visible:outline-offset-[-4px]" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 sm:p-5">
          <p className="font-display leading-none font-extrabold tabular-nums" dir="ltr">
            <span className="text-4xl sm:text-5xl">{pad(n)}</span>
            <span className="text-sm text-bone-2"> / {pad(total)}</span>
          </p>
          {p.featured ? (
            <span className="bg-saffron px-2.5 py-1 text-xs font-extrabold text-night">{t.bestSeller}</span>
          ) : (
            category && <span className="border border-line-strong bg-night/40 px-2 py-1 text-[0.7rem] font-semibold backdrop-blur-sm">{categoryName(category, lang)}</span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5">
          {inOrder > 0 && (
            <span className="mb-3 inline-block bg-lav px-2 py-0.5 font-display text-xs font-bold text-night" dir="auto">
              {t.inOrder(inOrderLabel)}
            </span>
          )}
          <h3 className={`font-display leading-[1.08] font-bold ${p.featured ? "text-3xl sm:text-4xl" : "text-[1.65rem] sm:text-3xl"}`}>{text.name}</h3>
          {text.note && <p className="mt-1.5 text-sm text-bone-2">{text.note}</p>}

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
            {!p.available ? (
              <span className="border border-lav/60 px-2 py-1 text-sm font-bold text-lav">{t.unavailable}</span>
            ) : priced ? (
              <p className="font-display leading-none font-extrabold tabular-nums">
                <span className={p.featured ? "text-5xl text-saffron" : "text-3xl"}>{formatPrice(from, settings.currency)}</span>
                {p.weightStep && <span className="ms-1.5 font-sans text-xs font-medium text-bone-2">{t.perKilo}</span>}
              </p>
            ) : (
              <p className="text-sm leading-tight font-semibold text-lav">{t.priceOnRequest}</p>
            )}

            {p.available && (
              <button
                type="button"
                onClick={quickAdd}
                aria-label={`${t.add}: ${text.name}`}
                className={`pointer-events-auto grid size-12 shrink-0 place-items-center transition-colors duration-300 ${added ? "bg-bone text-night" : "bg-saffron text-night hover:bg-bone"}`}
              >
                {added ? <CheckIcon key="ok" className="animate-bump size-5" /> : <PlusIcon className="size-5" />}
              </button>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}
