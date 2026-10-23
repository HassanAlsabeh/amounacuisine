"use client";

import { useEffect, useState } from "react";

/**
 * Mount/animate state for a full-screen layer: it stays mounted while it animates out,
 * `shown` flips a frame after mounting so the CSS transition runs, and Escape closes it.
 */
export function useLayer(open: boolean, onClose: () => void, exitMs = 600) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const id = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(id);
  }, [open, exitMs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return { mounted, shown };
}
