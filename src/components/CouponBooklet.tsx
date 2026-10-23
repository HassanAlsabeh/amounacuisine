"use client";

import { useEffect, useRef, useState } from "react";
import { buildWhatsAppMessage, formatPrice, formatWeight, isPriced, whatsappUrl } from "@/lib/order";
import type { CartLine, Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { HalftonePhoto } from "./DishStamp";
import { useI18n } from "./I18nProvider";
import { CloseIcon, MinusIcon, PlusIcon } from "./Icons";
import { Postcard } from "./Postcard";
import { ScissorsIcon, TicketIcon } from "./Retro";
import { WhatsAppIcon } from "./WhatsAppIcon";

const INKS = ["var(--color-tomato)", "var(--color-teal)", "var(--color-mustard)"];
/** How long a torn coupon takes to fall away before it leaves the order. */
const TEAR_MS = 600;

/** The order: a coupon book that grows out of the button that opened it. */
export function CouponBooklet({ products }: { products: Product[] }) {
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
    const id = setTimeout(() => setMounted(false), 450);
    return () => clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!mounted) return null;
  return <Booklet products={products} shown={shown} onClose={close} />;
}

function Booklet({ products, shown, onClose }: { products: Product[]; shown: boolean; onClose: () => void }) {
  const { lines, customer, settings, clear, origin } = useCart();
  const { t } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const [posted, setPosted] = useState(false);
  const empty = lines.length === 0;
  const productOf = new Map(products.map((p) => [p.id, p]));

  useEffect(() => {
    panel.current?.focus();
  }, []);

  useEffect(() => {
    if (!posted) return;
    const id = setTimeout(() => setPosted(false), 1600);
    return () => clearTimeout(id);
  }, [posted]);

  const send = () => {
    // open WhatsApp inside the tap itself, so the browser doesn't block it; the postcard flies off meanwhile
    window.open(whatsappUrl(settings.whatsappNumber, buildWhatsAppMessage(lines, customer, settings)), "_blank", "noopener,noreferrer");
    setPosted(true);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label={t.cart}>
      <div className={`booklet-scrim absolute inset-0 bg-brown/70 ${shown ? "is-open" : ""}`} onClick={onClose} />

      <div className={`booklet pointer-events-none absolute inset-0 ${shown ? "is-open" : ""}`} style={{ transformOrigin: `${origin.x}px ${origin.y}px` }}>
        <div
          ref={panel}
          tabIndex={-1}
          className="paper pointer-events-auto absolute inset-0 flex flex-col outline-none sm:inset-x-6 sm:inset-y-5 sm:mx-auto sm:max-w-2xl sm:border-[3px] sm:border-brown lg:max-w-6xl"
        >
          {/* the book's cover band */}
          <div className="bg-tomato text-paper-3">
            <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
              <TicketIcon className="size-8 shrink-0 text-mustard" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[1.7rem] leading-tight">{t.cart}</h2>
                <p className="truncate text-xs font-semibold text-paper-3/85">{empty ? t.emptyCartHint : t.cartHint}</p>
              </div>
              <button type="button" onClick={onClose} aria-label={t.close} className="grid size-10 shrink-0 place-items-center bg-paper-3 text-brown">
                <CloseIcon className="size-5" />
              </button>
            </div>
            <div aria-hidden className="stripes-3 h-2.5 border-t-2 border-brown" />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {empty ? (
              <div className="grid place-items-center px-6 py-16 text-center">
                <div className="grid size-40 -rotate-6 place-items-center border-[3px] border-dashed border-brown/50 text-brown/60">
                  <ScissorsIcon className="size-14" />
                </div>
                <p className="mt-6 font-display text-3xl">{t.emptyCart}</p>
                <p className="mt-2 max-w-xs text-brown-2">{t.emptyCartHint}</p>
                <button type="button" onClick={onClose} className="ticket mt-6 h-12 bg-brown px-8 font-extrabold text-paper-3 [--y:50%]">
                  {t.browse}
                </button>
              </div>
            ) : (
              <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-2 lg:gap-0 lg:p-0">
                {/* first page: the coupons */}
                <div className="lg:p-7">
                  <ul>
                    {lines.map((l, i) => (
                      <Coupon
                        key={l.key}
                        line={l}
                        product={productOf.get(l.productId)}
                        ink={INKS[i % INKS.length]}
                      />
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={clear}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brown-2 underline decoration-dotted underline-offset-4 hover:text-tomato"
                  >
                    <ScissorsIcon className="size-4" />
                    {t.clearCart}
                  </button>
                  <Totals />
                </div>

                {/* second page, past the stapled spine: the postcard */}
                <div className="relative lg:border-s-[3px] lg:border-double lg:border-brown/40 lg:bg-paper-2/60 lg:p-7">
                  <span aria-hidden className="absolute top-24 -start-[9px] hidden h-10 w-[15px] bg-brown-3 lg:block" />
                  <span aria-hidden className="absolute bottom-24 -start-[9px] hidden h-10 w-[15px] bg-brown-3 lg:block" />
                  <Postcard posted={posted} />
                </div>
              </div>
            )}
          </div>

          {!empty && (
            <div className="border-t-[3px] border-brown bg-paper-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={send}
                className="ticket relative flex h-14 w-full items-center justify-center gap-2.5 bg-teal text-base font-extrabold text-paper-3 [--y:50%] hover:bg-teal-deep active:scale-[0.98] lg:mx-auto lg:max-w-md"
              >
                <WhatsAppIcon className="size-6" />
                {posted ? t.posted : t.sendOrder}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** The book's back cover: what it all comes to, by the rules of the WhatsApp order. */
function Totals() {
  const { lines, totals, settings } = useCart();
  const { t } = useI18n();
  const c = settings.currency;
  const allUnpriced = totals.unpricedLines === lines.length;
  return (
      <dl className="mt-6 bg-brown px-4 py-3.5 text-sm text-paper-3">
        {!allUnpriced && (
          <div className="flex justify-between gap-4">
            <dt>{t.subtotal}</dt>
            <dd className="font-sign" dir="ltr">{formatPrice(totals.subtotal, c)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>{t.delivery}</dt>
          <dd className="font-semibold">{totals.freeDelivery ? t.deliveryFree : t.deliveryByArea}</dd>
        </div>
        {totals.unpricedLines > 0 && !allUnpriced && (
          <div className="flex justify-between gap-4 text-mustard-soft">
            <dt>{t.unpricedLines(totals.unpricedLines)}</dt>
            <dd>—</dd>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t-2 border-dashed border-paper-3/30 pt-2.5">
          <dt className="font-display text-xl">{t.total}</dt>
          <dd className={allUnpriced ? "text-end font-bold text-mustard" : "font-sign text-2xl text-mustard"} dir={allUnpriced ? undefined : "ltr"}>
            {allUnpriced ? t.totalOnWhatsapp : formatPrice(totals.total, c)}
          </dd>
        </div>
      </dl>
  );
}

/** One order line as a coupon; tear it off along the perforation to remove it. */
function Coupon({ line: l, product, ink }: { line: CartLine; product?: Product; ink: string }) {
  const { lang, t } = useI18n();
  const { settings, setQty, remove } = useCart();
  const [torn, setTorn] = useState(false);
  const text = l.text[lang];
  const step = l.weightStep ?? 1;
  const priced = isPriced(l.unitPrice);
  const detail = [text.variantLabel, ...text.options.map((o) => o.value)].filter(Boolean).join(" · ");

  useEffect(() => {
    if (!torn) return;
    const id = setTimeout(() => remove(l.key), TEAR_MS);
    return () => clearTimeout(id);
  }, [torn, remove, l.key]);

  return (
    <li className={`coupon-row ${torn ? "is-torn" : ""}`}>
      <div className="min-h-0 overflow-hidden pb-3">
        <div className="coupon flex bg-paper-3" style={{ boxShadow: `inset 0 0 0 3px var(--color-paper-3), inset 0 0 0 5px ${ink}` }}>
          <div className="flex min-w-0 flex-1 gap-3 p-3">
            {product ? (
              <HalftonePhoto product={product} ink={ink} live={false} sizes="64px" className="size-16 shrink-0" />
            ) : (
              <span className="grid size-16 shrink-0 place-items-center bg-paper-2 text-3xl">{l.emoji}</span>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="font-display text-lg leading-tight">{text.name}</p>
              {detail && <p className="text-xs font-semibold text-brown-2">{detail}</p>}
              <div className="mt-auto flex h-8 w-fit items-center border-2 border-brown pt-px">
                <button type="button" aria-label={t.decrease} onClick={() => setQty(l.key, l.qty - step)} className="grid h-full w-8 place-items-center">
                  <MinusIcon className="size-3.5" />
                </button>
                <span className="min-w-7 text-center font-sign text-xs">{l.weightStep ? formatWeight(l.qty, lang) : l.qty}</span>
                <button type="button" aria-label={t.increase} onClick={() => setQty(l.key, l.qty + step)} className="grid h-full w-8 place-items-center">
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* the perforation, with half-moon punches top and bottom */}
          <div aria-hidden className="relative w-0 border-s-2 border-dashed border-brown/45">
            <span className="absolute -top-2 -start-[9px] size-4 rounded-full bg-paper" />
            <span className="absolute -bottom-2 -start-[9px] size-4 rounded-full bg-paper" />
          </div>

          <div className="flex w-[5.6rem] shrink-0 flex-col items-center justify-center gap-1.5 px-2 py-3 text-center">
            {priced ? (
              <span className="font-sign text-base leading-none" dir="ltr">
                {formatPrice(l.qty * l.unitPrice, settings.currency)}
              </span>
            ) : (
              <span className="text-[0.66rem] leading-tight font-bold text-brown-2">{t.priceOnRequest}</span>
            )}
            <button
              type="button"
              onClick={() => setTorn(true)}
              disabled={torn}
              className="inline-flex items-center gap-1 px-1.5 py-1 text-xs font-extrabold text-tomato hover:bg-tomato hover:text-paper-3"
            >
              <ScissorsIcon className="size-3.5" />
              {t.remove}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
