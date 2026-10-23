"use client";

import Image from "next/image";
import { categoryName, productText, settingsText } from "@/lib/i18n";
import { buildLine, formatPrice, isPriced, whatsappUrl } from "@/lib/order";
import { packIntoBox } from "@/lib/pack";
import { toneAt } from "@/lib/tones";
import type { Category, Product, Settings } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import { ArrowIcon, PlusIcon } from "./Icons";
import { useMenuFilter } from "./MenuFilter";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * The top tier of the box: the welcome, the portrait, three stat compartments, the deal and one
 * compartment per way of cooking. Phones stack it two compartments wide; desktops lay it on 12 columns.
 */
export function TopTier({ settings, products, categories }: { settings: Settings; products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const s = settingsText(settings, lang);
  const deal = products.find((p) => p.featured && p.available);

  const stats = [
    [t.statFollowers, t.statFollowersLabel, "bg-butter"],
    [t.statHands, t.statHandsLabel, "bg-pista"],
    [t.statFrozen, t.statFrozenLabel, "bg-apri"],
  ];

  return (
    <section className="bento grid grid-cols-2 lg:grid-cols-12">
      {/* the portrait compartment */}
      <div className="grid-paper relative col-span-2 h-80 overflow-hidden bg-lav sm:h-96 lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1 lg:h-auto lg:min-h-[30rem]">
        <Image src="/portrait.png" alt={`${settings.brandLatin}: ${t.portraitCaption}`} fill sizes="(min-width: 1024px) 460px, 90vw" priority className="object-contain object-bottom px-6 pt-6" />
        <p className="absolute start-3 bottom-3 flex flex-col rounded-cell border border-line bg-box px-3 py-2 leading-tight">
          <span className="font-display text-sm font-semibold">{t.portraitCaption}</span>
          <span className="text-xs text-ink-2" dir="ltr">
            @amouna_cuisine
          </span>
        </p>
      </div>

      {/* the welcome */}
      <div className="col-span-2 flex flex-col justify-center p-5 sm:p-8 lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:p-10">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-2">
          <span aria-hidden className="size-2.5 rounded-[2px] bg-apri-deep" />
          {t.heroKicker}
        </p>
        <h1 className="mt-4 font-display text-[2.6rem] leading-[1.12] font-extrabold tracking-tight sm:text-6xl lg:text-[4.2rem]">
          {t.heroTitle}
          <span className="mt-1 block">
            <span className="box-decoration-clone bg-butter px-2">{t.heroTitleAccent}</span>
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-[1.02rem] leading-8 text-ink-2">{s.welcome}</p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a href="#menu" className="group inline-flex h-12 items-center gap-3 rounded-cell bg-ink px-5 font-display font-semibold text-box hover:bg-ink-2">
            {t.browse}
            <ArrowIcon className="h-4 w-7 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
          </a>
          <a
            href={whatsappUrl(settings.whatsappNumber, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-cell border border-line px-4 font-display font-semibold hover:bg-pista"
          >
            <WhatsAppIcon className="size-5 text-whatsapp" />
            {t.orderOnWhatsapp}
          </a>
        </div>
      </div>

      {/* three stat compartments */}
      <dl className="hairlines col-span-2 grid grid-cols-3 lg:col-span-7 lg:col-start-1 lg:row-start-3">
        {stats.map(([value, label, tone]) => (
          <div key={label} className={`px-3 py-4 sm:px-6 sm:py-6 ${tone}`}>
            <dt className="sr-only">{label}</dt>
            <dd>
              <span className="block font-display text-xl leading-none font-bold whitespace-nowrap sm:text-3xl" dir="auto">
                {value}
              </span>
              <span className="mt-2 block text-xs leading-snug text-ink-2 sm:text-sm">{label}</span>
            </dd>
          </div>
        ))}
      </dl>

      {deal && <DealCompartment product={deal} />}

      <ReadyCompartments products={products} categories={categories} wide={!deal} />
    </section>
  );
}

/** The kitchen's deal, in the one dark compartment of the box. */
function DealCompartment({ product: p }: { product: Product }) {
  const { lang, t } = useI18n();
  const { add, settings } = useCart();
  const text = productText(p, lang);
  const price = p.variants[0].price;

  return (
    <article className="col-span-2 flex gap-4 bg-ink p-4 text-box sm:p-5 lg:col-span-4 lg:col-start-9 lg:row-start-4 lg:flex-col">
      <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-cell sm:w-40 lg:aspect-[2/1] lg:w-full">
        {p.image ? (
          <Image src={p.image.src} alt={p.image.alt || text.name} fill sizes="(min-width: 1024px) 380px, 160px" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center bg-apri text-5xl">{p.emoji}</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="self-start rounded-[3px] bg-butter px-2 py-0.5 text-xs font-bold text-ink">{t.dealKicker}</p>
        <h2 className="mt-2 font-display text-lg leading-snug font-bold sm:text-xl">{text.name}</h2>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
          {isPriced(price) && <span className="font-display text-3xl leading-none font-extrabold text-butter">{formatPrice(price, settings.currency)}</span>}
          <button
            type="button"
            onClick={(e) => {
              add(
                buildLine(
                  p,
                  0,
                  p.options.map(() => 0),
                  p.weightStep ?? 1,
                  false,
                ),
              );
              packIntoBox(e.currentTarget, p.image?.src ?? null);
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-cell bg-butter px-3.5 font-display text-sm font-semibold text-ink transition-transform hover:bg-apri active:scale-95"
          >
            <PlusIcon className="size-4" />
            {t.offerCta}
          </button>
        </div>
      </div>
    </article>
  );
}

/** One compartment per way of cooking; tapping one opens that part of the menu. */
function ReadyCompartments({ products, categories, wide }: { products: Product[]; categories: Category[]; wide: boolean }) {
  const { lang, t } = useI18n();
  const { pick } = useMenuFilter();

  // the deal has its own compartment, so a category holding only deals is left out
  const ready = categories.map((c, i) => ({ c, tone: toneAt(i), items: products.filter((p) => p.category === c.id && !p.featured) })).filter((r) => r.items.length);

  return (
    <div className={`hairlines col-span-2 flex flex-col lg:col-start-1 lg:row-start-4 ${wide ? "lg:col-span-12" : "lg:col-span-8"}`}>
      <h2 className="px-4 py-3 font-display text-sm font-semibold sm:px-5">{t.readyTitle}</h2>
      <div className="hairlines flex flex-1 flex-wrap bg-line">
        {ready.map(({ c, tone, items }) => {
          const photo = items.find((p) => p.image)?.image;
          return (
            <button key={c.id} type="button" onClick={() => pick(c.id, true)} className={`group flex min-h-36 grow basis-[45%] flex-col p-4 text-start sm:basis-0 sm:p-5 ${tone.bg}`}>
              <span className="relative block size-14 overflow-hidden rounded-cell lg:size-16 border border-line bg-box transition-transform group-hover:-rotate-3">
                {photo ? <Image src={photo.src} alt="" fill sizes="56px" className="object-cover" /> : <span className="grid h-full place-items-center text-2xl">{c.emoji}</span>}
              </span>
              <span className="mt-auto pt-3 font-display text-base leading-tight font-bold sm:text-lg">{categoryName(c, lang)}</span>
              <span className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${tone.deep}`}>
                {t.items(items.length)}
                <ArrowIcon className="h-3 w-5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
