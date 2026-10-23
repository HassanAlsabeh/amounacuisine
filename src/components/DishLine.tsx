"use client";

import Image from "next/image";
import { useState } from "react";
import { chalkDust } from "@/lib/dust";
import { productText } from "@/lib/i18n";
import { buildLine, formatPrice, formatWeight, isPriced, lineKey, unitPrice } from "@/lib/order";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { ChalkCircle, ChalkStrike, StarDoodle, Tally } from "./Chalk";
import { useI18n } from "./I18nProvider";
import { MinusIcon, PlusIcon } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Past this many, tally marks get hard to count: the number is chalked instead. */
const MAX_TALLY = 15;

/**
 * One dish chalked on the board: photo, name, dotted leader, price, and a "+".
 * Once it's on the order the name gets circled and tallied. Tapping the dish opens it up:
 * the photo pops out, with what's in it and any sizes or options to pick.
 */
export function DishLine({ product: p }: { product: Product }) {
  const { lang, t } = useI18n();
  const { lines, add, setQty, settings } = useCart();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState(0);
  const [picks, setPicks] = useState<number[]>(() => p.options.map(() => 0));
  const [failed, setFailed] = useState(false);

  const text = productText(p, lang);
  const c = settings.currency;
  const step = p.weightStep ?? 1;
  const defaults = p.options.map(() => 0);
  const hasChoices = p.variants.length > 1 || p.options.length > 0;
  const fromPrice = Math.min(...p.variants.map((v) => v.price));
  const photo = p.image && !failed ? p.image : null;
  const detailsId = `dish-${p.id}-details`;

  // everything of this dish on the order, whatever size or options
  const count = Math.round(lines.filter((l) => l.productId === p.id).reduce((s, l) => s + l.qty, 0) * 1000) / 1000;
  const plainKey = lineKey(p.id, 0, defaults, false);
  const plainQty = lines.find((l) => l.key === plainKey)?.qty ?? 0;
  const amount = (q: number) => (p.weightStep ? formatWeight(q, lang) : String(q));

  const addLine = (from: Element, v: number, chosen: number[]) => {
    add(buildLine(p, v, chosen, step, false));
    chalkDust(from);
  };

  const pickedPrice = unitPrice(p, variant, picks);

  return (
    <li id={`dish-${p.id}`} className="dish relative">
      {/* hovering the line lifts the photo off the board */}
      {photo && (
        <span aria-hidden className="peek pointer-events-none absolute start-0 bottom-[calc(100%-1.5rem)] z-20 block size-36 overflow-hidden rounded-full border-[3px] border-chalk bg-slate-3 shadow-[0_14px_30px_rgba(0,0,0,0.55)]">
          <Image src={photo.src} alt="" fill sizes="144px" className="object-cover" />
        </span>
      )}

      <div className={`flex items-start gap-3 py-3 ${p.available ? "" : "opacity-55"}`}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={`${t.details} ${text.name}`}
          className="relative mt-0.5 size-12 shrink-0 overflow-hidden rounded-full border-2 border-chalk/70 bg-slate-3 transition-transform hover:scale-105"
        >
          {photo ? (
            <Image src={photo.src} alt="" fill sizes="48px" className={`object-cover ${p.available ? "" : "grayscale"}`} onError={() => setFailed(true)} />
          ) : (
            <span className="grid h-full place-items-center text-xl">{p.emoji}</span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={detailsId}
              className="chalk relative min-w-0 text-start font-chalk text-[calc(1.3rem*var(--cs))] leading-snug font-medium hover:text-chalk-yellow"
            >
              {p.featured && <StarDoodle className="me-1 inline-block size-5 align-[-0.15em] text-chalk-yellow" />}
              {text.name}
              {count > 0 && <ChalkCircle className="chalky pointer-events-none absolute -inset-x-3 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1.5rem)] text-chalk-pink" />}
              {!p.available && <ChalkStrike className="pointer-events-none absolute inset-x-0 top-[55%] h-2 w-full text-chalk-pink" />}
            </button>
            <span aria-hidden className="min-w-5 flex-1 -translate-y-1 border-b-[3px] border-dotted border-chalk/30" />
            <span className="chalk shrink-0 font-chalk whitespace-nowrap">
              {isPriced(fromPrice) ? (
                <span className="text-[calc(1.35rem*var(--cs))] font-semibold text-chalk-yellow">
                  {formatPrice(fromPrice, c)}
                  {p.weightStep && <span className="text-[0.7em] text-chalk/60"> / {t.perKilo}</span>}
                </span>
              ) : (
                // the board's legend explains the mark; the full words are kept for screen readers
                <span className="inline-flex translate-y-0.5 text-chalk-lav" title={t.priceOnRequest}>
                  <WhatsAppIcon className="size-[1.15rem]" />
                  <span className="sr-only">{t.priceOnRequest}</span>
                </span>
              )}
            </span>
          </div>

          <div className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-chalk/55">
            {text.note && <span>{text.note}</span>}
            {count > 0 && (
              <span className="flex items-center gap-2 text-chalk-pink">
                <span className="sr-only">{t.inOrder(amount(count))}</span>
                {p.weightStep || count > MAX_TALLY ? (
                  <span aria-hidden className="chalk font-chalk text-[calc(1.1rem*var(--cs))]">{amount(count)}</span>
                ) : (
                  <Tally count={count} className="chalky" />
                )}
                {plainQty > 0 && !hasChoices && (
                  <button
                    type="button"
                    aria-label={`${t.decrease}: ${text.name}`}
                    onClick={() => setQty(plainKey, plainQty - step)}
                    className="grid size-7 place-items-center text-chalk/70 hover:text-chalk"
                  >
                    <MinusIcon className="size-4" />
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {p.available ? (
          <button
            type="button"
            aria-label={`${t.add}: ${text.name}`}
            onClick={(e) => (hasChoices ? setOpen(true) : addLine(e.currentTarget, 0, defaults))}
            className="chalk-box grid size-11 shrink-0 place-items-center text-chalk transition-transform hover:-rotate-6 hover:text-chalk-yellow active:scale-90"
          >
            <PlusIcon className="chalky size-5" />
          </button>
        ) : (
          <span className="chalk mt-1 shrink-0 -rotate-6 font-chalk text-[calc(1.2rem*var(--cs))] text-chalk-pink">{t.unavailable}</span>
        )}
      </div>

      <div id={detailsId} className={`grid transition-[grid-template-rows] duration-400 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          {open && (
            <div className="flex gap-4 ps-1 pe-1 pb-5 sm:ps-[3.75rem]">
              {photo && (
                <span className="pop-in relative size-28 shrink-0 overflow-hidden rounded-full border-[3px] border-chalk/90 bg-slate-3 shadow-[0_10px_24px_rgba(0,0,0,0.45)] sm:size-36">
                  <Image src={photo.src} alt={photo.alt || text.name} fill sizes="144px" className="object-cover" />
                </span>
              )}
              <div className="fade-in min-w-0 flex-1">
                {text.description && <p className="text-sm leading-relaxed text-chalk/80">{text.description}</p>}
                {text.ingredients && <p className="mt-1.5 text-sm leading-relaxed text-chalk/60">{text.ingredients}</p>}

                {p.variants.length > 1 && (
                  <Choice
                    label={t.size}
                    options={p.variants.map((v, i) => `${text.variants[i]}${isPriced(v.price) ? ` · ${formatPrice(v.price, c)}` : ""}`)}
                    value={variant}
                    onChange={setVariant}
                  />
                )}
                {p.options.map((g, gi) => (
                  <Choice
                    key={gi}
                    label={text.options[gi]?.label ?? ""}
                    options={g.options.map((_, oi) => text.options[gi]?.options[oi] ?? "")}
                    value={picks[gi]}
                    onChange={(v) => setPicks((prev) => prev.map((x, j) => (j === gi ? v : x)))}
                  />
                ))}

                {p.available && (
                  <button
                    type="button"
                    onClick={(e) => addLine(e.currentTarget, variant, picks)}
                    className="chalk-box chalk mt-3 inline-flex min-h-11 items-center gap-2 px-4 py-1 font-chalk text-[calc(1.15rem*var(--cs))] text-chalk-yellow transition-transform hover:-rotate-1 active:scale-95"
                  >
                    <PlusIcon className="size-4" />
                    {isPriced(pickedPrice) ? t.addToCart(formatPrice(pickedPrice, c)) : t.addToCartNoPrice}
                  </button>
                )}
                {photo?.credit && (
                  <a href={photo.link} target="_blank" rel="noopener noreferrer" className="mt-3 block text-[0.65rem] text-chalk/35 underline-offset-2 hover:underline">
                    {t.photoBy}: {photo.credit}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** A size or option group, chalked as words: the picked one gets a ring around it. */
function Choice({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (v: number) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="text-xs text-chalk/50">{label}:</span>
      {options.map((o, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={i === value}
          onClick={() => onChange(i)}
          className={`chalk relative min-h-9 px-1 font-chalk text-[calc(1.05rem*var(--cs))] ${i === value ? "text-chalk-yellow" : "text-chalk/70 hover:text-chalk"}`}
        >
          {o}
          {i === value && <ChalkCircle className="pointer-events-none absolute -inset-x-2 inset-y-0 h-full w-[calc(100%+1rem)]" />}
        </button>
      ))}
    </div>
  );
}
