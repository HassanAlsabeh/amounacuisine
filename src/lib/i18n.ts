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
  cart: "العلبة",
  close: "إغلاق",
  switchLangLabel: "Switch to English",
  navMenu: "المنيو",
  navHow: "كيف منطلب",
  navContact: "تواصلوا",

  heroKicker: "أكل بيتي من مطبخ أم ميلانا",
  heroTitle: "أكل البيت،",
  heroTitleAccent: "معبّى وجاهز",
  browse: "يلّا عبّوا علبتكن",
  orderOnWhatsapp: "اطلبوا عالواتساب",
  portraitCaption: "إيمان وميلانا الزغيرة",
  statFollowers: "+١.٤ مليون",
  statFollowersLabel: "بيطبخوا معنا",
  statHands: "بالإيد",
  statHandsLabel: "كل حبّة كبة",
  statFrozen: "طازة",
  statFrozenLabel: "ومجلّدة عالفور",
  readyTitle: "كيف بدكن تحضّروا؟",

  menuTitle: "شو بدكن تعبّوا اليوم؟",
  menuHint: "كل صنف بخانتو: للقلي، للخبز، للطبخ أو جاهز للأكل. اختاروا ورتّبوا علبتكن.",
  all: "كل الخانات",
  items: (n: number) => `${n} ${n === 1 ? "صنف" : "أصناف"}`,

  unavailable: "خلص",
  add: "عبّوا",
  inBox: "بالعلبة",
  details: "شو فيها؟",
  back: "رجوع",
  size: "الحجم",
  increase: "زيادة",
  decrease: "إنقاص",
  addToCart: (price: string) => `عبّوا بالعلبة · ${price}`,
  addToCartNoPrice: "عبّوا بالعلبة",
  perKilo: "للكيلو",
  priceOnRequest: "السعر عالواتساب",
  photoBy: "الصورة",
  dealKicker: "عرض العلبة",
  offerCta: "زيدوا العرض",
  fillerTitle: "بدكن شي مش موجود؟",
  fillerText: "ابعتولنا عالواتساب، ومنشوف شو منقدر نحضّرلكن.",

  cartTitle: "علبتكن",
  slotsPacked: (used: number, total: number) => `${used} من ${total} خانات معبّاية`,
  stepPack: "عبّوا",
  stepLid: "سكّروا الغطا",
  stepSend: "ابعتوا",
  emptySlot: "خانة فاضية",
  emptySlotHint: "زيدوا من المنيو",
  emptyCart: "العلبة بعدها فاضية",
  emptyCartHint: "كل صنف بتختاروه من المنيو بياخد خانة هون.",
  remove: "شيلو",
  clearCart: "فضّوا العلبة",
  closeLid: "سكّروا الغطا",
  reopen: "افتحوا العلبة",
  labelTitle: "اكتبوا عالغطا",
  labelHint: "منبعتلكن الطلب مكتوب عالواتساب، ومنأكّد السعر ووقت التسليم.",
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

  howTitle: "الطلب أسرع من القلي",
  step1: "عبّوا العلبة",
  step1Text: "كل صنف بتختاروه بياخد خانة، وبتزيدوا وبتنقصوا متل ما بدكن.",
  step2: "سكّروا الغطا",
  step2Text: "اكتبوا اسمكن وعنوانكن، والطلب بيوصلنا مكتوب ومرتّب عالواتساب.",
  step3: "عالنار، وصحتين",
  step3Text: "منأكّدلكن السعر والوقت ومنسلّم، وانتو بس قلوا أو اخبزوا أو سخّنوا.",
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
  cart: "Box",
  close: "Close",
  switchLangLabel: "التحويل إلى العربية",
  navMenu: "Menu",
  navHow: "How to order",
  navContact: "Contact",

  heroKicker: "Home food from Em Milana's kitchen",
  heroTitle: "Home cooking,",
  heroTitleAccent: "packed and ready",
  browse: "Start packing your box",
  orderOnWhatsapp: "Order on WhatsApp",
  portraitCaption: "Iman and little Milana",
  statFollowers: "1.4M+",
  statFollowersLabel: "cook along with us",
  statHands: "By hand",
  statHandsLabel: "every single kibbeh",
  statFrozen: "Fresh",
  statFrozenLabel: "and frozen right away",
  readyTitle: "How do you want to cook?",

  menuTitle: "What goes in your box today?",
  menuHint: "Every dish in its own compartment: to fry, to bake, to cook or ready to eat. Pick and pack.",
  all: "Everything",
  items: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,

  unavailable: "Sold out",
  add: "Pack",
  inBox: "in the box",
  details: "What's inside?",
  back: "Back",
  size: "Size",
  increase: "Increase",
  decrease: "Decrease",
  addToCart: (price: string) => `Pack it · ${price}`,
  addToCartNoPrice: "Pack it",
  perKilo: "per kilo",
  priceOnRequest: "Price on WhatsApp",
  photoBy: "Photo",
  dealKicker: "Box deal",
  offerCta: "Add the deal",
  fillerTitle: "Looking for something else?",
  fillerText: "Message us on WhatsApp and we'll see what we can make for you.",

  cartTitle: "Your box",
  slotsPacked: (used: number, total: number) => `${used} of ${total} compartments packed`,
  stepPack: "Pack",
  stepLid: "Close the lid",
  stepSend: "Send",
  emptySlot: "Empty slot",
  emptySlotHint: "Add from the menu",
  emptyCart: "The box is still empty",
  emptyCartHint: "Every dish you pick from the menu takes a slot here.",
  remove: "Remove",
  clearCart: "Empty the box",
  closeLid: "Close the lid",
  reopen: "Open the box",
  labelTitle: "Write on the lid",
  labelHint: "Your order reaches us written out on WhatsApp; we confirm the price and time.",
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

  howTitle: "Ordering is quicker than frying",
  step1: "Pack the box",
  step1Text: "Every dish you pick takes a slot; add more or less as you like.",
  step2: "Close the lid",
  step2Text: "Write your name and address, and the order reaches us neatly on WhatsApp.",
  step3: "On the stove, enjoy",
  step3Text: "We confirm the price and time and hand it over; you just fry, bake or warm it up.",
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
