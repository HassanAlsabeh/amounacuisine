"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { categoryName, productText } from "@/lib/i18n";
import { buildLine, formatPrice, formatWeight, isPriced, lineKey, unitPrice } from "@/lib/order";
import type { Category, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { MinusIcon, PlusIcon } from "./Icons";

/** The customer's picks for one dish, and adding it with a rubber-stamp "✓ تمّ". */
export function useDish(p: Product) {
  const { lines, add, setQty } = useCart();
  const [variant, setVariant] = useState(0);
  const [picks, setPicks] = useState<number[]>(() => p.options.map(() => 0));
  const [stamp, setStamp] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const step = p.weightStep ?? 1;
  // the plain version (first size, default options) can be stepped right on the card
  const plainKey = lineKey(p.id, 0, p.options.map(() => 0), false);
  const plainQty = lines.find((l) => l.key === plainKey)?.qty ?? 0;

  return {
    variant,
    setVariant,
    picks,
    pick: (gi: number, oi: number) => setPicks((prev) => prev.map((x, j) => (j === gi ? oi : x))),
    hasChoices: p.variants.length > 1 || p.options.length > 0,
    inCart: lines.some((l) => l.productId === p.id),
    plainQty,
    step,
    /** Adds the current picks (or one more of the plain version) and slams the stamp down. */
    add: () => {
      add(buildLine(p, variant, picks, step, false));
      setStamp((n) => n + 1);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStamp(0), 1500);
    },
    less: () => setQty(plainKey, plainQty - step),
    stamp,
  };
}

export type Dish = ReturnType<typeof useDish>;

/** The "✓ تمّ" rubber stamp; remounted on each add so it lands again. */
export function StampHit({ dish, className = "" }: { dish: Dish; className?: string }) {
  const { t } = useI18n();
  if (!dish.stamp) return null;
  return (
    <span key={dish.stamp} aria-hidden className={`stamp-hit pointer-events-none absolute z-20 grid place-items-center ${className}`}>
      <span className="border-[3.5px] border-double border-tomato bg-paper-3/85 px-3 pt-1 font-display text-3xl whitespace-nowrap text-tomato mix-blend-multiply">
        {t.added}
      </span>
    </span>
  );
}

