"use client";

import { useMemo, useState } from "react";
import { api, type Product, type Settings } from "./api";
import { Bilingual, Card, Field, ImageInput, inputClass, PageHeader, SaveBar, Switch, useToast, useUnsavedWarning } from "./ui";

export function SettingsView({ settings, setSettings, products }: { settings: Settings; setSettings: (s: Settings) => void; products: Product[] }) {
  const toast = useToast();
  const [form, setForm] = useState<Settings>(settings);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);
  useUnsavedWarning(dirty);

  const set = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }));
  const setEn = (patch: Partial<Settings["en"]>) => setForm((f) => ({ ...f, en: { ...f.en, ...patch } }));
  const bi = (key: "siteName" | "brandName" | "brandSubtitle" | "tagline" | "welcome" | "noCallsNotice" | "deliveryNotice") => ({
    ar: form[key],
    en: form.en[key],
    onAr: (v: string) => set({ [key]: v }),
    onEn: (v: string) => setEn({ [key]: v }),
  });

  const save = async () => {
    setBusy(true);
    try {
      const saved = await api<Settings>("/settings", { method: "PUT", body: form });
      setSettings(saved);
      setForm(saved);
      toast("Settings saved — the website is updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title="Site settings" description="Brand, contact details and ordering rules shown across the website." />

      <div className="space-y-6">
        <Card title="Brand" description="Logo and the names shown in the header, page title and footer.">
          <ImageInput label="Logo / profile photo" round value={form.logo} onChange={(logo) => set({ logo })} />
          <Bilingual label="Website title" {...bi("siteName")} hint="Shown in the browser tab and when the site is shared." />
          <Bilingual label="Brand name" {...bi("brandName")} />
          <Bilingual label="Brand subtitle" {...bi("brandSubtitle")} hint="Small line under the brand name, e.g. وبنات عمها السبعة. Leave empty to hide it." />
          <Field label="Brand name in Latin letters" hint="Used in the page title and copyright line.">
            <input value={form.brandLatin} onChange={(e) => set({ brandLatin: e.target.value })} className={inputClass} />
          </Field>
          <Bilingual label="Tagline" {...bi("tagline")} />
          <Bilingual label="Welcome message" multiline {...bi("welcome")} />
        </Card>

        <Card title="Contact & ordering" description="Orders are sent to this WhatsApp number.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number" hint="Digits only with country code, e.g. 9613572560">
              <input inputMode="numeric" value={form.whatsappNumber} onChange={(e) => set({ whatsappNumber: e.target.value.replace(/\D/g, "") })} className={inputClass} />
            </Field>
            <Field label="Number as displayed" hint="How it appears on the site, e.g. 03 572 560">
              <input dir="ltr" value={form.whatsappDisplay} onChange={(e) => set({ whatsappDisplay: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Currency symbol">
              <input value={form.currency} onChange={(e) => set({ currency: e.target.value })} className={`${inputClass} w-24`} />
            </Field>
            <Field label="Instagram link" hint="Optional">
              <input value={form.instagramUrl} onChange={(e) => set({ instagramUrl: e.target.value.trim() })} placeholder="https://instagram.com/…" className={inputClass} />
            </Field>
            <Field label="TikTok link" hint="Optional">
              <input value={form.tiktokUrl ?? ""} onChange={(e) => set({ tiktokUrl: e.target.value.trim() })} placeholder="https://tiktok.com/@…" className={inputClass} />
            </Field>
            <Field label="Facebook link" hint="Optional">
              <input value={form.facebookUrl ?? ""} onChange={(e) => set({ facebookUrl: e.target.value.trim() })} placeholder="https://facebook.com/…" className={inputClass} />
            </Field>
          </div>
          <Bilingual label="“No calls” notice" {...bi("noCallsNotice")} />
          <Bilingual label="Delivery notice" {...bi("deliveryNotice")} />
        </Card>

        <Card
          title="Travel packaging"
          description="Customers choose regular or travel packaging on each item. The fee is set per size on each product (e.g. +1 for a jar, +0.5 for a small jar)."
          actions={
            <Switch
              label="Travel packaging"
              checked={form.travelPackaging.enabled}
              onChange={(enabled) => set({ travelPackaging: { ...form.travelPackaging, enabled } })}
            />
          }
        >
          {form.travelPackaging.enabled ? (
            <>
              <Field label={`Default fee for new sizes (${form.currency})`} hint="Pre-filled when you add a size to a product; existing sizes keep their own fee.">
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={Number.isNaN(form.travelPackaging.pricePerUnit) ? "" : form.travelPackaging.pricePerUnit}
                  onChange={(e) => set({ travelPackaging: { ...form.travelPackaging, pricePerUnit: e.target.valueAsNumber } })}
                  className={`${inputClass} w-32`}
                />
              </Field>
              <Bilingual
                label="Label"
                ar={form.travelPackaging.label}
                en={form.en.travelPackaging.label}
                onAr={(label) => set({ travelPackaging: { ...form.travelPackaging, label } })}
                onEn={(label) => setEn({ travelPackaging: { ...form.en.travelPackaging, label } })}
              />
              <Bilingual
                label="Explanation"
                ar={form.travelPackaging.hint}
                en={form.en.travelPackaging.hint}
                onAr={(hint) => set({ travelPackaging: { ...form.travelPackaging, hint } })}
                onEn={(hint) => setEn({ travelPackaging: { ...form.en.travelPackaging, hint } })}
              />
            </>
          ) : (
            <p className="text-sm text-muted">Turned off: customers won&apos;t see this option.</p>
          )}
        </Card>

        <Card title="Free delivery" description="Orders that include any of these products get free delivery.">
          <ProductPicker products={products} selected={form.freeDeliveryProductIds} onChange={(ids) => set({ freeDeliveryProductIds: ids })} />
        </Card>
      </div>

      <SaveBar visible={dirty} busy={busy} onSave={save} onDiscard={() => setForm(settings)} />
    </div>
  );
}

function ProductPicker({ products, selected, onChange }: { products: Product[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => !selected.includes(p.id) && `${p.nameAr} ${p.nameEn}`.toLowerCase().includes(q)).slice(0, 8);
  }, [products, selected, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selected.length === 0 && <span className="text-sm text-muted">No products selected.</span>}
        {selected.map((id) => {
          const p = products.find((x) => x.id === id);
          return (
            <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft py-1 ps-3 pe-1 text-sm font-medium text-accent-dark">
              {p ? `${p.emoji} ${p.nameEn || p.nameAr}` : `${id} (deleted)`}
              <button
                type="button"
                onClick={() => onChange(selected.filter((x) => x !== id))}
                aria-label="Remove"
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent/15"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <div className="relative sm:w-96">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a product to add…" className={inputClass} />
        {matches.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl bg-panel shadow-pop ring-1 ring-line">
            {matches.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange([...selected, p.id]);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
                >
                  <span>{p.emoji}</span>
                  <span className="truncate">{p.nameEn || p.nameAr}</span>
                  <span dir="rtl" className="ms-auto truncate text-xs text-muted">
                    {p.nameAr}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
