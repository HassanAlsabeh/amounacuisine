"use client";

import Image from "next/image";
import { useState } from "react";
import { flyToTray } from "@/lib/fly";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatPrice, formatWeight, isPriced, lineKey, unitPrice } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { MinusIcon, PlusIcon } from "./Icons";

/** A dish taped to the fridge. Tap "?" and it turns over to show what's in it and the choices. */
export function DishCard({ product: p, category }: { product: Product; category?: Category }) {
  const { lang, t } = useI18n();
  const { lines, add, setQty, settings } = useCart();
  const [flipped, setFlipped] = useState(false);
  const [variant, setVariant] = useState(0);
  const [picks, setPicks] = useState<number[]>(() => p.options.map(() => 0));
  const [failed, setFailed] = useState(false);

  const text = productText(p, lang);
  const c = settings.currency;
  const step = p.weightStep ?? 1;
  const hasChoices = p.variants.length > 1 || p.options.length > 0;
  const fromPrice = Math.min(...p.variants.map((v) => v.price));
  const priced = isPriced(fromPrice);

  // the plain version (first size, default options) can be stepped right on the card
  const plainKey = lineKey(p.id, 0, p.options.map(() => 0), false);
  const plainQty = lines.find((l) => l.key === plainKey)?.qty ?? 0;
  const amount = (q: number) => (p.weightStep ? formatWeight(q, lang) : String(q));

  const addLine = (from: Element, v: number, chosen: number[]) => {
    add(buildLine(p, v, chosen, step, false));
    flyToTray(from);
  };

  const photo = p.image && !failed ? p.image : null;
  const backPrice = unitPrice(p, variant, picks);

  return (
    <article className={`flip group h-full ${flipped ? "is-flipped" : ""}`}>
      <div className="flip-inner">
        {/* front: the photo and its label */}
        <div className="flip-face relative! flex h-full flex-col" aria-hidden={flipped}>
          <span aria-hidden className="absolute -top-2.5 left-1/2 z-10 h-5 w-14 -translate-x-1/2 -rotate-3 bg-butter/80 shadow-sm" />
          <div className={`relative aspect-square overflow-hidden rounded-md border-2 border-ink bg-lav-2 shadow-sticker transition-transform group-hover:-rotate-1 ${p.available ? "" : "grayscale"}`}>
            {photo ? (
              <Image src={photo.src} alt={photo.alt || text.name} fill sizes="(min-width: 1024px) 270px, (min-width: 768px) 30vw, 46vw" className="object-cover" onError={() => setFailed(true)} />
            ) : (
              <div role="img" aria-label={text.name} className="gingham grid h-full place-items-center text-6xl">
                {p.emoji}
              </div>
            )}
            {category && (
              <span className="absolute start-2 bottom-2 rounded-sm border-[1.5px] border-ink bg-cream/95 px-1.5 py-0.5 text-[0.68rem] font-bold">
                {category.emoji} {categoryName(category, lang)}
              </span>
            )}
            {p.featured && (
              <span className="absolute -end-1 -top-1 grid size-14 rotate-12 place-items-center rounded-full border-2 border-ink bg-tomato font-display text-lg text-white">
                {priced ? formatPrice(fromPrice, c) : t.bestSeller}
              </span>
            )}
            {!p.available && (
              <span className="absolute inset-0 grid place-items-center bg-cream/40">
                <span className="-rotate-12 rounded-sm border-[3px] border-tomato px-3 py-1 font-display text-2xl text-tomato">{t.unavailable}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-label={t.details}
              className="absolute start-2 top-2 grid size-8 place-items-center rounded-full border-2 border-ink bg-white text-sm font-bold"
            >
              ?
            </button>
          </div>

          <div className="mt-3 flex flex-1 flex-col">
            <h3 className="text-[0.95rem] leading-snug font-bold sm:text-base">{text.name}</h3>
            {text.note && <p className="mt-0.5 text-xs text-ink-3">{text.note}</p>}
            <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
              <span className={`pinked px-2 pt-1 pb-2 text-sm font-bold ${priced ? "bg-butter" : "bg-lav-2 text-[0.7rem] leading-tight text-lav-deep"}`}>
                {priced ? `${formatPrice(fromPrice, c)}${p.weightStep ? ` ${t.perKilo}` : ""}` : t.priceOnRequest}
              </span>

              {p.available &&
                (plainQty > 0 && !hasChoices ? (
                  <div className="flex h-9 shrink-0 items-center rounded-md border-2 border-ink bg-white shadow-sticker-sm">
                    <button type="button" aria-label={t.decrease} onClick={() => setQty(plainKey, plainQty - step)} className="grid h-full w-8 place-items-center">
                      <MinusIcon className="size-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold tabular-nums">{amount(plainQty)}</span>
                    <button
                      type="button"
                      aria-label={t.increase}
                      onClick={(e) => addLine(e.currentTarget, 0, p.options.map(() => 0))}
                      className="grid h-full w-8 place-items-center"
                    >
                      <PlusIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={`${t.add}: ${text.name}`}
                    onClick={(e) => (hasChoices ? setFlipped(true) : addLine(e.currentTarget, 0, []))}
                    className="press grid size-10 shrink-0 place-items-center rounded-md border-2 border-ink bg-ink text-cream shadow-[3px_3px_0_var(--color-tomato)]"
                  >
                    <PlusIcon className="size-5" />
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* back: the recipe card */}
        <div className="flip-face flip-back flex flex-col overflow-hidden rounded-md border-2 border-ink bg-butter-soft p-3 shadow-sticker" aria-hidden={!flipped}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg leading-tight">{text.name}</h3>
            <span className="text-2xl leading-none" aria-hidden>{p.emoji}</span>
          </div>
          <div className="no-scrollbar mt-1.5 min-h-0 flex-1 overflow-y-auto text-[0.8rem] leading-relaxed text-ink-2">
            <p>{text.description}</p>
            {text.ingredients && <p className="mt-1.5">{text.ingredients}</p>}
            {photo?.credit && (
              <a href={photo.link} target="_blank" rel="noopener noreferrer" className="mt-2 block text-[0.6rem] text-ink-3 underline-offset-2 hover:underline" tabIndex={flipped ? 0 : -1}>
                {t.photoBy}: {photo.credit}
              </a>
            )}
          </div>

          {p.variants.length > 1 && (
            <select
              aria-label={t.size}
              value={variant}
              onChange={(e) => setVariant(Number(e.target.value))}
              tabIndex={flipped ? 0 : -1}
              className="mt-2 h-9 w-full rounded-md border-2 border-ink bg-white px-2 text-sm"
            >
              {p.variants.map((v, i) => (
                <option key={i} value={i}>
                  {text.variants[i]}
                  {isPriced(v.price) ? ` · ${formatPrice(v.price, c)}` : ""}
                </option>
              ))}
            </select>
          )}
          {p.options.map((g, gi) => (
            <select
              key={gi}
              aria-label={text.options[gi]?.label}
              value={picks[gi]}
              onChange={(e) => setPicks((prev) => prev.map((x, j) => (j === gi ? Number(e.target.value) : x)))}
              tabIndex={flipped ? 0 : -1}
              className="mt-2 h-9 w-full rounded-md border-2 border-ink bg-white px-2 text-sm"
            >
              {g.options.map((o, oi) => (
                <option key={oi} value={oi}>
                  {text.options[gi]?.label}: {text.options[gi]?.options[oi]}
                </option>
              ))}
            </select>
          ))}

          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => setFlipped(false)}
              tabIndex={flipped ? 0 : -1}
              className="h-10 shrink-0 rounded-md border-2 border-ink bg-white px-2.5 text-xs font-bold"
            >
              {t.back}
            </button>
            {p.available && (
              <button
                type="button"
                tabIndex={flipped ? 0 : -1}
                onClick={(e) => {
                  addLine(e.currentTarget, variant, picks);
                  setFlipped(false);
                }}
                className="press h-10 min-w-0 flex-1 truncate rounded-md border-2 border-ink bg-tomato px-2 text-xs font-bold text-white shadow-sticker-sm sm:text-sm"
              >
                {isPriced(backPrice) ? t.addToCart(formatPrice(backPrice, c)) : t.addToCartNoPrice}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
