import type { Category, Lang, LineText, Product, ProductText, Settings, SettingsText } from "./types";

export const LANGS: Lang[] = ["ar", "en"];
export const DEFAULT_LANG: Lang = "ar";

export function isLang(v: string): v is Lang {
  return (LANGS as string[]).includes(v);
}

export function dirOf(lang: Lang) {
  return lang === "ar" ? "rtl" : "ltr";
}

/* ---------- catalog text ---------- */

export function productText(p: Product, lang: Lang): ProductText {
  if (lang === "en") return p.en;
  return {
    name: p.name,
    description: p.description,
    note: p.note,
    story: p.story,
    ingredients: p.ingredients,
    variants: p.variants.map((v) => v.label),
    options: p.options.map((g) => ({ label: g.label, options: g.options.map((o) => o.label) })),
  };
}

export function categoryName(c: Category, lang: Lang) {
  return lang === "en" ? c.nameEn : c.name;
}

export function settingsText(s: Settings, lang: Lang): SettingsText {
  return lang === "en" ? s.en : s;
}

/** Text for a cart line in one language, from the picked variant and the option picked in each group. */
export function lineText(p: Product, lang: Lang, variantIdx: number, picks: number[]): LineText {
  const t = productText(p, lang);
  return {
    name: t.name,
    variantLabel: t.variants[variantIdx],
    options: t.options.map((g, gi) => ({ label: g.label, value: g.options[picks[gi] ?? 0] ?? "" })),
  };
}

/* ---------- interface strings ---------- */

