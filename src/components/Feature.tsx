"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { productText } from "@/lib/i18n";
import { buildLine, formatPrice, isPriced } from "@/lib/order";
import type { Product } from "@/lib/types";
import { announceAdded } from "@/lib/ui";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { CheckIcon, PlusIcon } from "./Icons";

/** The kitchen's deals (featured dishes), each as a full-bleed widescreen shot with the price set huge. */
export function Feature({ products }: { products: Product[] }) {
  const deals = products.filter((p) => p.featured && p.available);
  if (!deals.length) return null;
  return deals.map((p) => <Deal key={p.id} product={p} />);
}

function Deal({ product: p }: { product: Product }) {
  const { lang, t } = useI18n();
  const { add, view, settings } = useCart();
  const [added, setAdded] = useState(false);
  const text = productText(p, lang);
  const price = p.variants[0].price;
  const hasChoices = p.variants.length > 1 || p.options.length > 0;

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(id);
  }, [added]);

  const addDeal = () => {
    if (hasChoices) return view(p);
    add(buildLine(p, 0, [], p.weightStep ?? 1, false));
    announceAdded(text.name);
    setAdded(true);
  };

  return (
    <section className="grain relative isolate flex min-h-[86svh] items-end overflow-hidden border-y border-line sm:min-h-[44rem]">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {p.image && <Image src={p.image.src} alt="" fill sizes="100vw" className="animate-kenburns object-cover brightness-[0.72]" />}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--color-night)_4%,rgb(19_16_14/0.75)_40%,rgb(19_16_14/0.1)_75%)]" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(19_16_14/0.85),transparent_65%)] sm:block rtl:bg-[linear-gradient(270deg,rgb(19_16_14/0.85),transparent_65%)]" />
      </div>

      <div className="mx-auto w-full max-w-[76rem] px-4 pt-32 pb-12 sm:px-6 sm:pb-20">
        <p className="flex items-center gap-3 text-sm font-bold">
          <span className="bg-saffron px-2.5 py-1 text-night">{t.bestSeller}</span>
          <span className="text-bone-2">{t.offerKicker}</span>
        </p>
        <h2 className="mt-5 max-w-3xl font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight sm:text-7xl">{text.name}</h2>
        {text.description && <p className="mt-4 max-w-lg leading-relaxed text-bone-2 sm:text-lg">{text.description}</p>}

        <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-6">
          {isPriced(price) && (
            <p className="font-display text-[5.5rem] leading-[0.8] font-extrabold tracking-tighter text-saffron tabular-nums sm:text-[9rem]">{formatPrice(price, settings.currency)}</p>
          )}
          <div className="flex">
            <button
              type="button"
              onClick={addDeal}
              className={`flex h-14 items-center gap-3 px-6 font-bold transition-colors ${added ? "bg-bone text-night" : "bg-saffron text-night hover:bg-bone"}`}
            >
              {added ? <CheckIcon key="ok" className="animate-bump size-5" /> : <PlusIcon className="size-5" />}
              {added ? t.added : t.offerCta}
            </button>
            <button type="button" onClick={() => view(p)} className="-ms-px h-14 border border-line-strong px-5 font-semibold transition-colors hover:bg-bone hover:text-night">
              {t.open}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
