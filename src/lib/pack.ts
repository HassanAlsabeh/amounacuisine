/**
 * A square crop of the dish drops from `from` into the box button (the element marked
 * [data-box-target]), shrinking as it lands, then the button gives a little pop.
 */
export function packIntoBox(from: Element | null, photo: string | null) {
  if (!from || typeof window === "undefined") return;
  const target = document.querySelector<HTMLElement>("[data-box-target]");
  if (!target) return;
  const pop = () => target.animate([{ transform: "scale(1)" }, { transform: "scale(1.14)" }, { transform: "scale(1)" }], { duration: 360, easing: "ease-out" });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    pop();
    return;
  }

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 52;
  const x0 = a.left + a.width / 2 - size / 2;
  const y0 = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - x0;
  const dy = b.top + b.height / 2 - size / 2 - y0;

  const chip = document.createElement("div");
  Object.assign(chip.style, {
    position: "fixed",
    left: `${x0}px`,
    top: `${y0}px`,
    width: `${size}px`,
    height: `${size}px`,
    zIndex: "80",
    pointerEvents: "none",
    borderRadius: "4px",
    border: "1.5px solid #23212b",
    background: photo ? `#fcd9b8 url("${photo}") center / cover` : "#fcd9b8",
    boxShadow: "0 8px 20px -8px rgba(35, 33, 43, 0.45)",
  });
  document.body.appendChild(chip);

  chip
    .animate(
      [
        { transform: "translate(0, 0) scale(0.6)", opacity: 0 },
        { transform: "translate(0, -18px) scale(1.05)", opacity: 1, offset: 0.22 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.32)`, opacity: 0.9 },
      ],
      { duration: 680, easing: "cubic-bezier(0.5, 0, 0.25, 1)" },
    )
    .finished.then(() => {
      chip.remove();
      pop();
    });
}
