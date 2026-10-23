/**
 * A kibbeh hops in an arc from `from` to the tray button (the element marked
 * [data-order-target]), turning as it flies, then the tray gives a little bump.
 */
export function flyToTray(from: Element | null) {
  if (!from || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.querySelector("[data-order-target]");
  if (!target) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height / 2;
  const dx = b.left + b.width / 2 - x0;
  const dy = b.top + b.height / 2 - y0;

  const bite = document.createElement("div");
  bite.innerHTML = KIBBEH_SVG;
  Object.assign(bite.style, {
    position: "fixed",
    left: `${x0 - 14}px`,
    top: `${y0 - 10}px`,
    width: "28px",
    height: "20px",
    zIndex: "80",
    pointerEvents: "none",
  });
  document.body.appendChild(bite);

  const lift = Math.min(-90, dy - 140);
  bite
    .animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(1)" },
        { transform: `translate(${dx * 0.4}px, ${lift}px) rotate(-160deg) scale(1.3)`, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) rotate(-340deg) scale(0.5)` },
      ],
      { duration: 780, easing: "cubic-bezier(0.45, 0, 0.3, 1)" },
    )
    .finished.then(() => {
      bite.remove();
      target.animate([{ transform: "rotate(0)" }, { transform: "rotate(-10deg) scale(1.15)" }, { transform: "rotate(6deg)" }, { transform: "rotate(0)" }], { duration: 420 });
    });
}

const KIBBEH_SVG =
  '<svg viewBox="0 0 28 20" width="28" height="20"><path d="M1.5 10C5 3 10 1.5 14 1.5S23 3 26.5 10C23 17 18 18.5 14 18.5S5 17 1.5 10Z" fill="#a8622f" stroke="#1d1b2c" stroke-width="1.6"/><path d="M6 9c3-2 6-3 8-3m-6 7c3-1 7-1.5 10-1" stroke="#7a4219" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>';
