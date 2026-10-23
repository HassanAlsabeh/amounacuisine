/**
 * A tiny copy of the box (brand strip over the dish photo) hops in an arc from `from` to the
 * checkout button (the element marked [data-order-target]), which then gives a scanner "beep".
 */
export function flyToCheckout(from: Element | null, photo: string | null) {
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

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "fixed",
    left: `${x0 - 16}px`,
    top: `${y0 - 20}px`,
    width: "32px",
    height: "40px",
    zIndex: "80",
    pointerEvents: "none",
    background: `linear-gradient(#e0182f 0 9px, transparent 9px), ${photo ? `center / cover url("${photo}")` : "#dcecf9"}`,
    border: "2px solid #fff",
    boxShadow: "0 6px 14px -4px rgba(10,37,64,.6)",
  });
  document.body.appendChild(box);

  const lift = Math.min(-80, dy - 120);
  box
    .animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(1)" },
        { transform: `translate(${dx * 0.35}px, ${lift}px) rotate(-18deg) scale(1.25)`, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) rotate(12deg) scale(0.4)` },
      ],
      { duration: 720, easing: "cubic-bezier(0.45, 0, 0.3, 1)" },
    )
    .finished.then(() => {
      box.remove();
      target.dispatchEvent(new CustomEvent("scanned"));
    });
}
