"use client";

import { useMemo, useState } from "react";
import { api, type TextEntry } from "./api";
import { Icon, inputClass, PageHeader, SaveBar, useToast, useUnsavedWarning } from "./ui";

type Values = { ar: Record<string, string>; en: Record<string, string> };

const valuesOf = (entries: TextEntry[]): Values => ({
  ar: Object.fromEntries(entries.map((e) => [e.key, e.values.ar])),
  en: Object.fromEntries(entries.map((e) => [e.key, e.values.en])),
});

/** "deliveryByArea" → "Delivery by area" */
function humanize(key: string) {
  const words = key.replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function TextsView({ entries, setEntries }: { entries: TextEntry[]; setEntries: (e: TextEntry[]) => void }) {
  const toast = useToast();
  const saved = useMemo(() => valuesOf(entries), [entries]);
  const [values, setValues] = useState<Values>(saved);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedWarning(dirty);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.key, humanize(e.key), e.defaults.ar, e.defaults.en, values.ar[e.key], values.en[e.key]].some((s) => s?.toLowerCase().includes(q)),
    );
  }, [entries, query, values]);

  const save = async () => {
    setBusy(true);
    try {
      await api("/texts", { method: "PUT", body: values });
      setEntries(entries.map((e) => ({ ...e, values: { ar: values.ar[e.key]?.trim() ?? "", en: values.en[e.key]?.trim() ?? "" } })));
      toast("Texts saved — the website is updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const changedCount = entries.filter((e) => values.ar[e.key]?.trim() || values.en[e.key]?.trim()).length;

  return (
    <div className="pb-24">
      <PageHeader
        title="Website texts"
        description={`Buttons, labels and messages across the site. Leave a field empty to keep the original wording (shown in grey). ${changedCount} customised.`}
      />

      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search texts…" className={`${inputClass} ps-9`} />
        </div>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-panel shadow-panel ring-1 ring-line">
        {visible.map((e) => {
          const custom = values.ar[e.key]?.trim() || values.en[e.key]?.trim();
          return (
            <li key={e.key} className="grid gap-2 px-4 py-4 lg:grid-cols-[12rem_1fr_1fr] lg:items-center lg:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{humanize(e.key)}</span>
                {custom && <span className="rounded bg-accent-soft px-1.5 text-[10px] font-bold text-accent-dark">EDITED</span>}
              </div>
              <input
                dir="rtl"
                value={values.ar[e.key] ?? ""}
                placeholder={e.defaults.ar}
                onChange={(ev) => setValues((v) => ({ ...v, ar: { ...v.ar, [e.key]: ev.target.value } }))}
                className={inputClass}
                aria-label={`${humanize(e.key)} in Arabic`}
              />
              <input
                value={values.en[e.key] ?? ""}
                placeholder={e.defaults.en}
                onChange={(ev) => setValues((v) => ({ ...v, en: { ...v.en, [e.key]: ev.target.value } }))}
                className={inputClass}
                aria-label={`${humanize(e.key)} in English`}
              />
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted">No texts match “{query}”.</li>}
      </ul>

      <SaveBar visible={dirty} busy={busy} onSave={save} onDiscard={() => setValues(saved)} />
    </div>
  );
}
