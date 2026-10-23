"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buildWhatsAppMessage, formatPrice, formatWeight, isPriced, newOrderRef, whatsappUrl } from "@/lib/order";
import type { Customer } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { CloseIcon, MinusIcon, PlusIcon } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** How long the torn-off ticket takes to fall away before a fresh stub shows. */
const TEAR_MS = 800;

const WIDE = "(min-width: 1024px)";

/** Whether the pad is pinned beside the menu (wide screens) rather than kept in its tab. False on the server. */
function useWide() {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(WIDE);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
}

/** On wide screens the pad is pinned to the board beside the menu with a red thumbtack. */
export function PinnedPad() {
  // only one pad on the page at a time, so its form fields are never doubled
  if (!useWide()) return null;
  return (
    <div className="sticky top-24 rotate-[0.8deg]">
      <span aria-hidden className="absolute -top-3 left-1/2 z-10 size-6 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff9a8a,#c4302b_55%,#7d1715)] shadow-[2px_4px_4px_rgba(0,0,0,0.45)]" />
      <Pad className="max-h-[calc(100dvh-8rem)]" />
    </div>
  );
}

/** On phones the pad slides down from the top of the screen when its tab on the frame is tapped. */
export function PadSheet() {
  const { isOpen, close } = useCart();
  const wide = useWide();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  // the window grew wide enough for the pinned pad: put the sliding one away
  useEffect(() => {
    if (wide && isOpen) close();
  }, [wide, isOpen, close]);

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
  return <SheetBody shown={shown} onClose={close} />;
}

function SheetBody({ shown, onClose }: { shown: boolean; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal aria-label={t.cartTitle}>
      <div className={`pad-scrim absolute inset-0 bg-black/60 ${shown ? "is-open" : ""}`} onClick={onClose} />
      <div className={`pad-sheet absolute inset-x-0 top-0 mx-auto flex max-h-[100dvh] max-w-lg flex-col px-3 pt-2 ${shown ? "is-open" : ""}`}>
        <Pad className="max-h-[calc(100dvh-4.5rem)]" onClose={onClose} autoFocus />
        <button type="button" onClick={onClose} className="chalk mx-auto mt-2 flex min-h-11 items-center gap-2 px-4 font-chalk text-[calc(1.2rem*var(--cs))] text-chalk">
          <span aria-hidden className="text-xl leading-none">↑</span>
          {t.backToBoard}
        </button>
      </div>
    </div>
  );
}

