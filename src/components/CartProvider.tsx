"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { computeTotals, type OrderTotals } from "@/lib/order";
import type { CartLine, Customer, Product, Settings } from "@/lib/types";

const STORAGE_KEY = "amouna-cuisine-tray-v1";

type CartContextValue = {
  settings: Settings;
  lines: CartLine[];
  customer: Customer;
  totals: OrderTotals;
  isOpen: boolean;
  /** Opens the order; `from` is where it was tapped, so it can grow out of that spot. */
  open: (from?: Element | null) => void;
  close: () => void;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  setTravel: (key: string, travel: boolean) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCustomer: (c: Customer) => void;
  /** Product whose details sheet is open. */
  viewing: Product | null;
  view: (p: Product | null, from?: Element | null) => void;
  /** Screen point (px) the last overlay opened from. */
  origin: Origin;
};

export type Origin = { x: number; y: number };

const centreOf = (el?: Element | null): Origin => {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const r = el.getBoundingClientRect();
  // a tap point outside the screen would leave the far corner uncovered by the growing circle
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  return { x: clamp(r.left + r.width / 2, window.innerWidth), y: clamp(r.top + r.height / 2, window.innerHeight) };
};

const CartContext = createContext<CartContextValue | null>(null);

type Persisted = { lines: CartLine[]; customer: Customer };

/** Kilos are counted in steps, so 0.1 + 0.2 never shows up as 0.30000000000000004. */
const roundQty = (q: number) => Math.round(q * 1000) / 1000;

/** The same item with and without travel packaging are separate lines. */
const withTravelKey = (key: string, travel: boolean) => key.replace(/\|t?$/, travel ? "|t" : "|");

export function CartProvider({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: "", address: "", notes: "" });
  const [isOpen, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Persisted;
        setLines(saved.lines ?? []);
        if (saved.customer) setCustomer(saved.customer);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, customer } satisfies Persisted));
    } catch {}
  }, [lines, customer, hydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen || viewing ? "hidden" : "";
  }, [isOpen, viewing]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) return prev.map((l) => (l.key === line.key ? { ...l, qty: roundQty(l.qty + line.qty) } : l));
      return [...prev, line];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    const q = roundQty(qty);
    setLines((prev) => (q <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: q } : l))));
  }, []);

  const setTravel = useCallback((key: string, travel: boolean) => {
    setLines((prev) => {
      const line = prev.find((l) => l.key === key);
      if (!line || line.travelFee === null) return prev;
      const nextKey = withTravelKey(key, travel);
      const twin = prev.find((l) => l.key === nextKey);
      // switching onto an existing twin line merges the two
      if (twin) return prev.filter((l) => l.key !== key).map((l) => (l.key === nextKey ? { ...l, qty: roundQty(l.qty + line.qty) } : l));
      return prev.map((l) => (l.key === key ? { ...l, key: nextKey, travel } : l));
    });
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      settings,
      lines,
      customer,
      totals: computeTotals(lines, settings),
      isOpen,
      open: (from) => {
        setOrigin(centreOf(from));
        setOpen(true);
      },
      close: () => setOpen(false),
      add,
      setQty,
      setTravel,
      remove,
      clear,
      setCustomer,
      viewing,
      view: (p, from) => {
        if (p) setOrigin(centreOf(from));
        setViewing(p);
      },
      origin,
    }),
    [settings, lines, customer, isOpen, viewing, origin, add, setQty, setTravel, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
