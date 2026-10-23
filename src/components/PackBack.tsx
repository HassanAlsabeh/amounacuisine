"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { flyToCheckout } from "@/lib/fly";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatDelta, formatPrice, formatWeight, isPriced, optionPrice, unitPrice } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { Barcode, cookingMethod, SnowflakeIcon } from "./FreezerIcons";
import { BrandStrip, PriceFlash } from "./FrozenPack";
import { useI18n } from "./I18nProvider";
import { CloseIcon, MinusIcon, PlusIcon } from "./Icons";

/** The box turned over: what's in it, how to cook it, and the tick boxes for its sizes and options. */
export function PackBack({ categories }: { categories: Category[] }) {
  const { viewing, view } = useCart();

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && view(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing, view]);

  if (!viewing) return null;
  // keyed, so the picks start fresh for every box
  return <Back key={viewing.id} product={viewing} category={categories.find((c) => c.id === viewing.category)} onClose={() => view(null)} />;
}

function Back({ product: p, category, onClose }: { product: Product; category?: Category; onClose: () => void }) {
  const { lang, t } = useI18n();
  const { add, settings } = useCart();
  const [variant, setVariant] = useState(0);
  const [picks, setPicks] = useState<number[]>(() => p.options.map(() => 0));
  const step = p.weightStep ?? 1;
  const [qty, setQty] = useState(step);
  const panel = useRef<HTMLDivElement>(null);

  const text = productText(p, lang);
  const c = settings.currency;
  const method = cookingMethod(p.category, t);
  const price = unitPrice(p, variant, picks);
  const amount = (q: number) => (p.weightStep ? formatWeight(q, lang) : String(q));

  useEffect(() => {
    panel.current?.focus();
  }, []);

  const tick = (on: boolean) => `grid size-5 shrink-0 place-items-center border-2 border-navy ${on ? "bg-navy text-flash" : "bg-white"}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center sm:p-6" role="dialog" aria-modal aria-label={text.name}>
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-[3px]" onClick={onClose} />

      <div
        ref={panel}
        tabIndex={-1}
        style={{ "--pack": category?.color ?? "#1f7fd6" } as React.CSSProperties}
        className="turn-in relative flex max-h-[92dvh] w-full max-w-lg flex-col bg-white outline-none sm:max-h-[88dvh]"
      >
        <BrandStrip brand={settings.brandLatin} />
        <div className="flex items-start gap-3 border-b-[6px] border-navy px-4 pt-3 pb-3">
          <div className="min-w-0 flex-1">
            {category && (
              <p className="inline-flex items-center gap-1.5 bg-[var(--pack)] px-2 py-0.5 font-display text-xs font-bold text-white">
                <method.Icon className="size-3.5" />
                {categoryName(category, lang)}
              </p>
            )}
            <h2 className="mt-1.5 font-display text-2xl leading-tight font-extrabold sm:text-3xl">{text.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="grid size-10 shrink-0 place-items-center bg-navy text-white hover:bg-cherry">
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-5">
          <div className="relative">
            <div className="window-gloss relative aspect-[16/9] overflow-hidden rounded-[8px] border-[3px] border-[var(--pack)] bg-frost">
              {p.image ? (
                <Image src={p.image.src} alt={p.image.alt || text.name} fill sizes="(min-width: 640px) 480px, 100vw" className={`object-cover ${p.available ? "" : "grayscale-[0.6]"}`} />
              ) : (
                <span className="grid h-full place-items-center text-7xl">{p.emoji}</span>
              )}
            </div>
            <PriceFlash price={price} perKilo={!!p.weightStep} className="absolute -end-2 -top-3 size-20 rotate-12 text-xl" />
          </div>

          {text.description && <p className="mt-4 leading-relaxed text-navy-2">{text.description}</p>}
          {text.story && <p className="mt-2 text-sm leading-relaxed text-navy-2">{text.story}</p>}
          {text.ingredients && (
            <p className="mt-3 border-2 border-navy p-2.5 text-sm leading-relaxed">
              <b className="font-display">{t.ingredients}: </b>
              {text.ingredients}
            </p>
          )}

          {/* the instructions panel printed on every box */}
          <div className="mt-3 flex gap-3 bg-frost p-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-navy bg-white">
              <method.Icon className="size-7" />
            </span>
            <div className="min-w-0">
              <p className="font-display font-extrabold">{t.prepTitle}</p>
              <p className="text-sm leading-relaxed text-navy-2">{method.text}</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-bold text-blue">
                <SnowflakeIcon className="size-3.5" />
                {t.keepFrozen} <span dir="ltr">−18°C</span>
              </p>
            </div>
          </div>

          {p.variants.length > 1 && (
            <fieldset className="mt-4">
              <legend className="font-display font-extrabold">{t.size}</legend>
              <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {p.variants.map((v, i) => (
                  <label key={i} className={`flex cursor-pointer items-center gap-2.5 border-2 px-2.5 py-2 text-sm font-semibold ${variant === i ? "border-navy bg-flash-soft" : "border-navy/25"}`}>
                    <input type="radio" name="variant" checked={variant === i} onChange={() => setVariant(i)} className="sr-only" />
                    <span className={tick(variant === i)}>{variant === i && "✓"}</span>
                    <span className="flex-1">{text.variants[i]}</span>
                    {isPriced(v.price) && <span className="font-poster" dir="ltr">{formatPrice(v.price, c)}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {p.options.map((g, gi) => (
            <fieldset key={gi} className="mt-4">
              <legend className="font-display font-extrabold">{text.options[gi]?.label}</legend>
              <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {g.options.map((o, oi) => {
                  const on = picks[gi] === oi;
                  const extra = optionPrice(o.prices, variant);
                  return (
                    <label key={oi} className={`flex cursor-pointer items-center gap-2.5 border-2 px-2.5 py-2 text-sm font-semibold ${on ? "border-navy bg-flash-soft" : "border-navy/25"}`}>
                      <input
                        type="radio"
                        name={`option-${gi}`}
                        checked={on}
                        onChange={() => setPicks((prev) => prev.map((x, j) => (j === gi ? oi : x)))}
                        className="sr-only"
                      />
                      <span className={tick(on)}>{on && "✓"}</span>
                      <span className="flex-1">{text.options[gi]?.options[oi]}</span>
                      {extra !== 0 && <span className="font-poster text-xs" dir="ltr">{formatDelta(extra, c)}</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="mt-5 flex items-end justify-between gap-4">
            {p.image?.credit ? (
              <a href={p.image.link} target="_blank" rel="noopener noreferrer" className="text-[0.68rem] text-navy-3 hover:underline">
                {t.photoBy}: {p.image.credit}
              </a>
            ) : (
              <span />
            )}
            <Barcode digits={settings.whatsappNumber} className="h-9 w-28 shrink-0 text-navy" />
          </div>
        </div>

        {p.available && (
          <div className="flex gap-2 border-t-2 border-navy bg-ice p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex h-12 shrink-0 items-center border-2 border-navy bg-white">
              <button type="button" aria-label={t.decrease} onClick={() => setQty((q) => Math.max(step, Math.round((q - step) * 1000) / 1000))} className="grid h-full w-10 place-items-center">
                <MinusIcon className="size-4" />
              </button>
              <span className="min-w-9 text-center font-poster text-lg tabular-nums" dir="ltr">
                {amount(qty)}
              </span>
              <button type="button" aria-label={t.increase} onClick={() => setQty((q) => Math.round((q + step) * 1000) / 1000)} className="grid h-full w-10 place-items-center">
                <PlusIcon className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                add(buildLine(p, variant, picks, qty, false));
                flyToCheckout(e.currentTarget, p.image?.src ?? null);
                onClose();
              }}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 truncate border-b-4 border-cherry-deep bg-cherry px-3 font-display text-base font-bold text-white active:translate-y-0.5"
            >
              <PlusIcon className="size-4 shrink-0" />
              {isPriced(price) ? t.addToCart(formatPrice(price * qty, c)) : t.addToCartNoPrice}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
