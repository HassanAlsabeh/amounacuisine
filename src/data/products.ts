import type { OptionGroupRow, VariantRow } from "@/server/db/schema";
import type { ProductImage } from "@/lib/types";
import { PHOTOS } from "./photos";

/*
 * The menu of Amouna Cuisine (@amouna_cuisine), copied from the shop's WhatsApp catalogue.
 * Copied into an empty database on first run, and pushed over the live catalogue once whenever
 * CATALOG_VERSION goes up (see src/server/db/seed.ts). Between versions the admin panel is the source of truth.
 *
 * The catalogue only priced two items; every other price starts at 0, so the site shows
 * "price on WhatsApp" until the shop fills it in from the admin panel.
 * `note` holds the catalogue's short line under each name ("عدة أنواع", "جاهزة للخبز"…).
 */

export type SeedProduct = {
  id: string;
  categoryId: string;
  emoji: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  noteAr: string;
  noteEn: string;
  storyAr: string;
  storyEn: string;
  ingredientsAr: string;
  ingredientsEn: string;
  variants: VariantRow[];
  options: OptionGroupRow[];
  weightStep: number | null;
  sizeGuide: boolean;
  available: boolean;
  featured: boolean;
  image: ProductImage | null;
};

type Draft = Pick<SeedProduct, "id" | "categoryId" | "emoji" | "nameAr" | "nameEn" | "variants"> & Partial<SeedProduct>;

function product(d: Draft): SeedProduct {
  return {
    descriptionAr: "",
    descriptionEn: "",
    noteAr: "",
    noteEn: "",
    storyAr: "",
    storyEn: "",
    ingredientsAr: "",
    ingredientsEn: "",
    options: [],
    weightStep: null,
    sizeGuide: false,
    available: true,
    featured: false,
    image: PHOTOS[d.id] ?? null,
    ...d,
  };
}

/** A size or pack: Arabic and English label, price (0 = on request). Frozen food has no travel packaging. */
const pack = (labelAr: string, labelEn: string, price = 0): VariantRow => ({ labelAr, labelEn, price, travelFee: null });

type Text = { ar: string; en: string };
type Row = {
  id: string;
  cat: string;
  emoji: string;
  name: Text;
  note: Text;
  description: Text;
  variants?: VariantRow[];
  featured?: boolean;
};

const BOX = pack("علبة", "Box");

const row = (r: Row) =>
  product({
    id: r.id,
    categoryId: r.cat,
    emoji: r.emoji,
    nameAr: r.name.ar,
    nameEn: r.name.en,
    noteAr: r.note.ar,
    noteEn: r.note.en,
    descriptionAr: r.description.ar,
    descriptionEn: r.description.en,
    variants: r.variants ?? [BOX],
    featured: r.featured ?? false,
  });

