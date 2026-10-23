import { lineText } from "./i18n";
import type { CartLine, Customer, Lang, Product, Settings } from "./types";

/** Money is kept to the cent; 0.1 + 0.2 style float noise never reaches the screen. */
const cents = (n: number) => Math.round(n * 100) / 100;

export function formatPrice(n: number, currency = "$") {
  const r = cents(n);
  const v = Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, "");
  return `${v}${currency}`;
}

/** A price of 0 means the shop hasn't set one yet: it's confirmed with the customer on WhatsApp. */
export const isPriced = (n: number) => n > 0;

/** "+2$" / "−1$", for what an option adds. */
export function formatDelta(n: number, currency = "$") {
  return `${n < 0 ? "−" : "+"}${formatPrice(Math.abs(n), currency)}`;
}

/** An amount sold by weight: under a kilo in grams ("250 غرام"), otherwise in kilos ("1.5 كيلو"). */
export function formatWeight(kg: number, lang: Lang) {
  const k = cents(kg);
  if (k < 1) return lang === "ar" ? `${Math.round(k * 1000)} غرام` : `${Math.round(k * 1000)} g`;
  return lang === "ar" ? `${k} كيلو` : `${k} kg`;
}

/** What an option adds to a given size. A single price applies to every size. */
export function optionPrice(prices: number[], variantIdx: number) {
  return prices[variantIdx] ?? prices[0] ?? 0;
}

/** Price of one jar (or kilo) of a product with the given size and option picks. */
export function unitPrice(p: Product, variantIdx: number, picks: number[]) {
  const base = p.variants[variantIdx].price;
  const extra = p.options.reduce((s, g, gi) => s + optionPrice(g.options[picks[gi] ?? 0]?.prices ?? [], variantIdx), 0);
  return cents(base + extra);
}

export function lineKey(productId: string, variantIdx: number, picks: number[], travel: boolean) {
  return [productId, variantIdx, picks.join("."), travel ? "t" : ""].join("|");
}

/** A cart line for a product with the customer's choices. */
export function buildLine(p: Product, variantIdx: number, picks: number[], qty: number, travel: boolean): CartLine {
  const travelFee = p.variants[variantIdx].travelFee;
  const withTravel = travel && travelFee !== null;
  return {
    key: lineKey(p.id, variantIdx, picks, withTravel),
    productId: p.id,
    emoji: p.emoji,
    unitPrice: unitPrice(p, variantIdx, picks),
    qty,
    weightStep: p.weightStep,
    travel: withTravel,
    travelFee,
    text: { ar: lineText(p, "ar", variantIdx, picks), en: lineText(p, "en", variantIdx, picks) },
  };
}

/** Travel packaging charged on one line. */
export function linePackaging(l: CartLine) {
  return l.travel && l.travelFee !== null ? cents(l.travelFee * l.qty) : 0;
}

export type OrderTotals = {
  /** Jars, counting each item sold by weight once. */
  units: number;
  subtotal: number;
  packaging: number;
  /** Lines packed for travel. */
  travelLines: number;
  total: number;
  freeDelivery: boolean;
  /** Lines whose price is confirmed on WhatsApp; the totals leave them out. */
  unpricedLines: number;
};

