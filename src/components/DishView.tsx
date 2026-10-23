"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatDelta, formatPrice, formatWeight, isPriced, optionPrice, unitPrice } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { announceAdded, pad } from "@/lib/ui";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { CheckIcon, CloseIcon, LineArrowIcon } from "./Icons";
import { Stepper } from "./Stepper";
import { useLayer } from "./useLayer";

/** The dish, full screen: photo on one half, the details and choices on the other (stacked on phones). */
export function DishView({ list, categories }: { list: Product[]; categories: Category[] }) {
  const { viewing, view } = useCart();
  const close = useCallback(() => view(null), [view]);
  const { mounted, shown } = useLayer(!!viewing, close, 400);
  // keep showing the last dish while the layer fades out
  const [last, setLast] = useState<Product | null>(null);
  useEffect(() => {
    if (viewing) setLast(viewing);
  }, [viewing]);

  const p = viewing ?? last;
  if (!mounted || !p) return null;

  const i = list.indexOf(p);
  const stepTo = (d: number) => {
    const next = list[i + d];
    if (i >= 0 && next) view(next);
  };

  return (
    <Sheet
      key={p.id}
      product={p}
      n={i >= 0 ? i + 1 : null}
      total={list.length}
      category={categories.find((c) => c.id === p.category)}
      shown={shown}
      onClose={close}
      onStep={i >= 0 ? stepTo : null}
    />
  );
}

