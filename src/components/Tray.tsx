"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { buildWhatsAppMessage, formatPrice, formatWeight, isPriced, whatsappUrl } from "@/lib/order";
import type { Customer, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./Icons";
import { TrayIcon } from "./Kitchenware";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The order: a baking tray that slides up from the bottom, dishes lined up on baking paper. */
export function Tray({ products }: { products: Product[] }) {
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
    const id = setTimeout(() => setMounted(false), 500);
    return () => clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!mounted) return null;
  return <TraySheet products={products} shown={shown} onClose={close} />;
}

function TraySheet({ products, shown, onClose }: { products: Product[]; shown: boolean; onClose: () => void }) {
  const { lines, customer, setCustomer, totals, settings, setQty, remove, clear } = useCart();
  const { lang, t } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const c = settings.currency;
  const empty = lines.length === 0;
  const allUnpriced = totals.unpricedLines === lines.length;
  const photoOf = new Map(products.map((p) => [p.id, p.image?.src ?? null]));

  useEffect(() => {
    panel.current?.focus();
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
      className: "mt-1 block w-full rounded-sm border-[1.5px] border-ink/70 bg-white/70 px-2.5 text-base outline-none placeholder:text-ink-3 focus:border-ink focus:bg-white",
    };
    return (
      <label className="block">
        <span className="text-sm font-bold">{label}</span>
        {multiline ? (
          <textarea rows={2} {...common} className={`${common.className} resize-none py-2`} />
        ) : (
          <input {...common} autoComplete={key === "name" ? "name" : key === "address" ? "street-address" : "off"} className={`${common.className} h-11`} />
        )}
      </label>
    );
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label={t.cartTitle}>
      <div className={`tray-scrim absolute inset-0 bg-ink/55 ${shown ? "is-open" : ""}`} onClick={onClose} />

      <div
        ref={panel}
        tabIndex={-1}
        className={`tray-sheet absolute inset-x-0 bottom-0 mx-auto flex max-h-[94dvh] max-w-3xl flex-col rounded-t-2xl border-2 border-b-0 border-ink bg-[#8d91c9] p-2 pb-0 outline-none sm:bottom-4 sm:max-h-[90dvh] sm:rounded-2xl sm:border-b-2 sm:p-3 ${shown ? "is-open" : ""}`}
      >
        {/* the tray's handle and rim */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-2.5 text-cream">
          <TrayIcon className="h-6 w-8" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl leading-none">{t.cartTitle}</h2>
            <p className="mt-0.5 truncate text-xs text-cream/80">{empty ? t.emptyCartHint : t.cartHint}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="grid size-10 place-items-center rounded-md border-2 border-ink bg-cream text-ink">
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="parchment min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-t-lg border-2 border-ink shadow-[inset_0_6px_14px_-8px_rgba(29,27,44,0.5)] sm:rounded-lg">
          {empty ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <TrayIcon className="h-16 w-20 text-ink-3" />
              <p className="mt-4 font-display text-2xl">{t.emptyCart}</p>
              <button type="button" onClick={onClose} className="press mt-5 rounded-md border-2 border-ink bg-butter px-5 py-2.5 font-bold shadow-sticker-sm">
                {t.browse}
              </button>
            </div>
          ) : (
            <div className="p-3 sm:p-5">
              <ul className="space-y-3">
                {lines.map((l) => {
                  const text = l.text[lang];
                  const step = l.weightStep ?? 1;
                  const photo = photoOf.get(l.productId);
                  const priced = isPriced(l.unitPrice);
                  return (
                    <li key={l.key} className="flex gap-3 rounded-md border-2 border-ink bg-white p-2 shadow-sticker-sm">
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-sm border-[1.5px] border-ink bg-lav-2 sm:size-20">
                        {photo ? <Image src={photo} alt="" fill sizes="80px" className="object-cover" /> : <span className="grid h-full place-items-center text-3xl">{l.emoji}</span>}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 text-sm leading-snug font-bold">{text.name}</p>
                          <button type="button" onClick={() => remove(l.key)} aria-label={t.remove} className="-m-1 grid size-8 shrink-0 place-items-center text-ink-3 hover:text-tomato">
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                        <p className="text-xs text-ink-3">
                          {[text.variantLabel, ...text.options.map((o) => o.value)].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                          <div className="flex h-8 items-center rounded-sm border-[1.5px] border-ink">
                            <button type="button" aria-label={t.decrease} onClick={() => setQty(l.key, l.qty - step)} className="grid h-full w-8 place-items-center">
                              <MinusIcon className="size-3.5" />
                            </button>
                            <span className="min-w-7 text-center text-sm font-bold tabular-nums">{l.weightStep ? formatWeight(l.qty, lang) : l.qty}</span>
                            <button type="button" aria-label={t.increase} onClick={() => setQty(l.key, l.qty + step)} className="grid h-full w-8 place-items-center">
                              <PlusIcon className="size-3.5" />
                            </button>
                          </div>
                          <span className={`text-sm font-bold ${priced ? "" : "text-[0.7rem] text-lav-deep"}`}>
                            {priced ? formatPrice(l.qty * l.unitPrice, c) : t.priceOnRequest}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button type="button" onClick={clear} className="mt-3 text-xs font-semibold text-ink-3 underline underline-offset-4 hover:text-tomato">
                {t.clearCart}
              </button>

              {/* the note stuck on the fridge, held by a tomato magnet */}
              <div className="relative mt-7 rotate-[-0.8deg] rounded-sm border-2 border-ink bg-butter-soft p-4 pt-6 shadow-sticker">
                <span aria-hidden className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 rounded-full border-2 border-ink bg-tomato shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.18)]" />
                <p className="font-display text-xl">{t.noteTitle}</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {field("name", t.name, t.namePlaceholder)}
                  {field("address", t.address, t.addressPlaceholder)}
                  <div className="sm:col-span-2">{field("notes", t.notes, t.notesPlaceholder, true)}</div>
                </div>
              </div>

              <dl className="mt-6 space-y-1.5 text-sm">
                {!allUnpriced && (
                  <div className="flex justify-between">
                    <dt>{t.subtotal}</dt>
                    <dd className="font-bold">{formatPrice(totals.subtotal, c)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>{t.delivery}</dt>
                  <dd>{totals.freeDelivery ? t.deliveryFree : t.deliveryByArea}</dd>
                </div>
                {totals.unpricedLines > 0 && !allUnpriced && (
                  <div className="flex justify-between text-lav-deep">
                    <dt>{t.unpricedLines(totals.unpricedLines)}</dt>
                    <dd>—</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t-2 border-dashed border-ink/40 pt-2">
                  <dt className="font-display text-xl">{t.total}</dt>
                  <dd className="font-display text-2xl">{allUnpriced ? t.totalOnWhatsapp : formatPrice(totals.total, c)}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {!empty && (
          <div className="border-x-2 border-ink bg-cream px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-lg sm:border-b-2">
            <button
              type="button"
              onClick={send}
              className="press flex h-14 w-full items-center justify-center gap-2.5 rounded-md border-2 border-ink bg-whatsapp text-base font-bold text-white shadow-sticker hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="size-6" />
              {t.sendOrder}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