const ar = {
  close: "إغلاق",
  switchLang: "English",
  switchLangLabel: "Switch to English",
  navMenu: "المنيو",
  navHow: "كيف منطلب",
  navContact: "تواصلوا",
  padTab: "الطلبية",
  padOpen: "افتحوا ورقة الطلب",

  heroKicker: "عاللوح اليوم، من مطبخ أم ميلانا",
  heroTitle: "من مطبخنا",
  heroTitleAccent: "لسفرتكن",
  browse: "شوفوا شو عاللوح",
  orderOnWhatsapp: "اطلبوا عالواتساب",
  statFollowers: "+١.٤ مليون",
  statFollowersLabel: "بيطبخوا معنا",
  statHands: "بالإيد",
  statHandsLabel: "كل حبّة كبة",
  statFrozen: "طازة",
  statFrozenLabel: "ومجلّدة عالفور",
  doodleKibbeh: "كبة!",
  doodlePan: "من الفريزر عالمقلاية",

  specialKicker: "عرض اليوم",
  specialCta: "زيدوا العرض",

  menuTitle: "شو عاللوح اليوم؟",
  menuHint: "اكبسوا عالصنف لتشوفوا صورتو وشو فيه، وعالـ + لتنكتب عالطلبية.",
  all: "كلّو",
  today: (category: string) => `اليوم: ${category}`,

  unavailable: "خلص",
  bestSeller: "عرض",
  add: "زيدوا",
  details: "شو فيها؟",
  size: "الحجم",
  increase: "زيادة",
  decrease: "إنقاص",
  inOrder: (amount: string) => `عالطلبية: ${amount}`,
  addToCart: (price: string) => `زيدوا عالطلبية · ${price}`,
  addToCartNoPrice: "زيدوا عالطلبية",
  perKilo: "للكيلو",
  priceOnRequest: "السعر عالواتساب",
  priceAsk: "عالواتساب",
  priceLegend: "السعر منأكّدو عالواتساب",
  photoBy: "الصورة",

  cartTitle: "ورقة الطلب",
  padNo: "رقم",
  padTable: "الطاولة: البيت",
  emptyCart: "الورقة بعدها فاضية",
  emptyCartHint: "اكبسوا + حدّ أي صنف عاللوح، وبينكتب هون.",
  remove: "اشطبوا",
  name: "الإسم",
  namePlaceholder: "مين عم يطلب؟",
  address: "العنوان",
  addressPlaceholder: "المنطقة، الشارع، البناية",
  notes: "ملاحظات",
  notesPlaceholder: "نوع الكبة، الوقت المناسب…",
  clearCart: "اشطبوا كل شي",
  subtotal: "المجموع",
  delivery: "التوصيل",
  deliveryFree: "مجاني",
  deliveryByArea: "حسب المنطقة",
  total: "الإجمالي",
  totalOnWhatsapp: "منأكّدو عالواتساب",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "صنف سعرو" : "أصناف سعرها"} عالواتساب`,
  sendOrder: "اقطعوا الورقة وابعتوها عالواتساب",
  sent: "انقطعت! كمّلوا عالواتساب",
  backToBoard: "رجعوا عاللوح",

  howTitle: "كيف منطلب؟",
  step1: "نقّوا من اللوح",
  step1Text: "اكبسوا + حدّ الصنف، وبتنعلّم عليه وبينكتب عورقة الطلب.",
  step2: "اكتبوا اسمكن وعنوانكن",
  step2Text: "عورقة الطلب نفسها، وزيدوا أي ملاحظة بدكن ياها.",
  step3: "اقطعوا الورقة",
  step3Text: "بتوصلنا عالواتساب مكتوبة ومرتّبة، ومنأكّدلكن السعر والوقت.",
  contact: "أو ابعتولنا رسالة",
  followUs: "تابعونا",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  facebook: "فيسبوك",
  footerNote: "أكل بيتي · محضّر بالإيد · من مطبخ أم ميلانا",
};

export type Dict = typeof ar;

const en: Dict = {
  close: "Close",
  switchLang: "عربي",
  switchLangLabel: "التحويل إلى العربية",
  navMenu: "Menu",
  navHow: "How to order",
  navContact: "Contact",
  padTab: "Order",
  padOpen: "Open the order pad",

  heroKicker: "On the board today, from Em Milana's kitchen",
  heroTitle: "From our kitchen",
  heroTitleAccent: "to your table",
  browse: "See what's on the board",
  orderOnWhatsapp: "Order on WhatsApp",
  statFollowers: "1.4M+",
  statFollowersLabel: "cook along with us",
  statHands: "By hand",
  statHandsLabel: "every single kibbeh",
  statFrozen: "Fresh",
  statFrozenLabel: "and frozen right away",
  doodleKibbeh: "kibbeh!",
  doodlePan: "freezer to pan",

  specialKicker: "Today's special",
  specialCta: "Add the deal",

  menuTitle: "What's on the board today?",
  menuHint: "Tap a dish to see its photo and what's in it, and + to get it written on your order.",
  all: "Everything",
  today: (category: string) => `Today: ${category}`,

  unavailable: "Sold out",
  bestSeller: "Deal",
  add: "Add",
  details: "What's in it?",
  size: "Size",
  increase: "Increase",
  decrease: "Decrease",
  inOrder: (amount: string) => `On the order: ${amount}`,
  addToCart: (price: string) => `Add to the order · ${price}`,
  addToCartNoPrice: "Add to the order",
  perKilo: "per kilo",
  priceOnRequest: "Price on WhatsApp",
  priceAsk: "on WhatsApp",
  priceLegend: "price confirmed on WhatsApp",
  photoBy: "Photo",

  cartTitle: "Order pad",
  padNo: "No.",
  padTable: "Table: home",
  emptyCart: "The pad is still blank",
  emptyCartHint: "Tap + beside any dish on the board and it gets written here.",
  remove: "Cross out",
  name: "Name",
  namePlaceholder: "Who's ordering?",
  address: "Address",
  addressPlaceholder: "Area, street, building",
  notes: "Notes",
  notesPlaceholder: "Kind of kibbeh, best time…",
  clearCart: "Cross it all out",
  subtotal: "Subtotal",
  delivery: "Delivery",
  deliveryFree: "Free",
  deliveryByArea: "Depends on area",
  total: "Total",
  totalOnWhatsapp: "Confirmed on WhatsApp",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "item" : "items"} priced on WhatsApp`,
  sendOrder: "Tear off & send on WhatsApp",
  sent: "Torn off! Carry on in WhatsApp",
  backToBoard: "Back to the board",

  howTitle: "How to order",
  step1: "Pick from the board",
  step1Text: "Tap + beside a dish; it gets circled and written on your order pad.",
  step2: "Write your name and address",
  step2Text: "Right on the pad, with any note you like.",
  step3: "Tear off the ticket",
  step3Text: "It reaches us on WhatsApp, written out; we confirm the price and time.",
  contact: "Or just message us",
  followUs: "Follow us",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  footerNote: "Home food · made by hand · from Em Milana's kitchen",
};

export const dictionaries: Record<Lang, Dict> = { ar, en };

/* ---------- admin overrides ---------- */

/** Keys whose value is plain text (the rest are small formatting functions). */
export type TextKey = { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict];

export const TEXT_KEYS = (Object.keys(ar) as (keyof Dict)[]).filter((k): k is TextKey => typeof ar[k] === "string");

/** The dictionary with any non-empty admin overrides applied. Unknown keys are ignored. */
export function withOverrides(lang: Lang, overrides: Record<string, string> | undefined): Dict {
  const base = dictionaries[lang];
  if (!overrides) return base;
  const out: Dict = { ...base };
  for (const key of TEXT_KEYS) {
    const v = overrides[key];
    if (typeof v === "string" && v.trim()) (out as Record<TextKey, string>)[key] = v;
  }
  return out;
}
