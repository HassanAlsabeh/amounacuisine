"use client";

import { useState } from "react";
import type { OptionGroupRow } from "@/server/db/schema";
import { api, type Category, type Product, type ProductInput } from "./api";
import { Bilingual, Button, Field, Icon, ImageInput, inputClass, Sheet, Switch, useConfirm, useToast } from "./ui";

type VariantInput = ProductInput["variants"][number];

const emptyInput = (categoryId: string, travelFee: number | null): ProductInput => ({
  categoryId,
  emoji: "",
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  noteAr: "",
  noteEn: "",
  storyAr: "",
  storyEn: "",
  ingredientsAr: "",
  ingredientsEn: "",
  variants: [{ labelAr: "", labelEn: "", price: 0, travelFee }],
  choice: null,
  options: [],
  weightStep: null,
  sizeGuide: false,
  available: true,
  featured: false,
  image: null,
});

function toInput(p: Product): ProductInput {
  // products saved before option groups existed have a single `choice`
  const options: OptionGroupRow[] = p.options?.length
    ? p.options
    : p.choice
      ? [{ ...p.choice, options: p.choice.options.map((o) => ({ ...o, prices: [0] })) }]
      : [];
  return structuredClone({
    categoryId: p.categoryId,
    emoji: p.emoji,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    descriptionAr: p.descriptionAr,
    descriptionEn: p.descriptionEn,
    noteAr: p.noteAr,
    noteEn: p.noteEn,
    storyAr: p.storyAr ?? "",
    storyEn: p.storyEn ?? "",
    ingredientsAr: p.ingredientsAr ?? "",
    ingredientsEn: p.ingredientsEn ?? "",
    variants: p.variants.map((v) => ({ ...v, travelFee: v.travelFee ?? null })),
    choice: null,
    options,
    weightStep: p.weightStep ?? null,
    sizeGuide: p.sizeGuide ?? false,
    available: p.available,
    featured: p.featured,
    image: p.image,
  });
}

/** One extra price per size; a shorter list means its first price applies to every size. */
const pricesFor = (prices: number[], sizes: number) => Array.from({ length: sizes }, (_, i) => prices[i] ?? prices[0] ?? 0);

const WEIGHT_STEPS = [
  { value: 0.25, label: "250 g steps (250 g, 500 g, 750 g, 1 kg…)" },
  { value: 0.5, label: "500 g steps (½ kg, 1 kg, 1½ kg…)" },
  { value: 1, label: "1 kg steps" },
];

/**
 * Create or edit one product. `product` undefined means "new product" in
 * `defaultCategoryId`.
 */
