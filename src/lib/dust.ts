/**
 * A puff of chalk dust from `from` (a dish was just added), then the order pad tab
 * (the element marked [data-order-target], when it's on screen) gives a little hop.
 */
export function chalkDust(from: Element | null) {
  if (!from || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const r = from.getBoundingClientRect();
  const x0 = r.left + r.width / 2;
  const y0 = r.top + r.height / 2;

  for (let i = 0; i < 9; i++) {
    const speck = document.createElement("span");
    const size = 3 + Math.random() * 5;
    Object.assign(speck.style, {
      position: "fixed",
      left: `${x0 - size / 2}px`,
      top: `${y0 - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "rgba(239, 237, 228, 0.85)",
      zIndex: "80",
      pointerEvents: "none",
    });
    document.body.appendChild(speck);
    const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.6;
    const dist = 18 + Math.random() * 22;
    speck
      .animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 0.9 },
          { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 10}px) scale(0.3)`, opacity: 0 },
        ],
        { duration: 520 + Math.random() * 260, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      )
      .finished.then(() => speck.remove());
  }

  const target = document.querySelector("[data-order-target]");
  if (target && target.getClientRects().length) {
    target.animate([{ transform: "rotate(-3deg)" }, { transform: "rotate(6deg) scale(1.15)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(-3deg)" }], {
      duration: 480,
      delay: 120,
    });
  }
}
