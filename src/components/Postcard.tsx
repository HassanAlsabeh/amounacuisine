"use client";

import Image from "next/image";
import { settingsText } from "@/lib/i18n";
import type { Customer } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";

/** The checkout form: an airmail postcard addressed to Amouna, with the customer's details as the sender. */
export function Postcard({ posted }: { posted: boolean }) {
  const { customer, setCustomer, settings } = useCart();
  const { lang, t } = useI18n();
  const s = settingsText(settings, lang);
  const now = new Date();
  const postmark = [now.getDate(), now.getMonth() + 1, now.getFullYear() % 100].map((n) => String(n).padStart(2, "0")).join(".");

  const set = (key: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer({ ...customer, [key]: e.target.value });
  const line = "block w-full border-0 border-b-2 border-dotted border-brown/45 bg-transparent px-0.5 pt-1 pb-0.5 text-base font-semibold outline-none placeholder:font-normal placeholder:text-brown-3 focus:border-solid focus:border-tomato";

  return (
    <section aria-label={t.postcardTitle} className={`postcard relative p-2 [background:repeating-linear-gradient(135deg,var(--color-tomato)_0_12px,var(--color-paper-3)_12px_18px,var(--color-teal)_18px_30px,var(--color-paper-3)_30px_36px)] ${posted ? "is-posted" : ""}`}>
      <div className="relative bg-paper-3 p-4 sm:p-5">
        {/* the stamp, cancelled by a Beirut postmark */}
        <div className="absolute end-3 top-3 rotate-3">
          <div className="perforated perforated-sm bg-white [filter:drop-shadow(0_1px_1px_rgb(59_36_23/0.3))]">
            <div className="flex w-16 flex-col items-center bg-mustard px-1 pt-1 pb-0.5">
              <span className="relative block size-11 overflow-hidden rounded-full bg-white">
                <Image src={settings.logo} alt="" fill sizes="44px" className="scale-[1.35] object-cover object-[50%_42%]" />
              </span>
              <span className="mt-0.5 text-[0.6rem] leading-tight font-extrabold text-brown">{t.stampCountry}</span>
            </div>
          </div>
          <div aria-hidden className="absolute -start-9 top-6 grid size-[4.5rem] -rotate-12 place-items-center rounded-full border-2 border-brown/55 text-center text-brown/70">
            <span className="leading-none">
              <span className="block text-[0.62rem] font-extrabold">{t.postmarkCity}</span>
              <span className="block font-sign text-[0.6rem]" dir="ltr">{postmark}</span>
            </span>
          </div>
        </div>

        <p className="pe-24 font-display text-2xl leading-tight text-tomato">{t.postcardTitle}</p>
        <p className="font-sign text-[0.65rem] text-brown-2">{t.postcardLabel}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-0">
          {/* address side */}
          <div className="space-y-3 sm:order-2 sm:border-s-2 sm:border-brown/25 sm:ps-5">
            <div className="text-sm">
              <span className="font-extrabold text-teal">{t.to}: </span>
              <span className="font-bold">{s.brandName}</span>
              <span className="block ps-6 text-brown-2">{s.brandSubtitle}</span>
              <span className="block ps-6">
                <span className="font-sign text-xs text-brown-2" dir="ltr">
                  +961 {settings.whatsappDisplay}
                </span>
              </span>
            </div>
            <label className="block">
              <span className="text-sm font-extrabold text-teal">{t.name}</span>
              <input value={customer.name} onChange={set("name")} placeholder={t.namePlaceholder} autoComplete="name" className={line} />
            </label>
            <label className="block">
              <span className="text-sm font-extrabold text-teal">{t.address}</span>
              <input value={customer.address} onChange={set("address")} placeholder={t.addressPlaceholder} autoComplete="street-address" className={line} />
            </label>
          </div>

          {/* message side */}
          <label className="block sm:order-1 sm:pe-5">
            <span className="text-sm font-extrabold text-teal">{t.notes}</span>
            <textarea
              value={customer.notes}
              onChange={set("notes")}
              placeholder={t.notesPlaceholder}
              rows={4}
              className="ruled block w-full resize-none bg-transparent px-0.5 text-base font-semibold outline-none placeholder:font-normal placeholder:text-brown-3"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