export function ProductEditor({
  product,
  defaultCategoryId,
  categories,
  currency,
  defaultTravelFee,
  onClose,
  onSaved,
  onDeleted,
}: {
  product?: Product;
  defaultCategoryId: string;
  categories: Category[];
  currency: string;
  defaultTravelFee: number | null;
  onClose: () => void;
  onSaved: (p: Product) => void;
  onDeleted: (id: string) => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [initial] = useState<ProductInput>(() => (product ? toInput(product) : emptyInput(defaultCategoryId, defaultTravelFee)));
  const [form, setForm] = useState<ProductInput>(initial);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const close = async () => {
    if (dirty && !(await confirm("Discard your unsaved changes to this product?", "Discard"))) return;
    onClose();
  };

  const save = async () => {
    setBusy(true);
    try {
      const saved = product
        ? await api<Product>(`/products/${product.id}`, { method: "PUT", body: form })
        : await api<Product>("/products", { method: "POST", body: form });
      toast(product ? "Product saved" : "Product added");
      onSaved(saved);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!product || !(await confirm(`Delete “${product.nameAr}”? This can't be undone.`))) return;
    setBusy(true);
    try {
      await api(`/products/${product.id}`, { method: "DELETE" });
      toast("Product deleted");
      onDeleted(product.id);
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(false);
    }
  };

  /* ----- sizes; option prices follow their size when sizes move or go ----- */

  const sizes = form.variants.length;
  const updateVariant = (i: number, patch: Partial<VariantInput>) => set("variants", form.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const reshapePrices = (fn: (prices: number[]) => number[]) =>
    form.options.map((g) => ({ ...g, options: g.options.map((o) => ({ ...o, prices: fn(pricesFor(o.prices, sizes)) })) }));

  const moveVariant = (i: number, d: -1 | 1) => {
    const swap = <T,>(list: T[]) => {
      const next = [...list];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    };
    setForm((f) => ({ ...f, variants: swap(f.variants), options: reshapePrices(swap) }));
  };
  const removeVariant = (i: number) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, j) => j !== i), options: reshapePrices((p) => p.filter((_, j) => j !== i)) }));
  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { labelAr: "", labelEn: "", price: 0, travelFee: defaultTravelFee }],
      // a new size starts with no extra charge for any option
      options: reshapePrices((p) => [...p, 0]),
    }));

  /* ----- option groups ----- */

  const setGroups = (options: OptionGroupRow[]) => set("options", options);
  const updateGroup = (gi: number, patch: Partial<OptionGroupRow>) => setGroups(form.options.map((g, j) => (j === gi ? { ...g, ...patch } : g)));
  const updateOption = (gi: number, oi: number, patch: Partial<OptionGroupRow["options"][number]>) =>
    updateGroup(gi, { options: form.options[gi].options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) });
  const moveGroup = (gi: number, d: -1 | 1) => {
    const next = [...form.options];
    [next[gi], next[gi + d]] = [next[gi + d], next[gi]];
    setGroups(next);
  };
  const newOption = () => ({ ar: "", en: "", prices: Array(sizes).fill(0) });

  const byWeight = form.weightStep !== null;

  return (
    <Sheet
      open
      onClose={close}
      title={product ? `Edit · ${product.nameAr}` : "New product"}
      footer={
        <div className="flex items-center justify-between gap-2">
          {product ? (
            <Button variant="danger" onClick={remove} disabled={busy}>
              <Icon name="trash" className="h-4 w-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} busy={busy} disabled={!dirty && !!product}>
              {product ? "Save" : "Add product"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Section title="Photo & visibility">
          <ImageInput
            value={form.image?.src ?? ""}
            onChange={(src) => set("image", src ? { src, alt: form.nameEn || form.nameAr, credit: "", link: "" } : null)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow label="Available" hint="Off shows it as “currently unavailable”" checked={form.available} onChange={(v) => set("available", v)} />
            <ToggleRow label="Best seller" hint="Shows the “best seller” badge; best sellers with photos are picked for the homepage" checked={form.featured} onChange={(v) => set("featured", v)} />
          </div>
        </Section>

        <Section title="Details" description="Shown on the product card.">
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <Field label="Category">
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputClass}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.nameAr} — {c.nameEn}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Emoji" hint="Shown if there's no photo">
              <input value={form.emoji} onChange={(e) => set("emoji", e.target.value)} className={`${inputClass} text-center text-lg`} maxLength={16} />
            </Field>
          </div>
          <Bilingual label="Name" ar={form.nameAr} en={form.nameEn} onAr={(v) => set("nameAr", v)} onEn={(v) => set("nameEn", v)} />
          <Bilingual
            label="Short description"
            multiline
            ar={form.descriptionAr}
            en={form.descriptionEn}
            onAr={(v) => set("descriptionAr", v)}
            onEn={(v) => set("descriptionEn", v)}
          />
          <Bilingual
            label="Note"
            hint="Short highlighted line, e.g. “Free delivery with the tin!” or “Back in a few days”"
            ar={form.noteAr}
            en={form.noteEn}
            onAr={(v) => set("noteAr", v)}
            onEn={(v) => set("noteEn", v)}
          />
        </Section>

        <Section title="Product details page" description="Shown when a customer taps the product: what it is, how it's made, how to eat it.">
          <Bilingual
            label="Ingredients"
            multiline
            placeholders={{ ar: "مشمش وسكر بس، بدون مواد حافظة…", en: "Apricots and sugar, no preservatives…" }}
            ar={form.ingredientsAr}
            en={form.ingredientsEn}
            onAr={(v) => set("ingredientsAr", v)}
            onEn={(v) => set("ingredientsEn", v)}
          />
          <Bilingual
            label="About this product"
            multiline
            hint="The story, how it's cooked, tips. Leave an empty line between paragraphs."
            ar={form.storyAr}
            en={form.storyEn}
            onAr={(v) => set("storyAr", v)}
            onEn={(v) => set("storyEn", v)}
          />
        </Section>

        <Section
          title="Sold by weight"
          description="For awarma, kishk…: customers pick any amount (250 g, 1½ kg, 4½ kg…) and the price is per kilo."
          action={<Switch label="Sold by weight" checked={byWeight} onChange={(on) => set("weightStep", on ? 0.5 : null)} />}
        >
          {byWeight && (
            <Field label="Customers choose the amount in">
              <select value={form.weightStep ?? 0.5} onChange={(e) => set("weightStep", Number(e.target.value))} className={inputClass}>
                {WEIGHT_STEPS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </Section>

        <Section
          title={byWeight ? "Price per kilo" : "Sizes & prices"}
          description={`Prices in ${currency}. A price of 0 shows “price on WhatsApp” and is confirmed with the customer. The first size is selected by default. Travel fee: extra for travel packaging per ${byWeight ? "kilo" : "jar"} — leave empty if this item can't be packed for travel.`}
        >
          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_1fr_6rem_6rem_5.5rem] gap-2 px-1 text-xs font-semibold text-muted sm:grid">
              <span>Size (Arabic)</span>
              <span>Size (English)</span>
              <span>Price</span>
              <span>✈️ Travel fee</span>
              <span />
            </div>
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-xl bg-bg p-2 sm:grid-cols-[1fr_1fr_6rem_6rem_5.5rem] sm:bg-transparent sm:p-0">
                <input dir="rtl" value={v.labelAr} placeholder="مرطبان كيلو" onChange={(e) => updateVariant(i, { labelAr: e.target.value })} className={inputClass} aria-label="Size in Arabic" />
                <input value={v.labelEn} placeholder="1 kg jar" onChange={(e) => updateVariant(i, { labelEn: e.target.value })} className={inputClass} aria-label="Size in English" />
                <MoneyInput value={v.price} currency={currency} label="Price" onChange={(price) => updateVariant(i, { price: price ?? NaN })} />
                <MoneyInput
                  value={v.travelFee ?? null}
                  currency={currency}
                  label="Travel packaging fee"
                  placeholder="none"
                  onChange={(travelFee) => updateVariant(i, { travelFee })}
                />
                <div className="col-span-2 flex items-center justify-end gap-0.5 sm:col-span-1">
                  <IconButton icon="up" label="Move up" disabled={i === 0} onClick={() => moveVariant(i, -1)} />
                  <IconButton icon="down" label="Move down" disabled={i === sizes - 1} onClick={() => moveVariant(i, 1)} />
                  <IconButton icon="trash" label="Remove size" disabled={sizes === 1} onClick={() => removeVariant(i)} />
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" onClick={addVariant}>
            <Icon name="plus" className="h-4 w-4" /> Add size
          </Button>
        </Section>

        <Section
          title="Customer options"
          description="Choices the customer makes, like spice level, garlic, extra walnut, sour or less sour. The first option is the default. An option can add to the price (or lower it with a minus), per size."
        >
          {form.options.length === 0 && <p className="text-sm text-muted">No options: customers just pick a size.</p>}
          {form.options.map((g, gi) => (
            <div key={gi} className="space-y-3 rounded-xl bg-bg p-3 ring-1 ring-line">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Bilingual
                    label={`Question ${gi + 1}`}
                    placeholders={{ ar: "نكهة الحر", en: "Spice level" }}
                    ar={g.labelAr}
                    en={g.labelEn}
                    onAr={(v) => updateGroup(gi, { labelAr: v })}
                    onEn={(v) => updateGroup(gi, { labelEn: v })}
                  />
                </div>
                <div className="flex pt-5">
                  <IconButton icon="up" label="Move question up" disabled={gi === 0} onClick={() => moveGroup(gi, -1)} />
                  <IconButton icon="down" label="Move question down" disabled={gi === form.options.length - 1} onClick={() => moveGroup(gi, 1)} />
                  <IconButton icon="trash" label="Remove question" onClick={() => setGroups(form.options.filter((_, j) => j !== gi))} />
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold">Answers</span>
                {g.options.map((o, oi) => {
                  const prices = pricesFor(o.prices, sizes);
                  return (
                    <div key={oi} className="space-y-2 rounded-lg bg-panel p-2 ring-1 ring-line">
                      <div className="grid grid-cols-[1fr_1fr_2.25rem] gap-2">
                        <input
                          dir="rtl"
                          value={o.ar}
                          placeholder={oi === 0 ? "عادي" : "اكسترا جوز"}
                          onChange={(e) => updateOption(gi, oi, { ar: e.target.value })}
                          className={inputClass}
                          aria-label="Answer in Arabic"
                        />
                        <input
                          value={o.en}
                          placeholder={oi === 0 ? "Regular" : "Extra walnut"}
                          onChange={(e) => updateOption(gi, oi, { en: e.target.value })}
                          className={inputClass}
                          aria-label="Answer in English"
                        />
                        <IconButton
                          icon="trash"
                          label="Remove answer"
                          disabled={g.options.length === 1}
                          onClick={() => updateGroup(gi, { options: g.options.filter((_, j) => j !== oi) })}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="font-semibold">Extra price{oi === 0 ? " (default answer — usually 0)" : ""}:</span>
                        {prices.map((price, vi) => (
                          <label key={vi} className="flex items-center gap-1.5">
                            <span dir="auto" className="max-w-32 truncate">
                              {form.variants[vi].labelEn || form.variants[vi].labelAr || `Size ${vi + 1}`}
                            </span>
                            <span className="w-24">
                              <MoneyInput
                                value={price}
                                currency={currency}
                                label="Extra price"
                                allowNegative
                                onChange={(n) => updateOption(gi, oi, { prices: prices.map((x, j) => (j === vi ? (n ?? 0) : x)) })}
                              />
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <Button size="sm" onClick={() => updateGroup(gi, { options: [...g.options, newOption()] })}>
                  <Icon name="plus" className="h-4 w-4" /> Add answer
                </Button>
              </div>
            </div>
          ))}
          <Button size="sm" onClick={() => setGroups([...form.options, { labelAr: "", labelEn: "", options: [newOption()] }])}>
            <Icon name="plus" className="h-4 w-4" /> Add question
          </Button>
        </Section>
      </div>
    </Sheet>
  );
}

function MoneyInput({
  value,
  currency,
  label,
  placeholder,
  allowNegative,
  onChange,
}: {
  value: number | null;
  currency: string;
  label: string;
  placeholder?: string;
  allowNegative?: boolean;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min={allowNegative ? undefined : 0}
        step="0.5"
        value={value === null || Number.isNaN(value) ? "" : value}
        placeholder={placeholder}
        onChange={(e) => onChange(Number.isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber)}
        className={`${inputClass} pe-7`}
        aria-label={label}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">{currency}</span>
    </div>
  );
}

function Section({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-panel p-5 ring-1 ring-line">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-bg px-4 py-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <Switch label={label} checked={checked} onChange={onChange} />
    </div>
  );
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-bg disabled:opacity-30 disabled:hover:bg-transparent ${
        active ? "text-accent" : "text-muted hover:text-ink"
      }`}
    >
      <Icon name={icon} className="h-4.5 w-4.5" filled={active && icon === "star"} />
    </button>
  );
}
