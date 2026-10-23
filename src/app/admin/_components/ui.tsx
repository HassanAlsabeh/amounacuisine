"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { uploadImage } from "./api";

/* ---------- icons ---------- */

const ICONS = {
  box: "M21 8 12 3 3 8m18 0-9 5m9-5v8l-9 5m0-8L3 8m9 5v8M3 8v8l9 5",
  tag: "M3 12V4h8l10 10-8 8L3 12Zm5-4h.01",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  text: "M4 7V5h16v2M9 19h6M12 5v14",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0",
  plus: "M12 5v14M5 12h14",
  search: "m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z",
  up: "m6 15 6-6 6 6",
  down: "m6 9 6 6 6-6",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
  close: "M6 6l12 12M18 6 6 18",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z",
  edit: "M4 20h4L19 9l-4-4L4 16v4Zm10-14 4 4",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  logout: "M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10",
  image: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01",
  check: "m5 12 5 5L20 7",
  menu: "M4 6h16M4 12h16M4 18h16",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = "h-5 w-5", filled }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ---------- buttons & fields ---------- */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  busy?: boolean;
};

export function Button({ variant = "secondary", size = "md", busy, className = "", children, disabled, ...rest }: ButtonProps) {
  const look = {
    primary: "bg-accent text-white hover:bg-accent-dark shadow-sm",
    secondary: "bg-panel text-ink ring-1 ring-line hover:bg-bg",
    ghost: "text-muted hover:bg-bg hover:text-ink",
    danger: "bg-panel text-danger ring-1 ring-danger/30 hover:bg-danger hover:text-white",
  }[variant];
  const dims = size === "sm" ? "h-8 px-3 text-xs gap-1.5" : "h-10 px-4 text-sm gap-2";
  return (
    <button
      type="button"
      disabled={disabled || busy}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${dims} ${look} ${className}`}
      {...rest}
    >
      {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none disabled:bg-bg";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

type TextProps = { value: string; onChange: (v: string) => void; dir?: "rtl" | "ltr"; multiline?: boolean; placeholder?: string };

export function TextInput({ value, onChange, dir, multiline, placeholder }: TextProps) {
  return multiline ? (
    <textarea
      value={value}
      dir={dir}
      rows={3}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-y leading-relaxed`}
    />
  ) : (
    <input value={value} dir={dir} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
  );
}

/** Arabic and English versions of one text, side by side (stacked on phones). */
export function Bilingual({
  label,
  ar,
  en,
  onAr,
  onEn,
  multiline,
  placeholders,
  hint,
}: {
  label: string;
  ar: string;
  en: string;
  onAr: (v: string) => void;
  onEn: (v: string) => void;
  multiline?: boolean;
  placeholders?: { ar?: string; en?: string };
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-ink">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="relative">
          <LangBadge>ع</LangBadge>
          <TextInput value={ar} onChange={onAr} dir="rtl" multiline={multiline} placeholder={placeholders?.ar} />
        </div>
        <div className="relative">
          <LangBadge>EN</LangBadge>
          <TextInput value={en} onChange={onEn} dir="ltr" multiline={multiline} placeholder={placeholders?.en ?? "Same as Arabic if left empty"} />
        </div>
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </fieldset>
  );
}

function LangBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute -top-2 right-2 z-10 rounded bg-bg px-1.5 text-[10px] leading-4 font-bold text-muted ring-1 ring-line">
      {children}
    </span>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? "bg-ok" : "bg-line"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5.5" : "translate-x-0.5"}`} />
    </button>
  );
}

export function Card({ title, description, children, actions }: { title?: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-panel p-5 shadow-panel ring-1 ring-line sm:p-6">
      {(title || actions) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Bar pinned to the bottom of the screen while there are unsaved changes. */
export function SaveBar({ visible, busy, onSave, onDiscard }: { visible: boolean; busy: boolean; onSave: () => void; onDiscard: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 backdrop-blur md:left-64">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-medium text-muted">You have unsaved changes</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDiscard} disabled={busy}>
            Discard
          </Button>
          <Button variant="primary" onClick={onSave} busy={busy}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- image picker ---------- */

export function ImageInput({ value, onChange, label = "Photo", round }: { value: string; onChange: (url: string) => void; label?: string; round?: boolean }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const id = useId();

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-bg ring-1 ring-line ${round ? "rounded-full" : "rounded-xl"}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- previews of arbitrary just-uploaded URLs
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name="image" className="h-8 w-8 text-muted/50" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            <Button size="sm" busy={busy} onClick={() => fileRef.current?.click()}>
              {value ? "Replace photo" : "Upload photo"}
            </Button>
            {value && (
              <Button size="sm" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowUrl((v) => !v)}>
              {showUrl ? "Hide link" : "Use a link"}
            </Button>
          </div>
          {showUrl && <input value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="https://…" className={inputClass} />}
          <p className="text-xs text-muted">JPG, PNG or WebP. Large photos are resized automatically.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- toasts ---------- */

type Toast = { id: number; message: string; kind: "success" | "error" };
const ToastContext = createContext<(message: string, kind?: Toast["kind"]) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-pop ${t.kind === "error" ? "bg-danger" : "bg-ink"}`}
          >
            <Icon name={t.kind === "error" ? "close" : "check"} className="h-4 w-4" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------- dialogs ---------- */

/** Side sheet on desktop, full screen on phones. */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal aria-label={title} className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-bg shadow-pop">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-panel px-5 py-4">
          <h2 className="truncate text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-muted hover:bg-bg hover:text-ink">
            <Icon name="close" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-line bg-panel px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

type ConfirmState = { message: string; confirmLabel: string; resolve: (ok: boolean) => void } | null;
const ConfirmContext = createContext<(message: string, confirmLabel?: string) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>(null);
  const ask = useCallback(
    (message: string, confirmLabel = "Delete") => new Promise<boolean>((resolve) => setState({ message, confirmLabel, resolve })),
    [],
  );
  const done = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };
  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => done(false)} />
          <div role="alertdialog" aria-modal className="relative w-full max-w-sm rounded-2xl bg-panel p-6 shadow-pop">
            <p className="text-sm leading-relaxed">{state.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => done(false)} autoFocus>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => done(true)}>
                {state.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

/** Warn before closing the tab with unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