/** The waiter's pad itself: the order in pen on ruled paper, the customer's details, and a ticket to tear off. */
function Pad({ className = "", onClose, autoFocus = false }: { className?: string; onClose?: () => void; autoFocus?: boolean }) {
  const { lines, customer, setCustomer, totals, settings, setQty, remove, clear } = useCart();
  const { lang, t } = useI18n();
  const [ref, setRef] = useState("");
  const [tearing, setTearing] = useState(false);
  const [sent, setSent] = useState(false);
  const c = settings.currency;
  const empty = lines.length === 0;
  const allUnpriced = totals.unpricedLines === lines.length;
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) sheet.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  // the order number is drawn on the client only, so the server and browser agree on the first paint
  useEffect(() => setRef(newOrderRef()), []);

  const send = () => {
    window.open(whatsappUrl(settings.whatsappNumber, buildWhatsAppMessage(lines, customer, settings, { ref })), "_blank", "noopener,noreferrer");
    setTearing(true);
    setTimeout(() => {
      setTearing(false);
      setSent(true);
      setRef(newOrderRef());
    }, TEAR_MS);
    setTimeout(() => setSent(false), TEAR_MS + 3200);
  };

  const field = (key: keyof Customer, label: string, placeholder: string, multiline = false) => {
    const common = {
      value: customer[key],
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer({ ...customer, [key]: e.target.value }),
      className: "min-w-0 flex-1 bg-transparent font-pen text-base leading-8 text-pen outline-none placeholder:text-pen-2/45 focus:bg-chalk-yellow/25",
    };
    return (
      <label className="flex items-start gap-2">
        <span className="shrink-0 text-sm leading-8 font-semibold text-pen-2">{label}:</span>
        {multiline ? (
          <textarea rows={2} {...common} className={`${common.className} resize-none`} />
        ) : (
          <input {...common} autoComplete={key === "name" ? "name" : "street-address"} className={`${common.className} h-8`} />
        )}
      </label>
    );
  };

  return (
    <div className={`pad-stack flex flex-col overflow-hidden rounded-b-[3px] text-pen ${className}`}>
      {/* the glued binding at the top of the pad */}
      <div className="flex shrink-0 items-center gap-3 bg-binding px-4 py-2.5 text-paper">
        <div className="min-w-0 flex-1">
          <h2 className="font-pen text-lg leading-none font-bold">{t.cartTitle}</h2>
          <p className="mt-1 truncate text-[0.7rem] tracking-wide text-paper/70" dir="ltr">
            {settings.brandLatin}
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t.close} className="-me-1 grid size-10 place-items-center text-paper/90 hover:text-paper">
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>

      <div
        ref={sheet}
        tabIndex={autoFocus ? -1 : undefined}
        className="ruled min-h-0 flex-1 overflow-y-auto overscroll-contain ps-12 pe-4 pb-8 outline-none"
      >
        <p className="flex h-8 items-center justify-between text-xs text-pen-2">
          <span>
            {t.padNo} <span className="font-pen text-sm text-pen">#{ref}</span>
          </span>
          <span>{t.padTable}</span>
        </p>

        {empty ? (
          <div className="py-8">
            <p className="font-pen text-lg leading-8 font-bold">{t.emptyCart}</p>
            <p className="font-pen text-sm leading-8 text-pen-2">{t.emptyCartHint}</p>
          </div>
        ) : (
          <>
            <ul>
              {lines.map((l) => {
                const text = l.text[lang];
                const step = l.weightStep ?? 1;
                const priced = isPriced(l.unitPrice);
                const extra = [text.variantLabel, ...text.options.map((o) => o.value)].filter(Boolean).join(" · ");
                return (
                  <li key={l.key} className="write-in">
                    <div className="flex h-8 items-baseline gap-2 font-pen leading-8">
                      <span className="shrink-0 font-bold tabular-nums">{l.weightStep ? formatWeight(l.qty, lang) : `${l.qty}×`}</span>
                      <span className="min-w-0 flex-1 truncate">{text.name}</span>
                      <span className={`shrink-0 font-bold ${priced ? "" : "text-xs font-normal text-pen-2"}`}>
                        {priced ? formatPrice(l.qty * l.unitPrice, c) : t.priceAsk}
                      </span>
                    </div>
                    <div className="flex h-8 items-center gap-1 text-xs text-pen-2">
                      <span className="min-w-0 flex-1 truncate">{extra}</span>
                      <button type="button" aria-label={`${t.decrease}: ${text.name}`} onClick={() => setQty(l.key, l.qty - step)} className="grid size-8 place-items-center hover:text-pen">
                        <MinusIcon className="size-3.5" />
                      </button>
                      <button type="button" aria-label={`${t.increase}: ${text.name}`} onClick={() => setQty(l.key, l.qty + step)} className="grid size-8 place-items-center hover:text-pen">
                        <PlusIcon className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => remove(l.key)} className="h-8 px-1 font-pen text-xs text-binding/80 underline decoration-wavy underline-offset-4 hover:text-binding">
                        {t.remove}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button type="button" onClick={clear} className="h-8 font-pen text-xs text-pen-2 line-through decoration-binding/70 hover:text-binding">
              {t.clearCart}
            </button>

            <dl className="mt-8 text-sm">
              {!allUnpriced && (
                <div className="flex h-8 items-center justify-between">
                  <dt className="text-pen-2">{t.subtotal}</dt>
                  <dd className="font-pen font-bold">{formatPrice(totals.subtotal, c)}</dd>
                </div>
              )}
              <div className="flex h-8 items-center justify-between">
                <dt className="text-pen-2">{t.delivery}</dt>
                <dd className="font-pen">{totals.freeDelivery ? t.deliveryFree : t.deliveryByArea}</dd>
              </div>
              {totals.unpricedLines > 0 && !allUnpriced && (
                <div className="flex h-8 items-center justify-between text-pen-2">
                  <dt>{t.unpricedLines(totals.unpricedLines)}</dt>
                  <dd>—</dd>
                </div>
              )}
              <div className="flex h-8 items-center justify-between">
                <dt className="font-pen text-base font-bold">{t.total}</dt>
                <dd className="border-b-[3px] border-double border-pen font-pen text-lg leading-7 font-bold">{allUnpriced ? t.totalOnWhatsapp : formatPrice(totals.total, c)}</dd>
              </div>
            </dl>

            <div className="mt-8">
              {field("name", t.name, t.namePlaceholder)}
              {field("address", t.address, t.addressPlaceholder)}
              {field("notes", t.notes, t.notesPlaceholder, true)}
            </div>
          </>
        )}
      </div>

      {/* the ticket: tear it off along the perforation and it goes to WhatsApp */}
      {!empty && (
        <div className="relative shrink-0 bg-paper">
          <div aria-hidden className="h-0 border-t-2 border-dashed border-pen-2/40" />
          {sent ? (
            <p className="fade-in flex h-16 items-center justify-center gap-2 bg-paper font-pen text-base font-bold text-whatsapp" role="status">
              <WhatsAppIcon className="size-5" />
              {t.sent}
            </p>
          ) : (
            <button
              type="button"
              onClick={send}
              disabled={tearing}
              className={`perforated flex h-16 w-full items-center justify-center gap-2.5 bg-whatsapp px-4 text-base font-bold text-white hover:bg-whatsapp-dark ${tearing ? "tear-off" : "fade-in"}`}
            >
              <span aria-hidden className="text-xl leading-none">✂</span>
              <span className="min-w-0 truncate">{t.sendOrder}</span>
              <WhatsAppIcon className="size-5 shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
