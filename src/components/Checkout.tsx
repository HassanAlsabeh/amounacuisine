"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { buildWhatsAppMessage, formatPrice, formatWeight, isPriced, whatsappUrl } from "@/lib/order";
import type { CartLine, Category, Customer, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { RegisterIcon } from "./FreezerIcons";
import { BrandStrip } from "./FrozenPack";
import { useI18n } from "./I18nProvider";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The checkout lane: it opens out of the button that was tapped, over the whole screen. */
export function Checkout({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { isOpen, close } = useCart();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const id = setTimeout(() => setMounted(false), 600);
    return () => clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!mounted) return null;
  return <Lane products={products} categories={categories} shown={shown} onClose={close} />;
}

function Lane({ products, categories, shown, onClose }: { products: Product[]; categories: Category[]; shown: boolean; onClose: () => void }) {
  const { lines, customer, setCustomer, totals, settings, clear, origin } = useCart();
  const { t } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const c = settings.currency;
  const empty = lines.length === 0;
  const allUnpriced = totals.unpricedLines === lines.length;
  // the belt runs while the boxes roll in, then stops at the scanner
  const [rolling, setRolling] = useState(!empty);

  useEffect(() => {
    panel.current?.focus();
    const id = setTimeout(() => setRolling(false), 1000 + lines.length * 110);
    return () => clearTimeout(id);
    // only when the lane opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = () => {
    const text = buildWhatsAppMessage(lines, customer, settings);
    window.open(whatsappUrl(settings.whatsappNumber, text), "_blank", "noopener,noreferrer");
  };

  const field = (key: keyof Customer, label: string, placeholder: string, multiline = false) => {
    const common = {
      value: customer[key],
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer({ ...customer, [key]: e.target.value }),
      className: "mt-1 block w-full border-2 border-navy/30 bg-white px-3 text-base outline-none placeholder:text-navy-3 focus:border-navy",
    };
    return (
      <label className="block">
        <span className="font-display text-sm font-bold">{label}</span>
        {multiline ? (
          <textarea rows={2} {...common} className={`${common.className} resize-none py-2`} />
        ) : (
          <input {...common} autoComplete={key === "name" ? "name" : key === "address" ? "street-address" : "off"} className={`${common.className} h-12`} />
        )}
      </label>
    );
  };

  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-modal
      aria-label={t.cartTitle}
      style={{ "--ox": `${origin.x}px`, "--oy": `${origin.y}px` } as React.CSSProperties}
      className={`lane fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ice outline-none ${shown ? "is-open" : ""}`}
    >
      {/* the lane's lit sign */}
      <div className="sticky top-0 z-20 border-b-4 border-cherry bg-navy text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <span className="grid size-10 shrink-0 place-items-center bg-cherry shadow-[0_0_18px_rgba(224,24,47,0.8)]">
            <RegisterIcon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl leading-none font-extrabold sm:text-2xl">
              {t.cartTitle} <span className="text-flash">· {t.laneSign}</span>
            </h2>
            <p className="mt-1 truncate text-xs text-sky">{empty ? t.emptyCartHint : t.cartHint}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="grid size-10 shrink-0 place-items-center border-2 border-white/40 hover:border-white">
            <CloseIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* the conveyor belt */}
      <div className="border-b-4 border-navy bg-[#d5dfe9] pt-5 pb-3">
        <div className="steel mx-auto h-2 max-w-6xl" />
        <div className="mx-auto flex max-w-6xl items-stretch">
          <Scanner />
          <div className={`belt no-scrollbar relative min-w-0 flex-1 overflow-x-auto ${rolling ? "is-rolling" : ""}`}>
            <ul className="flex min-h-[19rem] sm:min-h-[21.5rem] w-max items-end gap-3 px-3 py-4 sm:gap-4 sm:px-4">
              {lines.map((l, i) => (
                <li key={l.key} className="belt-item" style={{ animationDelay: `${i * 110}ms` }}>
                  <BeltBox line={l} products={products} categories={categories} />
                </li>
              ))}
              {/* the "next customer" bar laid across the belt */}
              <li className="belt-item flex h-[17rem] w-9 sm:h-[19.5rem] items-center justify-center bg-cherry text-white" style={{ animationDelay: `${lines.length * 110}ms` }} aria-hidden>
                <span className="font-display text-xs font-bold whitespace-nowrap [writing-mode:vertical-rl]">{t.nextCustomer}</span>
              </li>
            </ul>
            {empty && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div>
                  <p className="font-display text-2xl font-extrabold text-white">{t.emptyCart}</p>
                  <button type="button" onClick={onClose} className="mt-4 h-11 border-b-4 border-cherry-deep bg-cherry px-5 font-display font-bold text-white">
                    {t.backToAisle}
                  </button>
                </div>
              </div>
            )}
          </div>
          <span aria-hidden className="roller w-5 shrink-0 rounded-full sm:w-7" />
        </div>
        <div className="steel mx-auto h-2 max-w-6xl" />
        {!empty && (
          <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between px-4 text-sm">
            <span className="font-display font-bold">{t.beltCount(totals.units)}</span>
            <button type="button" onClick={clear} className="flex items-center gap-1 font-semibold text-navy-2 hover:text-cherry">
              <TrashIcon className="size-4" />
              {t.clearCart}
            </button>
          </div>
        )}
      </div>

      {!empty && (
        <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 pb-10 md:grid-cols-[1.2fr_1fr] md:gap-8">
          <div className="border-2 border-navy bg-white">
            <p className="bg-navy px-4 py-2 font-display text-lg font-extrabold text-white">{t.slipTitle}</p>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {field("name", t.name, t.namePlaceholder)}
              {field("address", t.address, t.addressPlaceholder)}
              <div className="sm:col-span-2">{field("notes", t.notes, t.notesPlaceholder, true)}</div>
            </div>
          </div>

          <div className="md:sticky md:top-24 md:self-start">
            {/* the register's display */}
            <div className="register rounded-[6px] border-4 border-[#2c3e52] p-4 text-white">
              <dl className="space-y-1 text-sm text-white/75">
                {!allUnpriced && (
                  <div className="flex justify-between">
                    <dt>{t.subtotal}</dt>
                    <dd className="font-poster" dir="ltr">{formatPrice(totals.subtotal, c)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>{t.delivery}</dt>
                  <dd>{totals.freeDelivery ? t.deliveryFree : t.deliveryByArea}</dd>
                </div>
                {totals.unpricedLines > 0 && !allUnpriced && (
                  <div className="flex justify-between text-flash">
                    <dt>{t.unpricedLines(totals.unpricedLines)}</dt>
                    <dd>—</dd>
                  </div>
                )}
              </dl>
              <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-white/25 pt-3">
                <span className="led font-display text-lg font-bold">{t.total}</span>
                <span className={`led text-end leading-none ${allUnpriced ? "font-display text-xl font-bold" : "font-poster text-5xl"}`} dir={allUnpriced ? undefined : "ltr"}>
                  {allUnpriced ? t.totalOnWhatsapp : formatPrice(totals.total, c)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={send}
              className="mt-4 flex min-h-16 w-full items-center justify-center gap-3 border-b-[5px] border-whatsapp-dark bg-whatsapp px-4 py-2 text-white transition-transform hover:brightness-105 active:translate-y-0.5"
            >
              <WhatsAppIcon className="size-7 shrink-0" />
              <span className="text-start leading-tight">
                <span className="block font-display text-lg font-extrabold">{t.sendOrder}</span>
                <span className="block text-sm text-white/85">{t.payAtDoor}</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The scanner window at the head of the belt, its red line sweeping. */
function Scanner() {
  return (
    <div aria-hidden className="relative flex w-12 shrink-0 flex-col items-center justify-center bg-navy sm:w-20">
      <div className="relative h-24 w-7 overflow-hidden rounded-[3px] bg-[#13283f] shadow-[inset_0_0_10px_rgba(0,0,0,0.7)] sm:w-12">
        <span className="laser animate-laser absolute inset-x-0 top-1/2 h-0.5" />
      </div>
      <span className="mt-2 font-poster text-[0.65rem] text-cherry" dir="ltr">
        SCAN
      </span>
    </div>
  );
}

/** One line of the order as a little box riding the belt, with its quantity stepper. */
function BeltBox({ line: l, products, categories }: { line: CartLine; products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const { settings, setQty, remove } = useCart();
  const text = l.text[lang];
  const step = l.weightStep ?? 1;
  const product = products.find((p) => p.id === l.productId);
  const color = categories.find((c) => c.id === product?.category)?.color ?? "#1f7fd6";
  const photo = product?.image?.src;
  const priced = isPriced(l.unitPrice);
  const detail = [text.variantLabel, ...text.options.map((o) => o.value)].filter(Boolean).join(" · ");

  return (
    <article style={{ "--pack": color } as React.CSSProperties} className="box3d relative flex h-[17rem] w-[9.5rem] flex-col bg-white shadow-[0_8px_14px_-6px_rgba(0,0,0,0.7)] sm:h-[19.5rem] sm:w-[12rem]">
      <BrandStrip brand={settings.brandLatin} small />
      <button type="button" onClick={() => remove(l.key)} aria-label={t.remove} className="absolute end-0 top-0 z-10 grid size-5 place-items-center bg-navy text-white hover:bg-cherry-deep">
        <CloseIcon className="size-3.5" />
      </button>
      <span className="window-gloss relative m-1.5 block aspect-[4/3] overflow-hidden rounded-[5px] border-2 border-[var(--pack)] bg-frost">
        {photo ? <Image src={photo} alt="" fill sizes="170px" className="object-cover" /> : <span className="grid h-full place-items-center text-4xl">{l.emoji}</span>}
      </span>
      <div className="flex min-h-0 flex-1 flex-col px-2">
        <p className="line-clamp-2 font-display text-sm leading-tight font-bold sm:text-base">{text.name}</p>
        {detail && <p className="mt-0.5 truncate text-[0.7rem] text-navy-2">{detail}</p>}
        <p className={`mt-auto pb-1.5 ${priced ? "font-poster text-xl" : "font-display text-[0.72rem] font-bold text-blue"}`}>
          {priced ? <span dir="ltr">{formatPrice(l.qty * l.unitPrice, settings.currency)}</span> : t.priceOnRequest}
        </p>
      </div>
      <div className="flex h-9 items-center justify-between bg-navy text-white">
        <button type="button" aria-label={t.decrease} onClick={() => setQty(l.key, l.qty - step)} className="grid h-full w-9 place-items-center hover:bg-white/10">
          <MinusIcon className="size-3.5" />
        </button>
        <span className="led font-poster tabular-nums" dir="ltr">
          {l.weightStep ? formatWeight(l.qty, lang) : `×${l.qty}`}
        </span>
        <button type="button" aria-label={t.increase} onClick={() => setQty(l.key, l.qty + step)} className="grid h-full w-9 place-items-center hover:bg-white/10">
          <PlusIcon className="size-3.5" />
        </button>
      </div>
    </article>
  );
}
