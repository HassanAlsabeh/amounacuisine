"use client";

import Image from "next/image";
import { buildWhatsAppMessage, formatPrice, formatWeight, isPriced, whatsappUrl } from "@/lib/order";
import type { Customer, Product } from "@/lib/types";
import { pad } from "@/lib/ui";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { CloseIcon, LineArrowIcon } from "./Icons";
import { Stepper } from "./Stepper";
import { useLayer } from "./useLayer";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** The order, full screen: the dishes on one side, who and where on the other; it wipes down from the top bar. */
export function OrderSummary({ products }: { products: Product[] }) {
  const { isOpen, close } = useCart();
  const { mounted, shown } = useLayer(isOpen, close);
  if (!mounted) return null;
  return <Summary products={products} shown={shown} onClose={close} />;
}

function Summary({ products, shown, onClose }: { products: Product[]; shown: boolean; onClose: () => void }) {
  const { lines, customer, setCustomer, totals, settings, setQty, remove, clear } = useCart();
  const { lang, t } = useI18n();
  const c = settings.currency;
  const empty = lines.length === 0;
  const allUnpriced = totals.unpricedLines === lines.length;
  const photoOf = new Map(products.map((p) => [p.id, p.image?.src ?? null]));

  const send = () => {
    const text = buildWhatsAppMessage(lines, customer, settings);
    window.open(whatsappUrl(settings.whatsappNumber, text), "_blank", "noopener,noreferrer");
  };

  const field = (key: keyof Customer, label: string, placeholder: string, multiline = false) => {
    const common = {
      value: customer[key],
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer({ ...customer, [key]: e.target.value }),
      className: "mt-1 block w-full border-b border-line-strong bg-transparent text-lg outline-none transition-colors placeholder:text-bone-3/70 focus:border-saffron",
    };
    return (
      <label className="block">
        <span className="text-xs font-bold text-bone-3">{label}</span>
        {multiline ? (
          <textarea rows={2} {...common} className={`${common.className} resize-none py-2`} />
        ) : (
          <input {...common} autoComplete={key === "name" ? "name" : key === "address" ? "street-address" : "off"} className={`${common.className} h-12`} />
        )}
      </label>
    );
  };

  return (
    <div role="dialog" aria-modal aria-label={t.cartTitle} className={`layer-wipe fixed inset-0 z-50 flex flex-col bg-night-2 ${shown ? "is-open" : ""}`}>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6">
        <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">{t.cartTitle}</h2>
        <span className="font-display font-bold text-saffron tabular-nums" dir="ltr">
          [{pad(totals.units)}]
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="ms-auto flex h-10 items-center gap-2 border border-line-strong px-3 text-sm font-semibold transition-colors hover:bg-bone hover:text-night"
        >
          <span className="hidden sm:inline">{t.close}</span>
          <CloseIcon className="size-4" />
        </button>
      </header>

      {empty ? (
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <p className="numeral-outline font-display text-[9rem] leading-none font-extrabold sm:text-[13rem]">00</p>
            <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">{t.emptyCart}</p>
            <p className="mx-auto mt-2 max-w-sm text-bone-2">{t.emptyCartHint}</p>
            <a href="#menu" onClick={onClose} className="group mt-8 inline-flex h-14 items-center gap-4 bg-saffron px-6 font-bold text-night transition-colors hover:bg-bone">
              {t.browse}
              <LineArrowIcon className="size-5 rtl:-scale-x-100" />
            </a>
          </div>
        </div>
      ) : (
        // phones: one scrolling column over a fixed send bar; desktop: the wrapper dissolves (lg:contents)
        // into a grid with the dishes on one side and the details over the send bar on the other
        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_30rem] lg:grid-rows-[minmax(0,1fr)_auto]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:contents">
            {/* 01: the dishes */}
            <section className="px-4 py-6 sm:px-6 lg:row-span-2 lg:overflow-y-auto lg:px-12 lg:py-10">
              <div className="flex items-baseline gap-3 border-b border-line pb-4">
                <span className="font-display text-sm font-bold text-saffron">01</span>
                <h3 className="font-display text-2xl font-bold">{t.yourDishes}</h3>
                <span className="ms-auto text-sm text-bone-3">{t.items(lines.length)}</span>
              </div>
              <ul>
                {lines.map((l, i) => {
                  const text = l.text[lang];
                  const step = l.weightStep ?? 1;
                  const photo = photoOf.get(l.productId);
                  const priced = isPriced(l.unitPrice);
                  return (
                    <li key={l.key} className="flex gap-4 border-b border-line py-5">
                      <span className="relative size-20 shrink-0 overflow-hidden bg-night-3 sm:size-28">
                        {photo ? <Image src={photo} alt="" fill sizes="112px" className="object-cover" /> : <span className="grid h-full place-items-center text-3xl">{l.emoji}</span>}
                        <span className="absolute start-0 top-0 bg-night/80 px-1.5 py-0.5 font-display text-[0.7rem] font-bold">{pad(i + 1)}</span>
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start gap-3">
                          <p className="min-w-0 flex-1 font-display text-lg leading-snug font-bold sm:text-xl">{text.name}</p>
                          <button type="button" onClick={() => remove(l.key)} aria-label={`${t.remove}: ${text.name}`} className="-m-1.5 grid size-9 shrink-0 place-items-center text-bone-3 transition-colors hover:text-saffron">
                            <CloseIcon className="size-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-sm text-bone-3">{[text.variantLabel, ...text.options.map((o) => o.value)].filter(Boolean).join(" · ")}</p>
                        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                          <Stepper size="sm" label={l.weightStep ? formatWeight(l.qty, lang) : pad(l.qty)} onDecrease={() => setQty(l.key, l.qty - step)} onIncrease={() => setQty(l.key, l.qty + step)} />
                          <span className={priced ? "font-display text-xl font-extrabold tabular-nums" : "text-xs font-semibold text-lav"}>
                            {priced ? formatPrice(l.qty * l.unitPrice, c) : t.priceOnRequest}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={clear} className="mt-4 text-sm text-bone-3 underline decoration-line-strong underline-offset-4 transition-colors hover:text-saffron">
                {t.clearCart}
              </button>
            </section>

            {/* 02: who and where, then the totals */}
            <section className="border-t border-line bg-night px-4 py-8 sm:px-6 lg:col-start-2 lg:row-start-1 lg:overflow-y-auto lg:border-t-0 lg:border-s lg:px-10 lg:py-8">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-sm font-bold text-saffron">02</span>
                <h3 className="font-display text-2xl font-bold">{t.detailsTitle}</h3>
              </div>
              <div className="mt-6 grid gap-5">
                {field("name", t.name, t.namePlaceholder)}
                {field("address", t.address, t.addressPlaceholder)}
                {field("notes", t.notes, t.notesPlaceholder, true)}
              </div>

              <dl className="mt-8 text-sm">
                {!allUnpriced && (
                  <div className="flex justify-between border-t border-line py-3">
                    <dt className="text-bone-2">{t.subtotal}</dt>
                    <dd className="font-display font-bold tabular-nums">{formatPrice(totals.subtotal, c)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line py-3">
                  <dt className="text-bone-2">{t.delivery}</dt>
                  <dd>{totals.freeDelivery ? t.deliveryFree : t.deliveryByArea}</dd>
                </div>
                {totals.unpricedLines > 0 && !allUnpriced && (
                  <div className="flex justify-between border-t border-line py-3 text-lav">
                    <dt>{t.unpricedLines(totals.unpricedLines)}</dt>
                    <dd>—</dd>
                  </div>
                )}
                <div className="flex items-end justify-between gap-4 border-t border-line-strong pt-4">
                  <dt className="font-display text-lg font-bold">{t.total}</dt>
                  <dd className={allUnpriced ? "text-end font-semibold text-lav" : "font-display text-5xl leading-none font-extrabold text-saffron tabular-nums"}>
                    {allUnpriced ? t.totalOnWhatsapp : formatPrice(totals.total, c)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="shrink-0 border-t border-line bg-night px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:col-start-2 lg:row-start-2 lg:border-s lg:px-10 lg:py-6">
            <button type="button" onClick={send} className="group flex h-14 w-full items-center gap-3 bg-saffron px-5 font-bold text-night transition-colors hover:bg-bone">
              <WhatsAppIcon className="size-5 shrink-0" />
              <span className="flex-1 truncate text-start">{t.sendOrder}</span>
              {/* phones can't see the totals from here, so the button carries the total */}
              {!allUnpriced && <span className="shrink-0 border-s border-night/25 ps-3 font-display text-lg font-extrabold tabular-nums lg:hidden">{formatPrice(totals.total, c)}</span>}
              <LineArrowIcon
                className={`size-5 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 ${allUnpriced ? "" : "hidden lg:block"}`}
              />
            </button>
            <p className="mt-2 hidden text-xs text-bone-3 sm:block">{t.sendHint}</p>
          </div>
        </div>
      )}
    </div>
  );
}