function Sheet({
  product: p,
  n,
  total,
  category,
  shown,
  onClose,
  onStep,
}: {
  product: Product;
  n: number | null;
  total: number;
  category?: Category;
  shown: boolean;
  onClose: () => void;
  onStep: ((d: number) => void) | null;
}) {
  const { lang, t } = useI18n();
  const { add, settings } = useCart();
  const step = p.weightStep ?? 1;
  const [variant, setVariant] = useState(0);
  const [picks, setPicks] = useState<number[]>(() => p.options.map(() => 0));
  const [qty, setQty] = useState(step);
  const [added, setAdded] = useState(false);

  const text = productText(p, lang);
  const c = settings.currency;
  const price = unitPrice(p, variant, picks);
  const priced = isPriced(price);
  const amount = p.weightStep ? formatWeight(qty, lang) : pad(qty);
  const photo = p.image;
  const canPrev = !!onStep && n !== null && n > 1;
  const canNext = !!onStep && n !== null && n < total;

  // ← → step to the neighbouring dish, in reading direction
  useEffect(() => {
    if (!onStep) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const forward = (e.key === "ArrowRight") === (lang !== "ar");
      if (forward ? canNext : canPrev) onStep(forward ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStep, lang, canNext, canPrev]);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(onClose, 700);
    return () => clearTimeout(id);
  }, [added, onClose]);

  const addIt = () => {
    add(buildLine(p, variant, picks, Math.round(qty * 1000) / 1000, false));
    announceAdded(text.name);
    setAdded(true);
  };

  const choiceRow = (on: boolean, label: string, extra: string, onPick: () => void, key: number) => (
    <button
      key={key}
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      className={`-mt-px flex min-h-13 w-full items-center gap-3 border px-4 py-3 text-start transition-colors ${on ? "relative z-10 border-saffron" : "border-line-strong hover:bg-bone/5"}`}
    >
      <span className={`grid size-4 shrink-0 place-items-center border ${on ? "border-saffron" : "border-bone-3"}`}>{on && <span className="size-2 bg-saffron" />}</span>
      <span className="flex-1 font-semibold">{label}</span>
      {extra && <span className="font-display text-sm font-bold tabular-nums text-bone-2">{extra}</span>}
    </button>
  );

  return (
    <div role="dialog" aria-modal aria-label={text.name} className={`layer-fade fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-night lg:overflow-hidden ${shown ? "is-open" : ""}`}>
      <div className="lg:grid lg:h-full lg:grid-cols-2">
        {/* the photo half */}
        <div className="grain relative h-[48svh] overflow-hidden bg-night-3 lg:h-full">
          <div className="layer-photo absolute inset-0">
            {photo ? (
              <Image src={photo.src} alt={photo.alt || text.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className={`animate-kenburns object-cover ${p.available ? "" : "grayscale"}`} />
            ) : (
              <div className="grid h-full place-items-center text-9xl">{p.emoji}</div>
            )}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(19_16_14/0.5)_0%,transparent_25%,transparent_60%,var(--color-night)_100%)] lg:bg-[linear-gradient(180deg,rgb(19_16_14/0.45)_0%,transparent_25%,transparent_70%,rgb(19_16_14/0.7)_100%)]" />
          {n !== null && (
            <p className="numeral-outline absolute start-4 bottom-2 font-display text-[7rem] leading-none font-extrabold [-webkit-text-stroke-color:rgb(244_236_225/0.6)] sm:start-8 lg:bottom-6 lg:text-[12rem]">
              <span dir="ltr">{pad(n)}</span>
            </p>
          )}
          {onStep && (
            <div className="absolute end-4 bottom-4 flex sm:end-8 lg:bottom-8">
              <button type="button" onClick={() => onStep(-1)} disabled={!canPrev} aria-label={t.prev} className="grid size-11 place-items-center border border-line-strong bg-night/50 backdrop-blur transition-colors hover:bg-bone hover:text-night disabled:opacity-30">
                <LineArrowIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
              </button>
              <button type="button" onClick={() => onStep(1)} disabled={!canNext} aria-label={t.next} className="-ms-px grid size-11 place-items-center border border-line-strong bg-night/50 backdrop-blur transition-colors hover:bg-bone hover:text-night disabled:opacity-30">
                <LineArrowIcon className="size-5 rtl:-scale-x-100" />
              </button>
            </div>
          )}
        </div>

        {/* the details half */}
        <div className="relative flex flex-col lg:h-full lg:overflow-y-auto lg:overscroll-contain">
          <div className="flex-1 px-5 pt-4 pb-8 sm:px-8 lg:flex lg:flex-col lg:justify-center lg:px-14 lg:py-24">
            <p className="flex items-center gap-3 font-display text-sm font-bold text-bone-3">
              {n !== null && (
                <span dir="ltr">
                  {pad(n)} / {pad(total)}
                </span>
              )}
              {category && (
                <>
                  <span className="h-px w-6 bg-line-strong" />
                  <span className="font-sans">{categoryName(category, lang)}</span>
                </>
              )}
              {p.featured && <span className="bg-saffron px-2 py-0.5 font-sans text-xs font-extrabold text-night">{t.bestSeller}</span>}
            </p>

            <h2 className="mt-4 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">{text.name}</h2>
            {text.note && <p className="mt-3 font-semibold text-saffron">{text.note}</p>}

            <p className="mt-6 font-display leading-none font-extrabold tabular-nums">
              {priced ? (
                <>
                  <span className="text-5xl">{formatPrice(price, c)}</span>
                  {p.weightStep && <span className="ms-2 font-sans text-sm font-medium text-bone-2">{t.perKilo}</span>}
                </>
              ) : (
                <span className="font-sans text-lg font-bold text-lav">{t.priceOnRequest}</span>
              )}
            </p>

            {text.description && <p className="mt-6 max-w-prose leading-relaxed text-bone-2">{text.description}</p>}
            {text.story && <p className="mt-4 max-w-prose leading-relaxed text-bone-2">{text.story}</p>}
            {text.ingredients && (
              <div className="mt-6 border-t border-line pt-4">
                <h3 className="text-xs font-bold text-bone-3">{t.ingredients}</h3>
                <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-bone-2">{text.ingredients}</p>
              </div>
            )}

            {p.variants.length > 1 && (
              <div role="radiogroup" aria-label={t.size} className="mt-8">
                <h3 className="mb-3 text-xs font-bold text-bone-3">{t.size}</h3>
                {p.variants.map((v, vi) => choiceRow(vi === variant, text.variants[vi], isPriced(v.price) ? formatPrice(v.price, c) : "", () => setVariant(vi), vi))}
              </div>
            )}

            {p.options.map((g, gi) => (
              <div key={gi} role="radiogroup" aria-label={text.options[gi]?.label} className="mt-8">
                <h3 className="mb-3 text-xs font-bold text-bone-3">{text.options[gi]?.label}</h3>
                {g.options.map((o, oi) => {
                  const delta = optionPrice(o.prices, variant);
                  return choiceRow(
                    picks[gi] === oi,
                    text.options[gi]?.options[oi] ?? "",
                    delta ? formatDelta(delta, c) : "",
                    () => setPicks((prev) => prev.map((x, j) => (j === gi ? oi : x))),
                    oi,
                  );
                })}
              </div>
            ))}

            {p.available && (
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
                <span className="text-sm font-bold text-bone-2">{t.quantity}</span>
                <Stepper label={amount} canDecrease={qty > step} onDecrease={() => setQty((q) => Math.max(step, q - step))} onIncrease={() => setQty((q) => q + step)} />
              </div>
            )}

            {photo?.credit && (
              <a href={photo.link} target="_blank" rel="noopener noreferrer" className="mt-8 block text-[0.7rem] text-bone-3 hover:text-bone-2">
                {t.photoBy}: {photo.credit}
              </a>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-line bg-night/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-8 lg:px-14 lg:py-6">
            <button
              type="button"
              onClick={addIt}
              disabled={!p.available || added}
              className={`flex h-14 w-full items-center justify-between gap-3 px-5 font-bold transition-colors disabled:cursor-default ${
                !p.available ? "border border-lav/50 text-lav" : added ? "bg-bone text-night" : "bg-saffron text-night hover:bg-bone"
              }`}
            >
              {!p.available ? (
                <span className="mx-auto">{t.unavailable}</span>
              ) : added ? (
                <span className="mx-auto flex items-center gap-2">
                  <CheckIcon className="animate-bump size-5" />
                  {t.added}
                </span>
              ) : (
                <>
                  <span>{t.addToOrder}</span>
                  {priced && <span className="font-display text-lg font-extrabold tabular-nums">{formatPrice(price * qty, c)}</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={t.close}
        className="fixed end-4 top-4 z-10 grid size-12 place-items-center border border-line-strong bg-night/60 backdrop-blur-md transition-colors hover:bg-bone hover:text-night sm:end-6 sm:top-6"
      >
        <CloseIcon className="size-5" />
      </button>
    </div>
  );
}
