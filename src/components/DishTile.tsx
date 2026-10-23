"use client";

import Image from "next/image";
import { useState } from "react";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatDelta, formatPrice, formatWeight, isPriced, lineKey, optionPrice, unitPrice } from "@/lib/order";
import { packIntoBox } from "@/lib/pack";
import type { Tone } from "@/lib/tones";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { CloseIcon, MinusIcon, PlusIcon } from "./Icons";

/** How many grid cells a dish takes: the deal is a big compartment, a few others run wide. */
export type TileSize = "one" | "wide" | "big";

const SPAN: Record<TileSize, string> = {
  one: "",
  wide: "col-span-2",
  big: "col-span-2 md:row-span-2",
};

/** A dish in its compartment. "What's inside?" lifts the compartment's cover: details and choices. */
export function DishTile({ product: p, size, category, tone, delay }: { product: Product; size: TileSize; category?: Category; tone: Tone; delay: number }) {
  const { lang, t } = useI18n();
  const { lines, add, setQty, settings } = useCart();
  const [peek, setPeek] = useState(false);
  const [variant, setVariant] = useState(0);
  const [picks, setPicks] = useState<number[]>(() => p.options.map(() => 0));
  const [failed, setFailed] = useState(false);

  const text = productText(p, lang);
  const c = settings.currency;
  const step = p.weightStep ?? 1;
  const hasChoices = p.variants.length > 1 || p.options.length > 0;
  const fromPrice = Math.min(...p.variants.map((v) => v.price));
  const priced = isPriced(fromPrice);
  const photo = p.image && !failed ? p.image : null;

  // the plain version (first size, default options) is stepped right on the tile
  const plainKey = lineKey(
    p.id,
    0,
    p.options.map(() => 0),
    false,
  );
  const plainQty = lines.find((l) => l.key === plainKey)?.qty ?? 0;
  const packedQty = lines.filter((l) => l.productId === p.id).reduce((s, l) => s + l.qty, 0);
  const amount = (q: number) => (p.weightStep ? formatWeight(q, lang) : `×${q}`);

  const pack = (from: Element, v: number, chosen: number[]) => {
    add(buildLine(p, v, chosen, step, false));
    packIntoBox(from, photo?.src ?? null);
  };

  const horizontal = size === "wide";
  const big = size === "big";

  return (
    <article className={`drop-in relative flex overflow-hidden ${SPAN[size]} ${horizontal ? "flex-row" : "flex-col"} ${p.featured ? "bg-apri" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      {/* the photo */}
      <div
        className={`relative shrink-0 overflow-hidden ${tone.bg} ${horizontal ? "w-[46%] self-stretch" : big ? "aspect-[16/10] md:aspect-auto md:min-h-64 md:flex-1" : "aspect-[4/3]"} ${p.available ? "" : "grayscale"}`}
      >
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt || text.name}
            fill
            sizes={big || horizontal ? "(min-width: 768px) 560px, 100vw" : "(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"}
            className="object-cover transition-transform duration-500 hover:scale-[1.04]"
            onError={() => setFailed(true)}
          />
        ) : (
          <span role="img" aria-label={text.name} className="grid h-full min-h-32 place-items-center text-6xl">
            {p.emoji}
          </span>
        )}

        {category && (
          <span className={`absolute start-2 top-2 flex items-center gap-1.5 rounded-[3px] border border-line/80 px-1.5 py-0.5 text-[0.68rem] font-semibold ${tone.bg}`}>
            <span aria-hidden className={`size-1.5 rounded-[1px] ${tone.swatch}`} />
            {categoryName(category, lang)}
          </span>
        )}

        {packedQty > 0 && (
          <span key={packedQty} className="animate-stamp absolute end-2 bottom-2 rounded-[3px] bg-ink px-2 py-1 font-display text-xs font-semibold text-box">
            {amount(packedQty)} {t.inBox}
          </span>
        )}

        {!p.available && (
          <span className="absolute inset-0 grid place-items-center bg-box/40">
            <span className="rounded-[3px] bg-ink px-3 py-1 font-display text-lg font-bold text-box">{t.unavailable}</span>
          </span>
        )}
      </div>

      {/* the label */}
      <div className={`flex min-w-0 flex-1 flex-col ${big ? "p-4 sm:p-6" : "p-3 sm:p-4"} ${big ? "md:flex-none" : ""}`}>
        <h3 className={`font-display leading-snug font-bold ${big ? "text-xl sm:text-2xl" : "text-[0.95rem] sm:text-base"}`}>{text.name}</h3>
        {text.note && <p className="mt-0.5 text-xs text-ink-2">{text.note}</p>}
        {(big || horizontal) && text.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">{text.description}</p>}
        <button type="button" onClick={() => setPeek(true)} className="mt-1.5 self-start text-xs font-medium text-ink-2 underline decoration-ink-3/60 underline-offset-4 hover:text-ink">
          {t.details}
        </button>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
          <span className={priced ? "font-display text-lg leading-none font-bold" : `text-[0.72rem] leading-tight font-semibold ${tone.deep}`}>
            {priced ? formatPrice(fromPrice, c) : t.priceOnRequest}
            {priced && p.weightStep && <span className="ms-1 font-sans text-xs font-normal text-ink-2">{t.perKilo}</span>}
          </span>

          {p.available &&
            (plainQty > 0 && !hasChoices ? (
              <div className="flex h-9 shrink-0 items-center rounded-cell border border-line bg-box">
                <button type="button" aria-label={t.decrease} onClick={() => setQty(plainKey, plainQty - step)} className="grid h-full w-8 place-items-center hover:bg-apri">
                  <MinusIcon className="size-3.5" />
                </button>
                <span className="min-w-7 border-x border-line/20 text-center font-display text-sm font-semibold tabular-nums">{p.weightStep ? formatWeight(plainQty, lang) : plainQty}</span>
                <button
                  type="button"
                  aria-label={t.increase}
                  onClick={(e) =>
                    pack(
                      e.currentTarget,
                      0,
                      p.options.map(() => 0),
                    )
                  }
                  className="grid h-full w-8 place-items-center hover:bg-pista"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label={`${t.add}: ${text.name}`}
                onClick={(e) => (hasChoices ? setPeek(true) : pack(e.currentTarget, 0, []))}
                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-cell bg-ink ps-2.5 pe-3 font-display text-sm font-semibold text-box transition-transform hover:bg-ink-2 active:scale-95"
              >
                <PlusIcon className="size-4" />
                {t.add}
              </button>
            ))}
        </div>
      </div>

      {peek && (
        <Peek
          product={p}
          variant={variant}
          picks={picks}
          onVariant={setVariant}
          onPick={(gi, oi) => setPicks((prev) => prev.map((x, j) => (j === gi ? oi : x)))}
          onPack={(from) => {
            pack(from, variant, picks);
            setPeek(false);
          }}
          onClose={() => setPeek(false)}
          price={unitPrice(p, variant, picks)}
        />
      )}
    </article>
  );
}

/** The compartment's cover lifted: what's in the dish, its sizes and options, and a button to pack it. */
function Peek({
  product: p,
  variant,
  picks,
  price,
  onVariant,
  onPick,
  onPack,
  onClose,
}: {
  product: Product;
  variant: number;
  picks: number[];
  price: number;
  onVariant: (v: number) => void;
  onPick: (group: number, option: number) => void;
  onPack: (from: Element) => void;
  onClose: () => void;
}) {
  const { lang, t } = useI18n();
  const { settings } = useCart();
  const text = productText(p, lang);
  const c = settings.currency;

  const choice = (on: boolean) => `rounded-[3px] border px-2.5 py-1.5 text-xs font-semibold transition-colors ${on ? "border-ink bg-ink text-box" : "border-line/30 bg-box hover:border-ink"}`;

  return (
    <div role="dialog" aria-label={text.name} className="peek-in absolute inset-0 z-10 flex flex-col bg-butter">
      <div className="flex items-start gap-2 border-b border-line px-3 py-2.5">
        <h4 className="min-w-0 flex-1 font-display text-sm leading-snug font-bold">{text.name}</h4>
        <button type="button" onClick={onClose} aria-label={t.back} className="-m-1 grid size-8 shrink-0 place-items-center rounded-[3px] hover:bg-box" autoFocus>
          <CloseIcon className="size-4" />
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-2.5 text-[0.8rem] leading-relaxed text-ink-2">
        {text.description && <p>{text.description}</p>}
        {text.ingredients && <p className="mt-1.5">{text.ingredients}</p>}

        {p.variants.length > 1 && (
          <fieldset className="mt-3">
            <legend className="mb-1.5 text-xs font-bold text-ink">{t.size}</legend>
            <div className="flex flex-wrap gap-1.5">
              {p.variants.map((v, i) => (
                <button key={i} type="button" aria-pressed={variant === i} onClick={() => onVariant(i)} className={choice(variant === i)}>
                  {text.variants[i]}
                  {isPriced(v.price) && <span className="ms-1 opacity-70">{formatPrice(v.price, c)}</span>}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {p.options.map((g, gi) => (
          <fieldset key={gi} className="mt-3">
            <legend className="mb-1.5 text-xs font-bold text-ink">{text.options[gi]?.label}</legend>
            <div className="flex flex-wrap gap-1.5">
              {g.options.map((o, oi) => {
                const extra = optionPrice(o.prices, variant);
                return (
                  <button key={oi} type="button" aria-pressed={picks[gi] === oi} onClick={() => onPick(gi, oi)} className={choice(picks[gi] === oi)}>
                    {text.options[gi]?.options[oi]}
                    {extra !== 0 && <span className="ms-1 opacity-70">{formatDelta(extra, c)}</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        {p.image?.credit && (
          <a href={p.image.link} target="_blank" rel="noopener noreferrer" className="mt-3 block text-[0.62rem] text-ink-3 hover:underline">
            {t.photoBy}: {p.image.credit}
          </a>
        )}
      </div>

      {p.available && (
        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={(e) => onPack(e.currentTarget)}
            className="flex h-10 w-full items-center justify-center gap-1.5 truncate rounded-cell bg-ink px-2 font-display text-sm font-semibold text-box hover:bg-ink-2 active:scale-[0.98]"
          >
            <PlusIcon className="size-4 shrink-0" />
            {isPriced(price) ? t.addToCart(formatPrice(price, c)) : t.addToCartNoPrice}
          </button>
        </div>
      )}
    </div>
  );
}
