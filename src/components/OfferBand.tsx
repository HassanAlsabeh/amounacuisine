"use client";

import Image from "next/image";
import { flyToTray } from "@/lib/fly";
import { productText } from "@/lib/i18n";
import { buildLine, formatPrice, isPriced } from "@/lib/order";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { PlusIcon } from "./Icons";

/** The kitchen's deals (featured dishes), pinned up on a dark board with a price burst. */
export function OfferBand({ products }: { products: Product[] }) {
  const { lang, t } = useI18n();
  const { add, settings } = useCart();
  const deals = products.filter((p) => p.featured && p.available);
  if (!deals.length) return null;

  return (
    <section className="relative bg-ink py-14 text-cream sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4">
        {deals.map((p, i) => {
          const text = productText(p, lang);
          const price = p.variants[0].price;
          return (
            <article key={p.id} className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="relative mx-auto w-full max-w-md">
                <div className="relative aspect-[5/4] rotate-[-3deg] overflow-hidden rounded-md border-[3px] border-cream bg-steel shadow-[8px_8px_0_var(--color-tomato)]">
                  {p.image ? (
                    <Image src={p.image.src} alt={p.image.alt || text.name} fill sizes="(min-width: 768px) 440px, 90vw" className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-8xl">{p.emoji}</div>
                  )}
                </div>
                {isPriced(price) && (
                  <span className="absolute -end-3 -top-6 grid size-24 rotate-12 place-items-center rounded-full border-[3px] border-ink bg-butter font-display text-4xl text-ink sm:size-28 sm:text-5xl">
                    {formatPrice(price, settings.currency)}
                  </span>
                )}
              </div>
              <div>
                <p className="inline-block rotate-[-2deg] bg-tomato px-3 py-1 text-sm font-bold">{t.offerKicker}</p>
                <h2 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">{text.name}</h2>
                <p className="mt-3 max-w-md text-cream/75">{text.description}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    add(buildLine(p, 0, p.options.map(() => 0), p.weightStep ?? 1, false));
                    flyToTray(e.currentTarget);
                  }}
                  className="press mt-6 inline-flex h-13 items-center gap-2 rounded-md border-2 border-cream bg-butter px-6 font-bold text-ink shadow-[4px_4px_0_var(--color-cream)] active:shadow-[1px_1px_0_var(--color-cream)]"
                >
                  <PlusIcon className="size-5" />
                  {t.offerCta}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
