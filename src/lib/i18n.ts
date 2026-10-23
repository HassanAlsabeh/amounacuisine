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
  cart: "الصينية",
  close: "إغلاق",
  switchLang: "English",
  switchLangLabel: "Switch to English",
  navMenu: "المنيو",
  navHow: "كيف منطلب",
  navContact: "تواصلوا",

  heroKicker: "أكل بيتي من مطبخ أم ميلانا",
  heroTitle: "من مطبخنا",
  heroTitleAccent: "لسفرتكن",
  browse: "شوفوا المنيو",
  orderOnWhatsapp: "اطلبوا عالواتساب",
  statFollowers: "+١.٤ مليون",
  statFollowersLabel: "بيطبخوا معنا",
  statHands: "بالإيد",
  statHandsLabel: "كل حبّة كبة",
  statFrozen: "طازة",
  statFrozenLabel: "ومجلّدة عالفور",
  stickerFry: "للقلي",
  stickerBake: "للخبز",
  stickerEat: "للأكل",

  menuTitle: "شو بدكن تحضّروا اليوم؟",
  menuHint: "برموا الزر عالطريقة اللي بتناسبكن: للقلي، للخبز، للطبخ أو جاهز للأكل.",
  all: "كل المنيو",
  knobHint: "برموا",
  items: (n: number) => `${n} ${n === 1 ? "صنف" : "أصناف"}`,

  unavailable: "خلص",
  bestSeller: "عرض",
  add: "زيدوا",
  added: "صار بالصينية",
  details: "شو فيها؟",
  back: "رجوع",
  size: "الحجم",
  quantity: "الكمية",
  increase: "زيادة",
  decrease: "إنقاص",
  addToCart: (price: string) => `عالصينية · ${price}`,
  addToCartNoPrice: "عالصينية",
  perKilo: "للكيلو",
  priceOnRequest: "السعر عالواتساب",
  photoBy: "الصورة",

  offerKicker: "عرض المطبخ",
  offerCta: "زيدوا العرض",

  cartTitle: "صينيّتكن",
  cartHint: "كل شي حطّيتوه، صفّيناه هون.",
  emptyCart: "الصينية بعدها فاضية",
  emptyCartHint: "اختاروا شي كبة، شي رقاقات من المنيو… وبيصفّو هون.",
  remove: "شيلو",
  noteTitle: "ورقة عالبرّاد",
  name: "الإسم",
  namePlaceholder: "مين عم يطلب؟",
  address: "المنطقة والعنوان",
  addressPlaceholder: "وين منوصّل؟",
  notes: "ملاحظات",
  notesPlaceholder: "نوع الكبة، الوقت المناسب، أي شي…",
  clearCart: "فضّوا الصينية",
  subtotal: "المجموع",
  delivery: "التوصيل",
  deliveryFree: "مجاني",
  deliveryByArea: "حسب المنطقة",
  total: "الإجمالي",
  totalOnWhatsapp: "منأكّدو عالواتساب",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "صنف سعرو" : "أصناف سعرها"} عالواتساب`,
  sendOrder: "ابعتوا الطلب عالواتساب",
  viewCart: "شوفوا الصينية",

  howTitle: "الطلب أسرع من القلي",
  step1: "اختاروا من المنيو",
  step1Text: "زيدوا عالصينية شو ما بدكن، ونقّوا النوع بالملاحظات.",
  step2: "ابعتوا عالواتساب",
  step2Text: "الطلب بيوصلنا مكتوب ومرتّب، ومنأكّدلكن السعر والوقت.",
  step3: "عالنار، وصحتين",
  step3Text: "منحضّر ومنسلّم، وانتو بس قلوا أو اخبزوا أو سخّنوا.",
  contact: "أو ابعتولنا رسالة",
  followUs: "تابعونا",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  facebook: "فيسبوك",
  footerSections: "المنيو",
  footerNote: "أكل بيتي · محضّر بالإيد · من مطبخ أم ميلانا",
};

export type Dict = typeof ar;

const en: Dict = {
  cart: "The tray",
  close: "Close",
  switchLang: "عربي",
  switchLangLabel: "التحويل إلى العربية",
  navMenu: "Menu",
  navHow: "How to order",
  navContact: "Contact",

  heroKicker: "Home food from Em Milana's kitchen",
  heroTitle: "From our kitchen",
  heroTitleAccent: "to your table",
  browse: "See the menu",
  orderOnWhatsapp: "Order on WhatsApp",
  statFollowers: "1.4M+",
  statFollowersLabel: "cook along with us",
  statHands: "By hand",
  statHandsLabel: "every single kibbeh",
  statFrozen: "Fresh",
  statFrozenLabel: "and frozen right away",
  stickerFry: "to fry",
  stickerBake: "to bake",
  stickerEat: "to eat",

  menuTitle: "What are we making today?",
  menuHint: "Turn the knob to how you want to cook: fry, bake, cook, or ready to eat.",
  all: "Full menu",
  knobHint: "Turn",
  items: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,

  unavailable: "Sold out",
  bestSeller: "Deal",
  add: "Add",
  added: "On the tray",
  details: "What's in it?",
  back: "Back",
  size: "Size",
  quantity: "Quantity",
  increase: "Increase",
  decrease: "Decrease",
  addToCart: (price: string) => `On the tray · ${price}`,
  addToCartNoPrice: "On the tray",
  perKilo: "per kilo",
  priceOnRequest: "Price on WhatsApp",
  photoBy: "Photo",

  offerKicker: "Kitchen deal",
  offerCta: "Add the deal",

  cartTitle: "Your tray",
  cartHint: "Everything you picked, lined up here.",
  emptyCart: "The tray is still empty",
  emptyCartHint: "Pick some kibbeh, some rkakat from the menu… and they'll line up here.",
  remove: "Remove",
  noteTitle: "A note on the fridge",
  name: "Name",
  namePlaceholder: "Who's ordering?",
  address: "Area & address",
  addressPlaceholder: "Where do we deliver?",
  notes: "Notes",
  notesPlaceholder: "Kind of kibbeh, best time, anything…",
  clearCart: "Clear the tray",
  subtotal: "Subtotal",
  delivery: "Delivery",
  deliveryFree: "Free",
  deliveryByArea: "Depends on area",
  total: "Total",
  totalOnWhatsapp: "Confirmed on WhatsApp",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "item" : "items"} priced on WhatsApp`,
  sendOrder: "Send the order on WhatsApp",
  viewCart: "View tray",

  howTitle: "Ordering is quicker than frying",
  step1: "Pick from the menu",
  step1Text: "Put whatever you like on the tray, and tell us the kinds in the notes.",
  step2: "Send it on WhatsApp",
  step2Text: "Your order reaches us written out; we confirm the price and time.",
  step3: "On the stove, enjoy",
  step3Text: "We prepare and hand it over; you just fry, bake or warm it up.",
  contact: "Or just message us",
  followUs: "Follow us",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  footerSections: "Menu",
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