export function computeTotals(lines: CartLine[], settings: Settings): OrderTotals {
  const units = lines.reduce((s, l) => s + (l.weightStep ? 1 : l.qty), 0);
  const subtotal = cents(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const packaging = cents(lines.reduce((s, l) => s + linePackaging(l), 0));
  const travelLines = lines.filter((l) => linePackaging(l) > 0).length;
  const freeDelivery = lines.some((l) => settings.freeDeliveryProductIds.includes(l.productId));
  const unpricedLines = lines.filter((l) => !isPriced(l.unitPrice)).length;
  return { units, subtotal, packaging, travelLines, total: cents(subtotal + packaging), freeDelivery, unpricedLines };
}

/*
 * Only plain characters in the receipt: WhatsApp drops most emoji passed through a wa.me
 * link (they arrive as "�"), while Arabic and basic symbols like ━ · × come through.
 */
const RULE = "━━━━━━━━━━━━━━━━";

/** Date and time in Beirut, where the shop is, wherever the customer orders from. */
function beirutTime(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Beirut",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("day")}/${get("month")}/${get("year")}`, time: `${get("hour")}:${get("minute")}` };
}

/** Short number the shop and customer can use to refer to an order. */
export function newOrderRef() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

export function buildWhatsAppMessage(
  lines: CartLine[],
  customer: Customer,
  settings: Settings,
  { ref = newOrderRef(), now = new Date() }: { ref?: string; now?: Date } = {},
) {
  const c = settings.currency;
  const t = computeTotals(lines, settings);
  const { date, time } = beirutTime(now);
  const out: string[] = [];

  // The order always goes out in Arabic for the shop, whatever language the customer browsed in.
  // Every line's first letter is Arabic, so WhatsApp lays it out right-to-left.
  out.push(`*${settings.siteName}*`);
  out.push(`طلب جديد رقم *#${ref}*`);
  out.push(`التاريخ: ${date}، الساعة ${time}`);
  out.push(RULE);

  const name = customer.name.trim();
  const address = customer.address.trim();
  const notes = customer.notes.trim();
  if (name || address || notes) {
    out.push("*الزبون*");
    if (name) out.push(`الاسم: ${name}`);
    if (address) out.push(`العنوان: ${address}`);
    if (notes) out.push(`ملاحظات: ${notes}`);
    out.push(RULE);
  }

  // Western digits only, and no "·" beside a number: Arabic zero "٠" is a dot, so "٨ ·" reads as ٨٠
  out.push(`*الطلبية* — عدد الأصناف: ${lines.length}، عدد القطع: ${t.units}`);
  lines.forEach((l, i) => {
    const ar = l.text.ar;
    const priced = isPriced(l.unitPrice);
    const lineTotal = formatPrice(l.qty * l.unitPrice, c);
    out.push("");
    out.push(`(${i + 1}) *${ar.name}*`);
    if (l.weightStep) {
      out.push(
        priced
          ? `      الكمية: ${formatWeight(l.qty, "ar")} × ${formatPrice(l.unitPrice, c)} للكيلو = *${lineTotal}*`
          : `      الكمية: ${formatWeight(l.qty, "ar")}`,
      );
    } else if (!priced) {
      out.push(`      ${ar.variantLabel} · العدد: ${l.qty}`);
    } else {
      out.push(
        l.qty === 1
          ? `      ${ar.variantLabel} · *${lineTotal}*`
          : `      ${ar.variantLabel} · ${l.qty} × ${formatPrice(l.unitPrice, c)} = *${lineTotal}*`,
      );
    }
    if (!priced) out.push("      السعر: بانتظار التأكيد");
    for (const o of ar.options) out.push(`      ${o.label}: ${o.value}`);
    const pack = linePackaging(l);
    if (pack > 0) out.push(`      ${settings.travelPackaging.label}: ${formatPrice(pack, c)}`);
  });

  out.push(RULE);
  const allUnpriced = t.unpricedLines === lines.length;
  if (!allUnpriced) out.push(`المجموع: ${formatPrice(t.subtotal, c)}`);
  if (t.packaging > 0) out.push(`${settings.travelPackaging.label}: ${formatPrice(t.packaging, c)}`);
  out.push(t.freeDelivery ? "التوصيل: مجاني" : "التوصيل: حسب المنطقة");
  if (allUnpriced) out.push("*الأسعار: بانتظار تأكيدكم*");
  else if (t.unpricedLines > 0) out.push(`*الإجمالي: ${formatPrice(t.total, c)}* + ${t.unpricedLines === 1 ? "صنف" : `${t.unpricedLines} أصناف`} بانتظار السعر`);
  else out.push(`*الإجمالي: ${formatPrice(t.total, c)}*`);
  out.push(RULE);
  out.push("بانتظار تأكيد الطلب، وشكراً");

  return out.join("\n");
}

export function whatsappUrl(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
