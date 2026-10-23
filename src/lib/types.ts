export type Lang = "ar" | "en";

export type Variant = {
  label: string;
  price: number;
  /** Extra charge for travel packaging, per jar (or per kilo when sold by weight). null: no travel option. */
  travelFee: number | null;
};

/** One answer of an option group. `prices[i]` is what it adds to variant i (negative makes it cheaper). */
export type OptionChoice = { label: string; prices: number[] };

/** Something the customer picks, like spice level or extra walnut. The first option is the default. */
export type OptionGroup = { label: string; options: OptionChoice[] };

export type ProductImage = {
  src: string;
  credit: string;
  link: string;
  alt: string;
};

export type Product = {
  id: string;
  category: string;
  name: string;
  emoji: string;
  description: string;
  note: string;
  /** Longer text shown in the product details: how it's made, how to eat it… */
  story: string;
  ingredients: string;
  variants: Variant[];
  options: OptionGroup[];
  /** Sold by weight: variant prices are per kilo and the customer picks the amount in steps of this many kilos. */
  weightStep: number | null;
  /** Show the photo guide to jar sizes in the product details. */
  sizeGuide: boolean;
  available: boolean;
  featured: boolean;
  image: ProductImage | null;
  /** English copy. The top-level fields are the Arabic source. */
  en: ProductText;
};

/** Customer-facing text of a product in one language. Lists follow the Arabic order. */
export type ProductText = {
  name: string;
  description: string;
  note: string;
  story: string;
  ingredients: string;
  variants: string[];
  options: { label: string; options: string[] }[];
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  nameEn: string;
};

export type Settings = {
  siteName: string;
  brandName: string;
  brandLatin: string;
  /** Small line under the brand name, e.g. "وبنات عمها السبعة". Empty hides it. */
  brandSubtitle: string;
  tagline: string;
  /** Path under /public or absolute URL. */
  logo: string;
  welcome: string;
  /** International format, digits only — used for wa.me links. */
  whatsappNumber: string;
  whatsappDisplay: string;
  currency: string;
  noCallsNotice: string;
  deliveryNotice: string;
  freeDeliveryProductIds: string[];
  travelPackaging: {
    enabled: boolean;
    /** Default travel fee for a newly added size in the admin; each size keeps its own fee. */
    pricePerUnit: number;
    label: string;
    hint: string;
  };
  instagramUrl: string;
  /** Added later than Instagram; settings saved before may not have them. */
  tiktokUrl?: string;
  facebookUrl?: string;
  en: SettingsText;
};

export type SettingsText = Pick<Settings, "siteName" | "brandName" | "brandSubtitle" | "tagline" | "welcome" | "noCallsNotice" | "deliveryNotice"> & {
  travelPackaging: { label: string; hint: string };
};

/** What a cart line says, in one language. */
export type LineText = {
  name: string;
  variantLabel: string;
  /** The customer's picks, e.g. { label: "نكهة الحر", value: "حر وسط" }. */
  options: { label: string; value: string }[];
};

export type CartLine = {
  key: string;
  productId: string;
  emoji: string;
  /** Price of one jar (or one kilo), options included, packaging not. */
  unitPrice: number;
  /** Jars, or kilos when `weightStep` is set. */
  qty: number;
  weightStep: number | null;
  travel: boolean;
  /** Travel packaging fee per jar / kilo; null when this item has no travel option. */
  travelFee: number | null;
  /** Both languages are stored so the cart follows a language switch; the WhatsApp order always uses Arabic. */
  text: Record<Lang, LineText>;
};

export type Customer = {
  name: string;
  address: string;
  notes: string;
};
