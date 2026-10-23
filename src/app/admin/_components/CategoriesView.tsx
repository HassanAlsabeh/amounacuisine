"use client";

import { useState } from "react";
import { api, type Category, type CategoryInput } from "./api";
import { IconButton } from "./ProductEditor";
import { Bilingual, Button, Field, Icon, inputClass, PageHeader, useConfirm, useToast } from "./ui";

const BLANK: CategoryInput = { nameAr: "", nameEn: "", emoji: "", color: "#b4532a" };

export function CategoriesView({ categories, setCategories }: { categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>> }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const move = async (index: number, d: -1 | 1) => {
    const next = [...categories];
    [next[index], next[index + d]] = [next[index + d], next[index]];
    const before = categories;
    setCategories(next.map((c, i) => ({ ...c, sort: i })));
    try {
      await api("/categories/reorder", { method: "POST", body: { ids: next.map((c) => c.id) } });
    } catch (e) {
      setCategories(before);
      toast((e as Error).message, "error");
    }
  };

  const remove = async (c: Category) => {
    if (!(await confirm(`Delete the category “${c.nameAr}”?`))) return;
    try {
      await api(`/categories/${c.id}`, { method: "DELETE" });
      setCategories((all) => all.filter((x) => x.id !== c.id));
      toast("Category deleted");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="The shelves of the shop. Order here is the order on the website."
        actions={
          <Button variant="primary" onClick={() => setEditing("new")} disabled={editing === "new"}>
            <Icon name="plus" className="h-4 w-4" /> Add category
          </Button>
        }
      />

      {editing === "new" && (
        <div className="mb-4">
          <CategoryForm
            initial={BLANK}
            submitLabel="Add category"
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              const created = await api<Category>("/categories", { method: "POST", body: input });
              setCategories((all) => [...all, created]);
              setEditing(null);
              toast("Category added");
            }}
          />
        </div>
      )}

      <ul className="space-y-2">
        {categories.map((c, i) =>
          editing === c.id ? (
            <li key={c.id}>
              <CategoryForm
                initial={{ nameAr: c.nameAr, nameEn: c.nameEn, emoji: c.emoji, color: c.color }}
                submitLabel="Save"
                onCancel={() => setEditing(null)}
                onSubmit={async (input) => {
                  const saved = await api<Category>(`/categories/${c.id}`, { method: "PUT", body: input });
                  setCategories((all) => all.map((x) => (x.id === c.id ? { ...x, ...saved } : x)));
                  setEditing(null);
                  toast("Category saved");
                }}
              />
            </li>
          ) : (
            <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-panel px-4 py-3 shadow-panel ring-1 ring-line">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${c.color}22` }}>
                {c.emoji}
              </span>
              <span className="h-6 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p dir="rtl" className="truncate text-right text-sm font-semibold sm:text-left">
                  {c.nameAr}
                </p>
                <p className="truncate text-xs text-muted">
                  {c.nameEn || "—"} · {c.productCount} product{c.productCount === 1 ? "" : "s"}
                </p>
              </div>
              <IconButton icon="up" label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
              <IconButton icon="down" label="Move down" disabled={i === categories.length - 1} onClick={() => move(i, 1)} />
              <IconButton icon="edit" label="Edit" onClick={() => setEditing(c.id)} />
              <IconButton
                icon="trash"
                label={c.productCount ? "Move or delete its products first" : "Delete"}
                disabled={c.productCount > 0}
                onClick={() => remove(c)}
              />
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: CategoryInput;
  submitLabel: string;
  onSubmit: (input: CategoryInput) => Promise<void>;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(form);
    } catch (err) {
      toast((err as Error).message, "error");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-panel p-5 shadow-panel ring-2 ring-accent/30">
      <Bilingual label="Name" ar={form.nameAr} en={form.nameEn} onAr={(v) => setForm({ ...form, nameAr: v })} onEn={(v) => setForm({ ...form, nameEn: v })} />
      <div className="grid grid-cols-2 gap-4 sm:w-80">
        <Field label="Emoji">
          <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className={`${inputClass} text-center text-lg`} maxLength={16} />
        </Field>
        <Field label="Colour">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-panel p-1"
              aria-label="Pick colour"
            />
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={`${inputClass} font-mono text-xs`} aria-label="Colour code" />
          </div>
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" busy={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
