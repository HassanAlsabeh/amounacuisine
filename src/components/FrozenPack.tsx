"use client";

import Image from "next/image";
import { useState } from "react";
import { flyToCheckout } from "@/lib/fly";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatPrice, formatWeight, isPriced, lineKey } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { cookingMethod, SnowflakeIcon } from "./FreezerIcons";
import { useI18n } from "./I18nProvider";
import { MinusIcon, PlusIcon } from "./Icons";

/** Brand strip printed along the top of every box. */
export function BrandStrip({ brand, small = false }: { brand: string; small?: boolean }) {
  return (
    <div className={`flex items-center justify-between bg-cherry px-2 text-white ${small ? "h-5" : "h-6"}`}>
      <span className={`font-poster uppercase ${small ? "text-[0.62rem]" : "text-[0.72rem]"}`} dir="ltr">
        {brand}
      </span>
      <SnowflakeIcon className={small ? "size-3" : "size-3.5"} />
    </div>
  );
}

/** The yellow starburst price flash. Unpriced dishes ask for the price instead. */
export function PriceFlash({ price, perKilo, className = "" }: { price: number; perKilo?: boolean; className?: string }) {
  const { t } = useI18n();
  const { settings } = useCart();
  return (
    <span className={`flash grid place-items-center bg-flash text-center text-navy ${className}`}>
      {isPriced(price) ? (
        <span className="leading-none">
          <span className="block font-poster text-[1.35em]" dir="ltr">{formatPrice(price, settings.currency)}</span>
          {perKilo && <span className="block font-display text-[0.5em] font-bold">{t.perKilo}</span>}
        </span>
      ) : (
        <span className="max-w-[70%] font-display text-[0.55em] leading-[1.15] font-extrabold">{t.flashAsk}</span>
      )}
    </span>
  );
}

/**
 * One dish as a frozen-food box standing on the freezer shelf: brand strip, photo window, name,
 * a band in the colour of its line saying how it's cooked, and a price flash. The shelf lip under it
 * holds the add button, which turns into a quantity stepper once the box is in the checkout.
 */
