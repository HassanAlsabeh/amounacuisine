import type { Dict } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/order";
import type { Settings } from "@/lib/types";
import { PanIcon, RegisterIcon, SnowflakeIcon } from "./FreezerIcons";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** How to order, printed like the instructions panel on the back of a box. */
export function OrderSteps({ settings, t }: { settings: Settings; t: Dict }) {
  const steps = [
    { title: t.step1, text: t.step1Text, Icon: SnowflakeIcon },
    { title: t.step2, text: t.step2Text, Icon: RegisterIcon },
    { title: t.step3, text: t.step3Text, Icon: PanIcon },
  ];

  return (
    <section id="how" className="frost border-y-4 border-navy bg-frost py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="border-2 border-navy bg-white">
          <h2 className="bg-navy px-4 py-3 font-display text-3xl leading-tight font-extrabold text-white sm:px-6 sm:text-5xl">{t.howTitle}</h2>
          <ol className="grid divide-y-2 divide-navy/15 sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0 rtl:sm:divide-x-reverse">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 p-5 sm:flex-col sm:p-6">
                <span className="flex shrink-0 items-start gap-2 sm:items-center">
                  <span className="grid size-12 place-items-center bg-cherry font-poster text-3xl text-white">{i + 1}</span>
                  <s.Icon className="size-9 text-navy sm:size-10" />
                </span>
                <span>
                  <h3 className="font-display text-xl font-extrabold sm:text-2xl">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-2">{s.text}</p>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-8 text-center">
          <a
            href={whatsappUrl(settings.whatsappNumber, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-13 items-center gap-2 border-b-4 border-whatsapp-dark bg-whatsapp px-5 font-display text-lg font-bold text-white active:translate-y-0.5"
          >
            <WhatsAppIcon className="size-5" />
            {t.contact} · <span dir="ltr">{settings.whatsappDisplay}</span>
          </a>
        </p>
      </div>
    </section>
  );
}
