/** Small storefront helpers shared by the menu, the dish view and the top bar. */

/*
 * "Just added" signal: whatever adds a dish announces its name, and the top bar drops a short note
 * under the order counter. A DOM event keeps the add buttons free of any link to the bar.
 */
export const ADDED_EVENT = "amouna:added";

export function announceAdded(name: string) {
  window.dispatchEvent(new CustomEvent<string>(ADDED_EVENT, { detail: name }));
}

/** Two-digit index for the big numerals: 1 → "01". */
export const pad = (n: number) => String(n).padStart(2, "0");