/** In the order of the WhatsApp catalogue. */
export const CATALOG: SeedProduct[] = [
  {
    id: "potato-balls",
    cat: "fry",
    emoji: "🥔",
    name: { ar: "كرات البطاطا", en: "Potato Balls" },
    note: { ar: "عدة أنواع", en: "Several kinds" },
    description: { ar: "بطاطا مهروسة ومحشية ومغلّفة بالبقسماط، من الفريزر عالمقلاية مباشرة.", en: "Mashed potato balls, filled and crumbed, straight from the freezer into the pan." },
  },
  {
    id: "pastries",
    cat: "bake",
    emoji: "🥟",
    name: { ar: "معجنات", en: "Pastries" },
    note: { ar: "جاهزة للخبز", en: "Ready to bake" },
    description: { ar: "فطاير وسمبوسك ومعجنات بيتية، مشكّلة ومجلّدة. بتدخل الفرن وبتطلع متل ما طلعت من إيدنا.", en: "Home-made fatayer, sambousek and savoury pastries, shaped and frozen. Into the oven and out like they just left our hands." },
  },
  {
    id: "meal-300",
    cat: "eat",
    emoji: "🍱",
    name: { ar: "وجبة ٣٠٠ غرام لشخص واحد", en: "Single Meal, 300 g" },
    note: { ar: "جاهزة للأكل", en: "Ready to eat" },
    description: { ar: "طبخة البيت بحصّة شخص واحد، بتسخّنوها وبتاكلوها.", en: "Home cooking in a one-person portion. Heat it up and eat." },
    variants: [pack("وجبة ٣٠٠ غرام", "300 g meal")],
  },
  {
    id: "rkakat",
    cat: "fry",
    emoji: "🌯",
    name: { ar: "رقاقات جاهزة للقلي", en: "Rkakat, Ready to Fry" },
    note: { ar: "عدة أنواع", en: "Several kinds" },
    description: { ar: "رقاقات ملفوفة بالإيد ومحشية، بتنقلى دقايق وبتصير مقرمشة.", en: "Hand-rolled filled rkakat that turn crisp after a few minutes in the pan." },
  },
  {
    id: "coxinha",
    cat: "fry",
    emoji: "🍗",
    name: { ar: "كوشينيا", en: "Coxinha" },
    note: { ar: "عدة أنواع", en: "Several kinds" },
    description: { ar: "كوشينيا محشية دجاج ومغلّفة بالبقسماط، جاهزة للقلي.", en: "Chicken-filled coxinha in a golden crumb, ready to fry." },
  },
  {
    id: "vine-leaves-raw",
    cat: "cook",
    emoji: "🍃",
    name: { ar: "ورق عنب مفرز جاهز للطبخ", en: "Rolled Vine Leaves, Ready to Cook" },
    note: { ar: "٩٠٠ غرام", en: "900 g" },
    description: { ar: "ورق عنب ملفوف بالإيد ومجلّد. بتصفّوه بالطنجرة وبتطبخوه، والتعب علينا.", en: "Vine leaves rolled by hand and frozen. Line them up in the pot and cook; we did the hard part." },
    variants: [pack("٩٠٠ غرام", "900 g")],
  },
  {
    id: "shish-barak-kibbeh",
    cat: "offers",
    emoji: "🥟",
    name: { ar: "عرض الشيش برك والكبة", en: "Shish Barak & Kibbeh Deal" },
    note: { ar: "عرض", en: "Deal" },
    description: { ar: "شيش برك وكبة بعرض واحد، جاهزين للطبخ.", en: "Shish barak and kibbeh together in one deal, ready to cook." },
    variants: [pack("العرض", "The deal", 10)],
    featured: true,
  },
  {
    id: "kilo-meat",
    cat: "eat",
    emoji: "🍖",
    name: { ar: "كيلو بلحمة مطبوخ جاهز للأكل", en: "Cooked with Meat, per Kilo" },
    note: { ar: "جاهز للأكل", en: "Ready to eat" },
    description: { ar: "محشي بلحمة مطبوخ عالأصول، بتسخّنوه وعالسفرة.", en: "Stuffed and cooked with meat the proper way. Warm it up and serve." },
    variants: [pack("الكيلو", "Kilo", 35)],
  },
  {
    id: "kilo-oil",
    cat: "eat",
    emoji: "🫒",
    name: { ar: "كيلو بزيت مطبوخ", en: "Cooked in Olive Oil, per Kilo" },
    note: { ar: "جاهز للأكل", en: "Ready to eat" },
    description: { ar: "محشي بزيت مطبوخ وبارد، بيتاكل متل ما هوّي.", en: "Stuffed and cooked in olive oil, eaten cold just as it is." },
    variants: [pack("الكيلو", "Kilo")],
  },
  {
    id: "trays",
    cat: "bake",
    emoji: "🥘",
    name: { ar: "صواني جاهزة للخبز", en: "Oven Trays, Ready to Bake" },
    note: { ar: "سريعة التحضير", en: "Quick to make" },
    description: { ar: "صينية محضّرة كاملة، بتفوت عالفرن وبتطلع عالسفرة.", en: "A whole tray, prepared. Into the oven and onto the table." },
    variants: [pack("صينية", "Tray")],
  },
  {
    id: "kibbeh-fry",
    cat: "fry",
    emoji: "🧆",
    name: { ar: "كبة جاهزة للقلي", en: "Kibbeh, Ready to Fry" },
    note: { ar: "عدة أنواع", en: "Several kinds" },
    description: { ar: "أقراص كبة محشية ومشكّلة بالإيد، من الفريزر للمقلاية.", en: "Hand-shaped filled kibbeh, from the freezer to the pan." },
  },
  {
    id: "cabbage-rolls",
    cat: "cook",
    emoji: "🥬",
    name: { ar: "ملفوف محشي جاهز للطبخ", en: "Stuffed Cabbage, Ready to Cook" },
    note: { ar: "٩٠٠ غرام", en: "900 g" },
    description: { ar: "ملفوف ملفوف بالإيد ومحشي، بس بدو طنجرة ونار.", en: "Cabbage rolled and stuffed by hand; it just needs a pot and a flame." },
    variants: [pack("٩٠٠ غرام", "900 g")],
  },
].map(row);

/** Products from an earlier catalogue that a new version replaces; removed on upgrade. */
export const RETIRED_PRODUCT_IDS: string[] = [];
