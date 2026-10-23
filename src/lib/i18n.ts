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
  cart: "دفتر الكوبونات",
  cartShort: "الدفتر",
  close: "إغلاق",
  switchLang: "EN",
  switchLangLabel: "Switch to English",
  navMenu: "المنيو",
  navHow: "كيف منطلب",
  navContact: "تواصلوا",

  heroPresents: "مطبخ أم ميلانا يقدّم",
  heroTitle: "من مطبخنا",
  heroTitleAccent: "لسفرتكن",
  heroStarring: "بطولة",
  heroStars: "الكبة · الرقاقات · ورق العنب · الكوشينيا · المعجنات",
  heroDirected: "إخراج",
  heroDirector: "أم ميلانا، وميلانا مساعدة مخرج",
  heroAudience: "+١.٤ مليون",
  heroAudienceLabel: "بيطبخوا معنا",
  heroHandmade: "محضّر بالإيد",
  heroFrozen: "طازة ومجلّد",
  browse: "شوفوا المنيو",
  orderOnWhatsapp: "اطلبوا عالواتساب",

  menuTitle: "شو عالنار الليلة؟",
  menuHint: "اختاروا الطريقة اللي بتناسبكن: للقلي، للخبز، للطبخ أو جاهز للأكل. مرّقوا أو كبسوا عالصورة لتشوفوها بالألوان.",
  all: "كل المنيو",
  items: (n: number) => `${n} ${n === 1 ? "صنف" : "أصناف"}`,
  ticketNo: "رقم",

  unavailable: "خلص",
  bestSeller: "عرض",
  featureKicker: "العرض الكبير",
  featureCta: "زيدوا العرض",
  add: "زيدوا",
  added: "✓ تمّ",
  details: "شو فيها؟",
  size: "الحجم",
  quantity: "الكمية",
  increase: "زيادة",
  decrease: "إنقاص",
  addToCart: (price: string) => `زيدوا · ${price}`,
  addToCartNoPrice: "زيدوا",
  perKilo: "للكيلو",
  priceOnRequest: "السعر عالواتساب",
  photoBy: "الصورة",

  cartHint: "كل صنف كوبون. غيّرتوا رأيكن؟ قصّوه.",
  emptyCart: "الدفتر بعدو فاضي",
  emptyCartHint: "زيدوا شي كبة، شي رقاقات من المنيو… وبيطلعولكن كوبونات هون.",
  remove: "قصّوا",
  clearCart: "قصّوا كل الكوبونات",
  subtotal: "المجموع",
  delivery: "التوصيل",
  deliveryFree: "مجاني",
  deliveryByArea: "حسب المنطقة",
  total: "الإجمالي",
  totalOnWhatsapp: "منأكّدو عالواتساب",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "صنف سعرو" : "أصناف سعرها"} عالواتساب`,

  postcardTitle: "بطاقة لأمونة",
  postcardLabel: "بطاقة بريدية",
  postmarkCity: "بيروت",
  stampCountry: "لبنان",
  to: "إلى",
  name: "من؟",
  namePlaceholder: "اسمكن",
  address: "العنوان",
  addressPlaceholder: "المنطقة، الشارع، البناية",
  notes: "رسالة لأمونة",
  notesPlaceholder: "نوع الكبة، الوقت المناسب، أي شي…",
  sendOrder: "ابعتوا البطاقة عالواتساب",
  posted: "انبعتت!",

  howTitle: "الطلب أسرع من القلي",
  step1: "اختاروا من المنيو",
  step1Text: "كل صنف بتزيدوه بيصير كوبون بالدفتر، ونقّوا النوع بالملاحظات.",
  step2: "ابعتوا البطاقة",
  step2Text: "اكتبوا اسمكن وعنوانكن عالبطاقة وابعتوها عالواتساب، ومنأكّدلكن السعر والوقت.",
  step3: "عالنار، وصحتين",
  step3Text: "منحضّر ومنسلّم، وانتو بس قلوا أو اخبزوا أو سخّنوا.",

  boxOffice: "شبّاك التذاكر",
  contact: "ابعتولنا رسالة",
  followUs: "تابعونا",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  facebook: "فيسبوك",
  footerSections: "المنيو",
  theEnd: "النهاية",
  footerNote: "أكل بيتي · محضّر بالإيد · من مطبخ أم ميلانا",
};

export type Dict = typeof ar;

const en: Dict = {
  cart: "Coupon book",
  cartShort: "Coupons",
  close: "Close",
  switchLang: "عربي",
  switchLangLabel: "التحويل إلى العربية",
  navMenu: "Menu",
  navHow: "How to order",
  navContact: "Contact",

  heroPresents: "Em Milana's kitchen presents",
  heroTitle: "From our kitchen",
  heroTitleAccent: "to your table",
  heroStarring: "Starring",
  heroStars: "Kibbeh · Rkakat · Vine leaves · Coxinha · Pastries",
  heroDirected: "Directed by",
  heroDirector: "Em Milana, with Milana assisting",
  heroAudience: "1.4M+",
  heroAudienceLabel: "cook along",
  heroHandmade: "Made by hand",
  heroFrozen: "Fresh & frozen",
  browse: "See the menu",
  orderOnWhatsapp: "Order on WhatsApp",

  menuTitle: "What's cooking tonight?",
  menuHint: "Pick how you want to cook: fry, bake, cook, or ready to eat. Hover or tap a photo to see it in full colour.",
  all: "Full menu",
  items: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
  ticketNo: "No.",

  unavailable: "Sold out",
  bestSeller: "Deal",
  featureKicker: "The big feature",
  featureCta: "Add the deal",
  add: "Add",
  added: "✓ Done",
  details: "What's in it?",
  size: "Size",
  quantity: "Quantity",
  increase: "Increase",
  decrease: "Decrease",
  addToCart: (price: string) => `Add · ${price}`,
  addToCartNoPrice: "Add",
  perKilo: "per kilo",
  priceOnRequest: "Price on WhatsApp",
  photoBy: "Photo",

  cartHint: "One coupon per dish. Changed your mind? Tear it off.",
  emptyCart: "The book is still empty",
  emptyCartHint: "Add some kibbeh, some rkakat from the menu… and they'll turn up here as coupons.",
  remove: "Tear off",
  clearCart: "Tear out every coupon",
  subtotal: "Subtotal",
  delivery: "Delivery",
  deliveryFree: "Free",
  deliveryByArea: "Depends on area",
  total: "Total",
  totalOnWhatsapp: "Confirmed on WhatsApp",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "item" : "items"} priced on WhatsApp`,

  postcardTitle: "A postcard to Amouna",
  postcardLabel: "Carte postale",
  postmarkCity: "Beirut",
  stampCountry: "Liban",
  to: "To",
  name: "From",
  namePlaceholder: "Your name",
  address: "Address",
  addressPlaceholder: "Area, street, building",
  notes: "A note for Amouna",
  notesPlaceholder: "Kind of kibbeh, best time, anything…",
  sendOrder: "Post it on WhatsApp",
  posted: "Posted!",

  howTitle: "Ordering is quicker than frying",
  step1: "Pick from the menu",
  step1Text: "Every dish you add becomes a coupon in your book; tell us the kinds in the note.",
  step2: "Send the postcard",
  step2Text: "Write your name and address on the postcard and post it on WhatsApp; we confirm the price and time.",
  step3: "On the stove, enjoy",
  step3Text: "We prepare and hand it over; you just fry, bake or warm it up.",

  boxOffice: "Box office",
  contact: "Message us",
  followUs: "Follow us",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  footerSections: "Menu",
  theEnd: "The End",
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
