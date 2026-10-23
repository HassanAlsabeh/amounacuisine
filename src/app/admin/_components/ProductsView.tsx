"use client";

import { useMemo, useState } from "react";
import { api, type Category, type Product } from "./api";
import { IconButton, ProductEditor } from "./ProductEditor";
import { Button, Icon, inputClass, PageHeader, Switch, useToast } from "./ui";

/** Fold Arabic letter variants so "مونه" finds "مونة" (same rule as the shop's search). */
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ً-ْ]/g, "")
    .trim();
}

export function ProductsView({
  products,
  setProducts,
  categories,
  currency,
  defaultTravelFee,
}: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  currency: string;
  defaultTravelFee: number | null;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const groups = useMemo(() => {
    const q = normalize(query);
    return categories
      .filter((c) => categoryFilter === "all" || c.id === categoryFilter)
      .map((c) => ({
        category: c,
        items: products
          .filter((p) => p.categoryId === c.id)
          .filter((p) => !q || normalize(`${p.nameAr} ${p.nameEn} ${p.descriptionAr} ${p.descriptionEn}`).includes(q))
          .sort((a, b) => a.sort - b.sort),
      }))
      .filter((g) => g.items.length > 0 || (!q && categoryFilter !== "all"));
  }, [products, categories, query, categoryFilter]);

  const replace = (p: Product) => setProducts((all) => (all.some((x) => x.id === p.id) ? all.map((x) => (x.id === p.id ? p : x)) : [...all, p]));

  const toggle = async (p: Product, patch: Partial<Pick<Product, "available" | "featured">>) => {
    replace({ ...p, ...patch }); // optimistic
    try {
      replace(await api<Product>(`/products/${p.id}`, { method: "PATCH", body: patch }));
    } catch (e) {
      replace(p);
      toast((e as Error).message, "error");
    }
  };

  const move = async (items: Product[], index: number, d: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + d]] = [next[index + d], next[index]];
    const before = products;
    const position = new Map(next.map((p, i) => [p.id, i]));
    setProducts((all) => all.map((p) => (position.has(p.id) ? { ...p, sort: position.get(p.id)! } : p)));
    try {
      await api("/products/reorder", { method: "POST", body: { ids: next.map((p) => p.id) } });
    } catch (e) {
      setProducts(before);
      toast((e as Error).message, "error");
    }
  };

  const total = products.length;
  const unavailable = products.filter((p) => !p.available).length;

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${total} products · ${unavailable} unavailable`}
        actions={
          <Button variant="primary" onClick={() => setEditing("new")} disabled={!categories.length}>
            <Icon name="plus" className="h-4 w-4" /> Add product
          </Button>
        }
      />

      <div className="sticky top-0 z-20 -mx-4 mb-6 flex flex-col gap-2 bg-bg/95 px-4 py-3 backdrop-blur sm:flex-row md:top-0">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products in Arabic or English…" className={`${inputClass} ps-9`} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`${inputClass} sm:w-64`}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.nameEn || c.nameAr}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 && (
        <div className="rounded-2xl bg-panel py-16 text-center text-sm text-muted ring-1 ring-line">No products match “{query}”.</div>
      )}

      <div className="space-y-8">
        {groups.map(({ category, items }) => (
          <section key={category.id}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
              {category.emoji} {category.nameEn || category.nameAr}
              <span dir="rtl" className="font-medium text-muted">
                · {category.nameAr}
              </span>
              <span className="ms-auto text-xs font-medium text-muted">{items.length}</span>
            </h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-panel shadow-panel ring-1 ring-line">
              {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">No products in this category yet.</li>}
              {items.map((p, i) => (
                <li key={p.id} className={`flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 ${p.available ? "" : "bg-bg/60"}`}>
                  <button type="button" onClick={() => setEditing(p)} className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg text-xl ring-1 ring-line">
                      {p.image?.src ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnails from any host
                        <img src={p.image.src} alt="" className={`h-full w-full object-cover ${p.available ? "" : "grayscale"}`} loading="lazy" />
                      ) : (
                        p.emoji
                      )}
                    </span>
                    <span className="min-w-0">
                      <span dir="rtl" className="block truncate text-sm font-semibold">
                        {p.nameAr}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {p.nameEn || "—"} · {priceRange(p, currency)}
                        {!p.available && <span className="ms-1.5 font-semibold text-danger">· Unavailable</span>}
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <IconButton icon="star" label={p.featured ? "Remove best seller" : "Mark as best seller"} active={p.featured} onClick={() => toggle(p, { featured: !p.featured })} />
                    <Switch label="Available" checked={p.available} onChange={(v) => toggle(p, { available: v })} />
                    <div className="hidden sm:flex">
                      <IconButton icon="up" label="Move up" disabled={i === 0 || !!query} onClick={() => move(items, i, -1)} />
                      <IconButton icon="down" label="Move down" disabled={i === items.length - 1 || !!query} onClick={() => move(items, i, 1)} />
                    </div>
                    <IconButton icon="edit" label="Edit" onClick={() => setEditing(p)} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {editing && (
        <ProductEditor
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? undefined : editing}
          defaultCategoryId={categoryFilter !== "all" ? categoryFilter : (categories[0]?.id ?? "")}
          categories={categories}
          currency={currency}
          defaultTravelFee={defaultTravelFee}
          onClose={() => setEditing(null)}
          onSaved={(p) => {
            replace(p);
            setEditing(null);
          }}
          onDeleted={(id) => {
            setProducts((all) => all.filter((p) => p.id !== id));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function priceRange(p: Product, currency: string) {
  const prices = p.variants.map((v) => v.price);
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const range = lo === hi ? `${lo}${currency}` : `${lo}–${hi}${currency}`;
  return p.weightStep ? `${range} / kg` : range;
}