export function FrozenPack({ product: p, category, wide = false }: { product: Product; category?: Category; wide?: boolean }) {
  const { lang, t } = useI18n();
  const { lines, add, setQty, settings, view } = useCart();
  const [lifting, setLifting] = useState(false);
  const [failed, setFailed] = useState(false);

  const text = productText(p, lang);
  const step = p.weightStep ?? 1;
  const hasChoices = p.variants.length > 1 || p.options.length > 0;
  const fromPrice = Math.min(...p.variants.map((v) => v.price));
  const photo = p.image && !failed ? p.image : null;
  const method = cookingMethod(p.category, t);
  const lineName = category ? categoryName(category, lang) : "";

  // the plain version (first size, default options) is stepped right on the shelf
  const plainKey = lineKey(p.id, 0, p.options.map(() => 0), false);
  const plainQty = lines.find((l) => l.key === plainKey)?.qty ?? 0;

  const take = (from: Element) => {
    add(buildLine(p, 0, p.options.map(() => 0), step, false));
    setLifting(true);
    flyToCheckout(from, photo?.src ?? null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-end px-2.5 pt-7 pb-0 sm:px-4">
        <article
          style={{ "--pack": category?.color ?? "#1f7fd6" } as React.CSSProperties}
          onAnimationEnd={(e) => e.target === e.currentTarget && setLifting(false)}
          className={`box3d relative w-[calc(100%-7px)] bg-white shadow-box ${lifting ? "lift" : ""}`}
        >
          <BrandStrip brand={settings.brandLatin} />

          <button
            type="button"
            onClick={(e) => view(p, e.currentTarget)}
            aria-label={`${t.details}: ${text.name}`}
            className={`block w-full p-2 text-start ${wide ? "grid grid-cols-[1.1fr_1fr] items-center gap-3 sm:p-3" : ""}`}
          >
            <span className={`window-gloss relative block aspect-[4/3] overflow-hidden rounded-[7px] border-[3px] border-[var(--pack)] bg-frost ${p.available ? "" : "grayscale-[0.6]"}`}>
              {photo ? (
                <Image
                  src={photo.src}
                  alt={photo.alt || text.name}
                  fill
                  sizes={wide ? "(min-width: 1024px) 300px, 50vw" : "(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"}
                  className="object-cover"
                  onError={() => setFailed(true)}
                />
              ) : (
                <span className="grid h-full place-items-center text-5xl">{p.emoji}</span>
              )}
            </span>
            <span className="block">
              {wide && <span className="mb-1.5 inline-block bg-navy px-2 py-0.5 font-display text-xs font-bold text-flash">{t.dealBanner}</span>}
              <span className={`mt-2 block font-display leading-[1.12] font-extrabold ${wide ? "text-xl sm:text-3xl" : "text-[1.02rem] sm:text-lg"}`}>{text.name}</span>
              {(p.weightStep || (text.note && text.note !== lineName)) && (
                <span className="mt-1.5 inline-block border-[1.5px] border-navy px-1.5 text-[0.7rem] leading-5 font-bold">
                  {p.weightStep ? t.byWeight : text.note}
                </span>
              )}
              {wide && text.description && <span className="mt-2 hidden text-sm leading-relaxed text-navy-2 sm:block">{text.description}</span>}
            </span>
          </button>

          <div className="flex items-center gap-1.5 bg-[var(--pack)] px-2 py-1 font-display text-[0.78rem] font-bold text-white">
            <method.Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{lineName}</span>
            <span className="font-poster text-[0.72rem] opacity-90" dir="ltr">−18°</span>
          </div>

          <PriceFlash price={fromPrice} perKilo={!!p.weightStep} className={`absolute -end-3 -top-4 rotate-12 ${wide ? "size-20 text-xl sm:size-24 sm:text-2xl" : "size-16 text-base sm:size-[4.5rem]"}`} />

          {p.featured && !wide && <span className="absolute -start-1 top-8 bg-navy px-1.5 font-display text-xs font-bold text-flash">{t.deal}</span>}

          {!p.available && (
            <span className="frost absolute inset-0 grid place-items-center bg-frost/70">
              <span className="-rotate-12 border-[3px] border-cherry bg-white/80 px-3 py-0.5 font-display text-2xl font-extrabold text-cherry">{t.unavailable}</span>
            </span>
          )}
        </article>
      </div>

      {/* the shelf lip, with the price rail along its front */}
      <div className="shelf-lip mt-2 flex h-14 items-center px-2.5 sm:px-4">
        {!p.available ? (
          <span className="w-full text-center text-sm font-semibold text-navy-3">{t.unavailable}</span>
        ) : plainQty > 0 && !hasChoices ? (
          <div className="flex h-10 w-full items-center justify-between bg-navy text-white">
            <button type="button" aria-label={t.decrease} onClick={() => setQty(plainKey, plainQty - step)} className="grid h-full w-10 place-items-center hover:bg-white/10">
              <MinusIcon className="size-4" />
            </button>
            <span className="led font-poster text-lg tabular-nums" dir="ltr">
              {p.weightStep ? formatWeight(plainQty, lang) : `×${plainQty}`}
            </span>
            <button type="button" aria-label={t.increase} onClick={(e) => take(e.currentTarget)} className="grid h-full w-10 place-items-center hover:bg-white/10">
              <PlusIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={`${t.add}: ${text.name}`}
            onClick={(e) => (hasChoices ? view(p, e.currentTarget) : take(e.currentTarget))}
            className="flex h-10 w-full items-center justify-center gap-1.5 border-b-[3px] border-navy bg-white font-display text-[0.95rem] font-bold text-navy shadow-[inset_0_0_0_2px_var(--color-navy)] transition-colors hover:bg-flash active:translate-y-px"
          >
            <PlusIcon className="size-4" />
            {t.add}
          </button>
        )}
      </div>
    </div>
  );
}
