"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { buildWhatsAppMessage, formatPrice, formatWeight, isPriced, whatsappUrl } from "@/lib/order";
import type { CartLine, Customer, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { BoxGlyph } from "./Lid";
import { ArrowIcon, CloseIcon, MinusIcon, PlusIcon } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

type Step = "pack" | "lid";

/** The order: the box opens down from the lid, each dish in a slot; closing the lid is the checkout. */
export function Lunchbox({ products }: { products: Product[] }) {
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
  return <BoxPanel products={products} shown={shown} onClose={close} />;
}

function BoxPanel({ products, shown, onClose }: { products: Product[]; shown: boolean; onClose: () => void }) {
  const { lines, customer, settings } = useCart();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("pack");
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const empty = lines.length === 0;
  const onLid = step === "lid" && !empty;

  // always a row of four to fill, with at least one slot left free
  const slots = Math.max(4, Math.ceil((lines.length + 1) / 4) * 4);

  useEffect(() => {
    panel.current?.focus();
  }, []);

  const goTo = (s: Step) => {
    setStep(s);
    scroller.current?.scrollTo({ top: 0 });
  };

  const send = () => {
    window.open(whatsappUrl(settings.whatsappNumber, buildWhatsAppMessage(lines, customer, settings)), "_blank", "noopener,noreferrer");
  };

  const steps: [Step | "send", string][] = [
    ["pack", t.stepPack],
    ["lid", t.stepLid],
    ["send", t.stepSend],
  ];
  const current = onLid ? 1 : 0;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label={t.cartTitle}>
      <div className={`lid-scrim absolute inset-0 bg-ink/50 ${shown ? "is-open" : ""}`} onClick={onClose} />

      <div
        ref={panel}
        tabIndex={-1}
        className={`lid-panel absolute inset-x-0 top-0 bottom-0 flex max-h-dvh sm:bottom-auto flex-col border-b border-line bg-counter outline-none sm:max-h-[92dvh] ${shown ? "is-open" : ""}`}
      >
        {/* the panel's own lid bar */}
        <div className="border-b border-line bg-box">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:px-5">
            <BoxGlyph filled={Math.min(lines.length, 4)} className="size-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg leading-none font-bold">{t.cartTitle}</h2>
              <p className="mt-1 truncate text-xs text-ink-2">{empty ? t.emptyCartHint : t.slotsPacked(lines.length, slots)}</p>
            </div>
            <button type="button" onClick={onClose} aria-label={t.close} className="grid size-10 shrink-0 place-items-center rounded-cell border border-line hover:bg-apri">
              <CloseIcon className="size-5" />
            </button>
          </div>
        </div>

        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
            {/* the three steps, as a strip of compartments */}
            <ol className="bento mb-4 grid grid-cols-3 text-xs sm:text-sm">
              {steps.map(([id, label], i) => (
                <li key={id} className={`flex items-center gap-2 px-2.5 py-2 sm:px-4 ${i === current ? "bg-ink text-box" : i < current ? "bg-pista" : "text-ink-3"}`}>
                  <span className={`grid size-5 shrink-0 place-items-center rounded-[3px] font-display text-[0.7rem] font-bold ${i === current ? "bg-butter text-ink" : "border border-current"}`}>
                    {i + 1}
                  </span>
                  <span className="truncate font-display font-semibold">{label}</span>
                </li>
              ))}
            </ol>

            {onLid ? <LidStep /> : <PackStep products={products} slots={slots} onClose={onClose} />}
          </div>
        </div>

        {!empty && (
          <div className="border-t border-line bg-box">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:px-5">
              <Totals />
              {onLid ? (
                <div className="flex gap-2 sm:ms-auto">
                  <button type="button" onClick={() => goTo("pack")} className="h-12 shrink-0 rounded-cell border border-line px-3 font-display text-sm font-semibold hover:bg-lav">
                    {t.reopen}
                  </button>
                  <button
                    type="button"
                    onClick={send}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-cell bg-whatsapp px-4 font-display text-sm font-semibold text-white hover:bg-whatsapp-dark sm:flex-none sm:text-base"
                  >
                    <WhatsAppIcon className="size-5" />
                    {t.sendOrder}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo("lid")}
                  className="group flex h-12 items-center justify-center gap-3 rounded-cell bg-ink px-5 font-display font-semibold text-box hover:bg-ink-2 sm:ms-auto"
                >
                  {t.closeLid}
                  <ArrowIcon className="h-4 w-7 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Step one: every line in its own slot, the free slots dashed. */
function PackStep({ products, slots, onClose }: { products: Product[]; slots: number; onClose: () => void }) {
  const { lines, clear } = useCart();
  const { t } = useI18n();
  const photoOf = new Map(products.map((p) => [p.id, p.image?.src ?? null]));

  const toMenu = () => {
    onClose();
    document.getElementById("menu")?.scrollIntoView();
  };

  return (
    <>
      <ul className="bento grid grid-cols-2 lg:grid-cols-4">
        {lines.map((l, i) => (
          <Slot key={l.key} line={l} index={i} photo={photoOf.get(l.productId) ?? null} />
        ))}
        {Array.from({ length: slots - lines.length }, (_, i) => (
          <li key={`free-${i}`} className="slot-empty">
            <button type="button" onClick={toMenu} className="flex h-full min-h-44 w-full flex-col items-center justify-center gap-2 p-4 text-center text-ink-3 hover:text-ink">
              <span className="grid size-9 place-items-center rounded-cell border border-dashed border-current">
                <PlusIcon className="size-4" />
              </span>
              <span className="font-display text-sm font-semibold">{lines.length === 0 && i === 0 ? t.emptyCart : t.emptySlot}</span>
              <span className="text-xs">{t.emptySlotHint}</span>
            </button>
          </li>
        ))}
      </ul>
      {lines.length > 0 && (
        <button type="button" onClick={clear} className="mt-3 text-xs font-medium text-ink-2 underline decoration-ink-3/60 underline-offset-4 hover:text-apri-deep">
          {t.clearCart}
        </button>
      )}
    </>
  );
}

function Slot({ line: l, index, photo }: { line: CartLine; index: number; photo: string | null }) {
  const { setQty, remove, settings } = useCart();
  const { lang, t } = useI18n();
  const text = l.text[lang];
  const step = l.weightStep ?? 1;
  const priced = isPriced(l.unitPrice);
  const detail = [text.variantLabel, ...text.options.map((o) => o.value)].filter(Boolean).join(" · ");

  return (
    <li className="drop-in flex flex-col">
      <div className="relative aspect-[16/10] bg-apri">
        {photo ? <Image src={photo} alt="" fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" /> : <span className="grid h-full place-items-center text-4xl">{l.emoji}</span>}
        <span className="absolute start-2 top-2 rounded-[3px] bg-box px-1.5 font-display text-xs font-bold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <button type="button" onClick={() => remove(l.key)} aria-label={`${t.remove}: ${text.name}`} className="absolute end-2 top-2 grid size-7 place-items-center rounded-[3px] bg-box hover:bg-apri">
          <CloseIcon className="size-3.5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-display text-sm leading-snug font-bold">{text.name}</p>
        {detail && <p className="mt-0.5 text-xs text-ink-3">{detail}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2.5">
          <div className="flex h-8 items-center rounded-cell border border-line">
            <button type="button" aria-label={t.decrease} onClick={() => setQty(l.key, l.qty - step)} className="grid h-full w-7 place-items-center hover:bg-apri">
              <MinusIcon className="size-3.5" />
            </button>
            <span className="min-w-7 border-x border-line/20 px-1 text-center font-display text-sm font-semibold tabular-nums">{l.weightStep ? formatWeight(l.qty, lang) : l.qty}</span>
            <button type="button" aria-label={t.increase} onClick={() => setQty(l.key, l.qty + step)} className="grid h-full w-7 place-items-center hover:bg-pista">
              <PlusIcon className="size-3.5" />
            </button>
          </div>
          <span className={priced ? "font-display text-sm font-bold" : "text-[0.7rem] font-semibold text-lav-deep"}>
            {priced ? formatPrice(l.qty * l.unitPrice, settings.currency) : t.priceOnRequest}
          </span>
        </div>
      </div>
    </li>
  );
}

/** Step two: the closed lid, with the customer's details written on its label. */
function LidStep() {
  const { lines, customer, setCustomer } = useCart();
  const { t } = useI18n();

  const field = (key: keyof Customer, label: string, placeholder: string, multiline = false) => {
    const common = {
      value: customer[key],
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer({ ...customer, [key]: e.target.value }),
      className: "mt-1 block w-full rounded-cell border border-line/40 bg-white px-3 text-base outline-none placeholder:text-ink-3 focus:border-ink focus:ring-2 focus:ring-butter",
    };
    return (
      <label className="block">
        <span className="font-display text-xs font-semibold">{label}</span>
        {multiline ? (
          <textarea rows={2} {...common} className={`${common.className} resize-none py-2.5`} />
        ) : (
          <input {...common} autoComplete={key === "name" ? "name" : key === "address" ? "street-address" : "off"} className={`${common.className} h-11`} />
        )}
      </label>
    );
  };

  return (
    <div className="lid-close relative overflow-hidden rounded-box border border-line bg-lav px-3 py-8 sm:px-10 sm:py-12">
      {/* the box's elastic band, running under the label */}
      <span aria-hidden className="absolute inset-y-0 start-1/2 w-5 -translate-x-1/2 bg-lav-deep/80 rtl:translate-x-1/2" />
      {/* the packed dishes peeking out from under the lid's edge */}
      <div aria-hidden className="absolute inset-x-0 top-0 flex h-2">
        {lines.map((l, i) => (
          <span key={l.key} className={`flex-1 ${["bg-apri", "bg-butter", "bg-pista", "bg-box"][i % 4]}`} />
        ))}
      </div>

      <div className="relative mx-auto max-w-xl rounded-cell border border-line bg-box p-4 sm:p-6">
        <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-line/30 pb-3">
          <h3 className="font-display text-xl font-bold">{t.labelTitle}</h3>
          <span className="shrink-0 font-display text-xs font-semibold text-ink-2">{t.items(lines.length)}</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-2">{t.labelHint}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {field("name", t.name, t.namePlaceholder)}
          {field("address", t.address, t.addressPlaceholder)}
          <div className="sm:col-span-2">{field("notes", t.notes, t.notesPlaceholder, true)}</div>
        </div>
      </div>
    </div>
  );
}

/** The totals, by the shop's rules: unpriced dishes are confirmed on WhatsApp and left out. */
function Totals() {
  const { lines, totals, settings } = useCart();
  const { t } = useI18n();
  const c = settings.currency;
  const allUnpriced = totals.unpricedLines === lines.length;

  const row = "flex items-baseline justify-between gap-3 sm:block";
  return (
    <div className="text-sm">
      <dl className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:gap-7">
        {!allUnpriced && (
          <div className={row}>
            <dt className="text-xs text-ink-2">{t.subtotal}</dt>
            <dd className="font-semibold">{formatPrice(totals.subtotal, c)}</dd>
          </div>
        )}
        <div className={row}>
          <dt className="text-xs text-ink-2">{t.delivery}</dt>
          <dd className="font-semibold">{totals.freeDelivery ? t.deliveryFree : t.deliveryByArea}</dd>
        </div>
        <div className={`${row} mt-1 border-t border-dashed border-line/30 pt-1.5 sm:mt-0 sm:border-0 sm:pt-0`}>
          <dt className="font-display text-xs font-semibold">{t.total}</dt>
          <dd className="font-display text-xl leading-tight font-extrabold">{allUnpriced ? t.totalOnWhatsapp : formatPrice(totals.total, c)}</dd>
        </div>
      </dl>
      {totals.unpricedLines > 0 && !allUnpriced && <p className="mt-0.5 text-xs text-lav-deep">+ {t.unpricedLines(totals.unpricedLines)}</p>}
    </div>
  );
}
