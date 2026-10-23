"use client";

import { useEffect, useRef, useState } from "react";

type Pt = [number, number];

/** A hand wiping the glass in strokes, in fractions of the glass's width and height. */
const WIPE: Pt[] = [
  [0.22, 0.24],
  [0.78, 0.2],
  [0.22, 0.4],
  [0.8, 0.38],
  [0.2, 0.57],
  [0.8, 0.55],
  [0.24, 0.74],
  [0.76, 0.72],
  [0.3, 0.88],
  [0.7, 0.88],
];
const WIPE_MS = 1900;

/**
 * Condensation on the freezer glass. On load a hand wipes it in strokes to show what's inside;
 * then a mouse wipes by hovering and a finger by dragging. Without motion the glass is simply clear.
 */
export function FrostGlass({ hint }: { hint: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [clear, setClear] = useState(false);
  const [touched, setTouched] = useState(false);
  const [wiped, setWiped] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setClear(true);
      return;
    }

    // every wipe so far, kept in fractions so the glass can be repainted at any size
    const paths: Pt[][] = [];
    let w = 0;
    let h = 0;
    const radius = () => Math.max(w, h) * 0.1;

    const fog = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(238, 246, 253, 0.94)");
      g.addColorStop(1, "rgba(206, 228, 247, 0.9)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // droplets of condensation, the same every time
      let seed = 11;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 170; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const r = 0.7 + rnd() * rnd() * 3.2;
        ctx.fillStyle = "rgba(110, 150, 190, 0.22)";
        ctx.beginPath();
        ctx.arc(x, y + r * 0.35, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const dab = (x: number, y: number) => {
      const r = radius();
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.6, "rgba(0,0,0,0.85)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const stroke = (a: Pt, b: Pt) => {
      const [x0, y0, x1, y1] = [a[0] * w, a[1] * h, b[0] * w, b[1] * h];
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (radius() * 0.3)));
      for (let i = 1; i <= steps; i++) dab(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps);
    };

    const paint = () => {
      fog();
      for (const p of paths) {
        if (p.length === 1) stroke(p[0], p[0]);
        for (let i = 1; i < p.length; i++) stroke(p[i - 1], p[i]);
      }
    };

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    };

    const extend = (path: Pt[], pt: Pt) => {
      const last = path[path.length - 1];
      path.push(pt);
      stroke(last ?? pt, pt);
    };

    // the opening wipe: walk the zig-zag at an even speed
    const lengths = WIPE.slice(1).map((p, i) => Math.hypot(p[0] - WIPE[i][0], p[1] - WIPE[i][1]));
    const total = lengths.reduce((s, l) => s + l, 0);
    const auto: Pt[] = [];
    paths.push(auto);
    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      start ||= now;
      let d = (Math.min(1, (now - start) / WIPE_MS) ** 0.85) * total;
      let i = 0;
      while (i < lengths.length - 1 && d > lengths[i]) d -= lengths[i++];
      const f = Math.min(1, d / lengths[i]);
      const [a, b] = [WIPE[i], WIPE[i + 1]];
      if (!auto.length) auto.push(WIPE[0]);
      // pass through the corners already reached
      while (auto.length - 1 < i) extend(auto, WIPE[auto.length]);
      extend(auto, [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      if (now - start < WIPE_MS) raf = requestAnimationFrame(step);
      else setWiped(true);
    };
    const delay = setTimeout(() => (raf = requestAnimationFrame(step)), 700);

    let live: Pt[] | null = null;
    const at = (e: PointerEvent): Pt => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    };
    const onDown = (e: PointerEvent) => {
      live = [];
      paths.push(live);
      extend(live, at(e));
      setTouched(true);
    };
    const onMove = (e: PointerEvent) => {
      // a mouse wipes just by passing over the glass; a finger has to be down
      if (e.pointerType === "mouse" && !live) {
        live = [];
        paths.push(live);
      }
      if (!live) return;
      extend(live, at(e));
      setTouched(true);
    };
    const onEnd = () => (live = null);

    fit();
    setReady(true);
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onEnd);
    canvas.addEventListener("pointerleave", onEnd);
    canvas.addEventListener("pointercancel", onEnd);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onEnd);
      canvas.removeEventListener("pointerleave", onEnd);
      canvas.removeEventListener("pointercancel", onEnd);
    };
  }, []);

  if (clear) return null;
  return (
    <>
      {/* steamed up from the first paint, before the canvas takes over */}
      {!ready && <span aria-hidden className="absolute inset-0 bg-frost/95" />}
      <canvas ref={ref} aria-hidden className="absolute inset-0 size-full touch-pan-y" />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-sm bg-navy/80 px-2.5 py-1 font-display text-xs font-semibold text-white transition-opacity duration-500 ${wiped && !touched ? "opacity-100" : "opacity-0"}`}
      >
        {hint}
      </span>
    </>
  );
}