/** A dish photo printed in halftone in its category's ink; full colour on hover, tap, or once it's in the order. */
export function HalftonePhoto({
  product: p,
  ink,
  live,
  sizes,
  className = "",
  children,
}: {
  product: Product;
  ink: string;
  live: boolean;
  sizes: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { lang } = useI18n();
  const [failed, setFailed] = useState(false);
  const photo = p.image && !failed ? p.image : null;
  const name = productText(p, lang).name;

  return (
    <div className={`halftone overflow-hidden ${live && p.available ? "is-live" : ""} ${className}`} style={{ "--ink": ink } as React.CSSProperties}>
      {photo ? (
        <Image src={photo.src} alt={photo.alt || name} fill sizes={sizes} className="object-cover" onError={() => setFailed(true)} />
      ) : (
        <div role="img" aria-label={name} className="grid h-full place-items-center text-6xl">
          {p.emoji}
        </div>
      )}
      {children}
    </div>
  );
}

/** Size and option pickers, for dishes that have them. */
export function Choices({ product: p, dish, onInk = false }: { product: Product; dish: Dish; onInk?: boolean }) {
  const { lang, t } = useI18n();
  const { settings } = useCart();
  const text = productText(p, lang);
  const box = `mt-2 h-9 w-full border-2 bg-paper-3 px-2 text-sm font-semibold text-brown ${onInk ? "border-paper-3" : "border-brown"}`;

  return (
    <>
      {p.variants.length > 1 && (
        <select aria-label={t.size} value={dish.variant} onChange={(e) => dish.setVariant(Number(e.target.value))} className={box}>
          {p.variants.map((v, i) => (
            <option key={i} value={i}>
              {text.variants[i]}
              {isPriced(v.price) ? ` · ${formatPrice(v.price, settings.currency)}` : ""}
            </option>
          ))}
        </select>
      )}
      {p.options.map((g, gi) => (
        <select key={gi} aria-label={text.options[gi]?.label} value={dish.picks[gi]} onChange={(e) => dish.pick(gi, Number(e.target.value))} className={box}>
          {g.options.map((_, oi) => (
            <option key={oi} value={oi}>
              {text.options[gi]?.label}: {text.options[gi]?.options[oi]}
            </option>
          ))}
        </select>
      ))}
    </>
  );
}

/** Add button, or a stepper once the plain version is in the order. */
export function AddControl({ product: p, dish, onInk = false }: { product: Product; dish: Dish; onInk?: boolean }) {
  const { lang, t } = useI18n();
  const { settings } = useCart();
  const name = productText(p, lang).name;

  if (!p.available) return <span className="font-display text-xl text-tomato">{t.unavailable}</span>;

  if (dish.plainQty > 0 && !dish.hasChoices) {
    return (
      <div className={`flex h-9 shrink-0 items-center border-[2.5px] ${onInk ? "border-paper-3" : "border-brown"}`}>
        <button type="button" aria-label={t.decrease} onClick={dish.less} className="grid h-full w-8 place-items-center">
          <MinusIcon className="size-3.5" />
        </button>
        <span className="min-w-6 px-0.5 text-center font-sign text-xs">{p.weightStep ? formatWeight(dish.plainQty, lang) : dish.plainQty}</span>
        <button type="button" aria-label={t.increase} onClick={dish.add} className="grid h-full w-8 place-items-center">
          <PlusIcon className="size-3.5" />
        </button>
      </div>
    );
  }

  const price = unitPrice(p, dish.variant, dish.picks);
  return (
    <button
      type="button"
      aria-label={`${t.add}: ${name}`}
      onClick={dish.add}
      className={`flex h-9 shrink-0 items-center gap-1 px-3 text-sm font-extrabold transition-transform active:scale-90 ${onInk ? "bg-paper-3 text-brown" : "bg-brown text-paper-3 hover:bg-tomato"}`}
    >
      <PlusIcon className="size-4" />
      {dish.hasChoices && isPriced(price) ? t.addToCart(formatPrice(price, settings.currency)) : t.add}
    </button>
  );
}

/**
 * One dish on the poster wall, printed either as a perforated tin-can label stamp or as a cinema
 * ticket in its category's ink. Tapping the photo brings it to colour and shows what's inside.
 */
export function DishStamp({ product: p, category, ink, serial, look }: { product: Product; category?: Category; ink: string; serial: number; look: "stamp" | "ticket" }) {
  const { lang, t } = useI18n();
  const { settings } = useCart();
  const dish = useDish(p);
  const [peek, setPeek] = useState(false);
  const text = productText(p, lang);
  const fromPrice = Math.min(...p.variants.map((v) => v.price));
  const priced = isPriced(fromPrice);
  const onInk = look === "ticket";
  // mustard is a light ink: brown type on it, cream on the others
  const inkText = ink.includes("mustard") ? "text-brown" : "text-paper-3";
  const no = String(serial).padStart(2, "0");

  const photo = (
    <HalftonePhoto product={p} ink={ink} live={peek || dish.inCart} sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 46vw" className="aspect-[5/4]">
      <button type="button" onClick={() => setPeek((v) => !v)} aria-pressed={peek} aria-label={t.details} className="absolute inset-0 z-10 cursor-zoom-in" />
      {peek && text.description && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-brown/85 px-2.5 py-2 text-[0.72rem] leading-snug text-paper-3">{text.description}</p>
      )}
      {!p.available && (
        <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="-rotate-12 border-[3px] border-double border-tomato bg-paper-3/80 px-3 font-display text-2xl text-tomato">{t.unavailable}</span>
        </span>
      )}
      <StampHit dish={dish} className="inset-0" />
    </HalftonePhoto>
  );

  const priceTag = priced ? (
    <span className="font-sign text-[0.95rem] leading-none" dir="ltr">
      {formatPrice(fromPrice, settings.currency)}
      {p.weightStep && <span className="ms-1 font-sans text-[0.7rem] font-bold">{t.perKilo}</span>}
    </span>
  ) : (
    <span className="text-[0.7rem] leading-tight font-bold opacity-80">{t.priceOnRequest}</span>
  );

  if (look === "ticket") {
    return (
      <article className={`group relative flex h-full flex-col ${inkText}`} style={{ backgroundColor: ink }}>
        <div className="flex items-center justify-between gap-2 px-2.5 pt-2 pb-1.5 text-[0.7rem] font-extrabold">
          <span className="truncate">{category && categoryName(category, lang)}</span>
          <span className="shrink-0 font-sign" dir="ltr">
            {t.ticketNo} {no}
          </span>
        </div>
        <div className="relative mx-2 border-2 border-current">{photo}</div>
        <div className="relative mt-2.5 border-t-2 border-dashed border-current/50">
          <span aria-hidden className="absolute -start-2.5 -top-2.5 size-5 rounded-full bg-paper" />
          <span aria-hidden className="absolute -end-2.5 -top-2.5 size-5 rounded-full bg-paper" />
        </div>
        <div className="flex flex-1 flex-col px-2.5 pt-2 pb-2.5">
          <h3 className="font-display text-[1.15rem] leading-tight sm:text-xl">{text.name}</h3>
          {text.note && <p className="mt-0.5 text-xs font-semibold opacity-80">{text.note}</p>}
          {dish.hasChoices && p.available && <Choices product={p} dish={dish} onInk={onInk} />}
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            {priceTag}
            <AddControl product={p} dish={dish} onInk={onInk} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative h-full [filter:drop-shadow(0_2px_0_rgb(59_36_23/0.22))]">
      <div className="perforated flex h-full flex-col bg-paper-3">
        <div className={`flex items-center justify-between gap-2 px-2 py-1 text-[0.7rem] font-extrabold ${inkText}`} style={{ backgroundColor: ink }}>
          <span className="truncate">{category && `${category.emoji} ${categoryName(category, lang)}`}</span>
          <span className="shrink-0 font-sign" dir="ltr">{no}</span>
        </div>
        <div className="relative">{photo}</div>
        <div className="flex flex-1 flex-col px-1 pt-2.5">
          <h3 className="font-display text-[1.15rem] leading-tight text-brown sm:text-xl">{text.name}</h3>
          {text.note && <p className="mt-0.5 text-xs font-semibold text-brown-2">{text.note}</p>}
          {dish.hasChoices && p.available && <Choices product={p} dish={dish} />}
          <div className="mt-auto flex items-end justify-between gap-2 pt-3 text-brown">
            {priceTag}
            <AddControl product={p} dish={dish} />
          </div>
        </div>
      </div>
    </article>
  );
}
