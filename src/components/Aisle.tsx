"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { categoryName, type Dict } from "@/lib/i18n";
import type { Category, Product } from "@/lib/types";
import { cookingMethod, SnowflakeIcon } from "./FreezerIcons";
import { FrozenPack } from "./FrozenPack";
import { useI18n } from "./I18nProvider";

const ALL = "all";

type Group = { id: string; category?: Category; products: Product[] };

/** The frozen aisle: hanging signs pick a freezer, and each freezer's glass doors slide open on its shelves. */
export function Aisle({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang, t } = useI18n();
  const [active, setActive] = useState(ALL);

  // one freezer per category that has something in it; dishes of a deleted category get their own
  const groups = useMemo(() => {
    const out: Group[] = categories.map((c) => ({ id: c.id, category: c, products: products.filter((p) => p.category === c.id) }));
    const known = new Set(categories.map((c) => c.id));
    const loose = products.filter((p) => !known.has(p.category));
    if (loose.length) out.push({ id: "other", products: loose });
    return out.filter((g) => g.products.length);
  }, [products, categories]);

  const signs = [
    { id: ALL, label: t.all, Icon: SnowflakeIcon, count: products.length },
    ...groups.map((g) => ({
      id: g.id,
      label: g.category ? categoryName(g.category, lang) : t.all,
      Icon: cookingMethod(g.id, t).Icon,
      count: g.products.length,
    })),
  ];
  const shown = active === ALL ? groups : groups.filter((g) => g.id === active);

  return (
    <section id="menu" className="bg-ice pt-12 pb-14 sm:pt-16 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-[2.6rem] leading-none font-extrabold tracking-tight sm:text-6xl">{t.menuTitle}</h2>
        <p className="mt-3 max-w-xl text-navy-2">{t.menuHint}</p>

        {/* aisle signs hanging from the ceiling */}
        <div role="tablist" aria-label={t.menuTitle} className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:gap-3 sm:px-0">
          {signs.map((s) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(s.id)}
                className="group flex shrink-0 flex-col items-center outline-offset-4"
              >
                <span aria-hidden className="flex h-4 w-[70%] justify-between">
                  <span className="w-px bg-navy-3" />
                  <span className="w-px bg-navy-3" />
                </span>
                <span
                  className={`flex items-center gap-2 border-b-4 px-3 py-2 font-display text-[0.95rem] font-bold whitespace-nowrap transition-all ${
                    on
                      ? "border-cherry-deep bg-cherry text-white shadow-[0_8px_22px_-6px_rgba(224,24,47,0.6)]"
                      : "border-navy bg-white text-navy group-hover:-translate-y-0.5 group-hover:bg-flash-soft"
                  }`}
                >
                  <s.Icon className="size-[1.1rem]" />
                  {s.label}
                  <span className={`grid h-5 min-w-5 place-items-center px-1 font-poster text-xs ${on ? "bg-flash text-navy" : "bg-navy text-white"}`}>{s.count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div key={active} className="mx-auto mt-6 max-w-6xl space-y-12 px-2 sm:px-4">
        {shown.map((g) => (
          <Freezer key={g.id} group={g} title={g.category ? categoryName(g.category, lang) : t.all} t={t} />
        ))}
      </div>
    </section>
  );
}

/** One upright freezer: a lit sign on top, shelves of boxes, and two glass doors that slide apart once it's in view. */
function Freezer({ group, title, t }: { group: Group; title: string; t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { Icon } = cookingMethod(group.id, t);
  const isWide = (p: Product) => p.featured && p.available;
  const slots = group.products.reduce((n, p) => n + (isWide(p) ? 2 : 1), 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setOpen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOpen(true), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} aria-label={title} className="pop-in">
      <header className="flex h-14 items-center gap-3 rounded-t-[14px] bg-navy px-3 text-white sm:h-16 sm:px-4">
        <span className="grid size-9 shrink-0 place-items-center bg-cherry">
          <Icon className="size-5" />
        </span>
        <h3 className="min-w-0 truncate font-display text-xl font-extrabold sm:text-2xl">{title}</h3>
        <span className="text-sm text-sky">{t.items(group.products.length)}</span>
        <span className="register led ms-auto hidden rounded-[3px] px-2 py-0.5 font-poster text-sm sm:block" dir="ltr">
          −18°C
        </span>
      </header>

      <div className="steel px-1.5 pb-1.5 sm:px-2.5 sm:pb-2.5">
        <div className="freezer-inside relative overflow-hidden">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {group.products.map((p) => {
              const wide = isWide(p);
              return (
                <li key={p.id} className={wide ? "col-span-2" : ""}>
                  <FrozenPack product={p} category={group.category} wide={wide} />
                </li>
              );
            })}
            {/* empty shelf space, so every row's shelf runs the full width at 2, 3 and 4 columns */}
            {[0, 1, 2].map((i) => {
              const gap = (cols: number) => (cols - (slots % cols)) % cols;
              const show = `${i < gap(2) ? "flex" : "hidden"} ${i < gap(3) ? "sm:flex" : "sm:hidden"} ${i < gap(4) ? "lg:flex" : "lg:hidden"}`;
              return (
                <li key={`empty-${i}`} aria-hidden className={`${show} flex-col justify-end`}>
                  <span className="shelf-lip mt-2 h-14" />
                </li>
              );
            })}
          </ul>

          {/* the sliding glass doors, purely for show */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {(["door-a left-0 border-e-2", "door-b right-0 border-s-2"] as const).map((cls, i) => (
              <span key={cls} className={`door frost absolute inset-y-0 w-1/2 border-white/80 ${cls} ${open ? "is-open" : ""}`}>
                <span className={`chrome-bar absolute top-1/2 h-24 w-2 -translate-y-1/2 rounded-full ${i ? "left-3" : "right-3"}`} />
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* the kick plate and its vents */}
      <div className="h-5 rounded-b-[8px] bg-navy bg-[repeating-linear-gradient(90deg,transparent_0_10px,rgba(255,255,255,0.12)_10px_13px)] bg-[length:100%_6px] bg-center bg-no-repeat" />
    </section>
  );
}
