import { SnowflakeIcon } from "./FreezerIcons";

/** The supermarket's scrolling yellow promo strip. The band runs left to right in both languages so the loop is seamless. */
export function Ticker({ text }: { text: string }) {
  const items = text.split("·").map((x) => x.trim()).filter(Boolean);
  // a long run, drawn twice so the second copy slides into the first one's place
  const run = [...items, ...items, ...items, ...items];

  return (
    <div dir="ltr" className="relative overflow-hidden border-b-4 border-navy bg-flash py-2.5">
      <p className="sr-only" dir="auto">{items.join(" · ")}</p>
      <div aria-hidden className="animate-ticker flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {run.map((item, i) => (
              <span key={i} className="flex items-center gap-4 pe-4 font-display text-lg font-extrabold whitespace-nowrap text-navy">
                <span dir="auto">{item}</span>
                <SnowflakeIcon className="size-4 text-cherry" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
