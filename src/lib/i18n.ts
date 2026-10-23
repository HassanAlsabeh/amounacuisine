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
  cart: "الصندوق",
  close: "إغلاق",
  switchLang: "English",
  switchLangLabel: "Switch to English",
  navMenu: "الفريزر",
  navHow: "كيف منطلب",
  navContact: "تواصلوا",

  heroKicker: "مجلّد عالطازة · محضّر بالإيد",
  heroTitle: "طبخة أم ميلانا",
  heroTitleAccent: "بفريزركن",
  wipeHint: "امسحوا البخار عن القزاز",
  browse: "افتحوا الفريزر",
  orderOnWhatsapp: "اطلبوا عالواتساب",
  factsTitle: "القيم الغذائية",
  factsServing: "الحصّة: سفرة كاملة",
  factFollowers: "طبّاخين معنا",
  factFollowersValue: "+1.4M",
  factHands: "محضّر بالإيد",
  factHandsValue: "100%",
  factEffort: "التعب عليكن",
  factEffortValue: "0%",
  ticker: "جاهز للقلي · جاهز للخبز · جاهز للطبخ · جاهز للأكل · محضّر بالإيد · الطلب عالواتساب",

  menuTitle: "ممرّ الفريزر",
  menuHint: "اختاروا البرّاد، بينفتح الباب، وخدوا اللي بدكن عالصندوق.",
  all: "كل البرّادات",
  items: (n: number) => `${n} ${n === 1 ? "صنف" : "أصناف"}`,

  unavailable: "خلص",
  deal: "عرض",
  dealBanner: "عرض الفريزر",
  add: "زيدوا",
  details: "قلبوا العلبة",
  back: "رجّعوها",
  size: "الحجم",
  quantity: "الكمية",
  increase: "زيادة",
  decrease: "إنقاص",
  addToCart: (price: string) => `عالصندوق · ${price}`,
  addToCartNoPrice: "عالصندوق",
  perKilo: "للكيلو",
  priceOnRequest: "السعر عالواتساب",
  flashAsk: "اسألوا عالسعر",
  byWeight: "بالكيلو",
  keepFrozen: "يُحفظ مجلّد",
  photoBy: "الصورة",
  ingredients: "المكوّنات",
  prepTitle: "طريقة التحضير",
  methodFry: "من الفريزر عالمقلاية مباشرة، بلا ما تذوّبوها. دقايق وبتصير مقرمشة.",
  methodBake: "عالصينية وعالفرن الحامي، لحتى تحمرّ.",
  methodCook: "صفّوها بالطنجرة متل ما بتحبّوا، وعالنار.",
  methodEat: "سخّنوها شوي، وعالسفرة.",
  methodOther: "منقلكن كيف تحضّروها بس تطلبوا عالواتساب.",

  cartTitle: "عالصندوق",
  laneSign: "صندوق رقم 1",
  cartHint: "كل شي اخترتوه عم يوصل عالشريط.",
  emptyCart: "الشريط بعدو فاضي",
  emptyCartHint: "روحوا عالفريزر وجيبوا شي كبة، شي رقاقات… وبتوصل لهون.",
  backToAisle: "رجعوا عالفريزر",
  remove: "شيلو",
  clearCart: "فضّوا الشريط",
  beltCount: (n: number) => `${n} ${n === 1 ? "قطعة" : "قطع"} عالشريط`,
  nextCustomer: "الزبون اللي بعدو",
  slipTitle: "لوين منوصّل؟",
  name: "الإسم",
  namePlaceholder: "مين عم يطلب؟",
  address: "المنطقة والعنوان",
  addressPlaceholder: "وين منوصّل؟",
  notes: "ملاحظات",
  notesPlaceholder: "نوع الكبة، الوقت المناسب، أي شي…",
  subtotal: "المجموع",
  delivery: "التوصيل",
  deliveryFree: "مجاني",
  deliveryByArea: "حسب المنطقة",
  total: "الإجمالي",
  totalOnWhatsapp: "منأكّدو عالواتساب",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "صنف سعرو" : "أصناف سعرها"} عالواتساب`,
  sendOrder: "ابعتوا الطلب عالواتساب",
  payAtDoor: "والدفع عالباب، وقت التسليم",

  howTitle: "الطلب أسرع من القلي",
  step1: "خدوا من الفريزر",
  step1Text: "زيدوا عالصندوق شو ما بدكن، ونقّوا النوع بالملاحظات.",
  step2: "ابعتوا عالواتساب",
  step2Text: "الطلب بيوصلنا مكتوب ومرتّب، ومنأكّدلكن السعر والوقت.",
  step3: "عالنار، وصحتين",
  step3Text: "منحضّر ومنسلّم، وانتو بس قلوا أو اخبزوا أو اطبخوا.",
  contact: "أو ابعتولنا رسالة",
  followUs: "تابعونا",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  facebook: "فيسبوك",
  footerSections: "البرّادات",
  footerNote: "أكل بيتي · محضّر بالإيد · من مطبخ أم ميلانا",
};

export type Dict = typeof ar;

const en: Dict = {
  cart: "Checkout",
  close: "Close",
  switchLang: "عربي",
  switchLangLabel: "التحويل إلى العربية",
  navMenu: "The freezer",
  navHow: "How to order",
  navContact: "Contact",

  heroKicker: "Frozen fresh · made by hand",
  heroTitle: "Em Milana's cooking,",
  heroTitleAccent: "in your freezer",
  wipeHint: "Wipe the frost off the glass",
  browse: "Open the freezer",
  orderOnWhatsapp: "Order on WhatsApp",
  factsTitle: "Kitchen facts",
  factsServing: "Serving size: one full table",
  factFollowers: "Cooking along",
  factFollowersValue: "1.4M+",
  factHands: "Made by hand",
  factHandsValue: "100%",
  factEffort: "Effort on your side",
  factEffortValue: "0%",
  ticker: "Ready to fry · Ready to bake · Ready to cook · Ready to eat · Made by hand · Order on WhatsApp",

  menuTitle: "The freezer aisle",
  menuHint: "Pick a freezer, the door slides open; take what you like to the checkout.",
  all: "Every freezer",
  items: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,

  unavailable: "Sold out",
  deal: "Deal",
  dealBanner: "Freezer deal",
  add: "Add",
  details: "Turn the box",
  back: "Put it back",
  size: "Size",
  quantity: "Quantity",
  increase: "Increase",
  decrease: "Decrease",
  addToCart: (price: string) => `To checkout · ${price}`,
  addToCartNoPrice: "To checkout",
  perKilo: "per kilo",
  priceOnRequest: "Price on WhatsApp",
  flashAsk: "Ask the price",
  byWeight: "By the kilo",
  keepFrozen: "Keep frozen",
  photoBy: "Photo",
  ingredients: "Ingredients",
  prepTitle: "How to cook",
  methodFry: "Straight from the freezer into hot oil, no thawing. A few minutes and it's crisp.",
  methodBake: "Onto a tray and into a hot oven until golden.",
  methodCook: "Line them up in the pot the way you like, and onto the flame.",
  methodEat: "Warm it up a little, and serve.",
  methodOther: "We'll tell you how to make it when you order on WhatsApp.",

  cartTitle: "Checkout",
  laneSign: "Lane 1",
  cartHint: "Everything you picked is rolling in on the belt.",
  emptyCart: "The belt is still empty",
  emptyCartHint: "Grab some kibbeh, some rkakat from the freezer… and they'll roll in here.",
  backToAisle: "Back to the freezer",
  remove: "Remove",
  clearCart: "Clear the belt",
  beltCount: (n: number) => `${n} ${n === 1 ? "piece" : "pieces"} on the belt`,
  nextCustomer: "Next customer",
  slipTitle: "Where do we deliver?",
  name: "Name",
  namePlaceholder: "Who's ordering?",
  address: "Area & address",
  addressPlaceholder: "Where do we deliver?",
  notes: "Notes",
  notesPlaceholder: "Kind of kibbeh, best time, anything…",
  subtotal: "Subtotal",
  delivery: "Delivery",
  deliveryFree: "Free",
  deliveryByArea: "Depends on area",
  total: "Total",
  totalOnWhatsapp: "Confirmed on WhatsApp",
  unpricedLines: (n: number) => `${n} ${n === 1 ? "item" : "items"} priced on WhatsApp`,
  sendOrder: "Send the order on WhatsApp",
  payAtDoor: "Pay at the door on delivery",

  howTitle: "Ordering is quicker than frying",
  step1: "Take from the freezer",
  step1Text: "Add whatever you like to the checkout, and tell us the kinds in the notes.",
  step2: "Send it on WhatsApp",
  step2Text: "Your order reaches us written out; we confirm the price and time.",
  step3: "On the stove, enjoy",
  step3Text: "We prepare and hand it over; you just fry, bake or cook.",
  contact: "Or just message us",
  followUs: "Follow us",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  footerSections: "Freezers",
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
