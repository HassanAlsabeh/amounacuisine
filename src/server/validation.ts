import { z } from "zod";
import { TEXT_KEYS } from "@/lib/i18n";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1, "Required").max(max);

/** A site path ("/logo.jpg") or an https URL. */
const imageSrc = z
  .string()
  .trim()
  .max(2000)
  .refine((s) => s.startsWith("/") || /^https:\/\/[^\s]+$/.test(s), "Must be an https:// link or a /path");

export const imageSchema = z.object({
  src: imageSrc,
  alt: text(300).default(""),
  credit: text(200).default(""),
  link: text(2000).default(""),
});

export const productSchema = z.object({
  categoryId: required(100),
  emoji: text(16).default(""),
  nameAr: required(200),
  nameEn: text(200).default(""),
  descriptionAr: text(2000).default(""),
  descriptionEn: text(2000).default(""),
  noteAr: text(300).default(""),
  noteEn: text(300).default(""),
  storyAr: text(5000).default(""),
  storyEn: text(5000).default(""),
  ingredientsAr: text(1000).default(""),
  ingredientsEn: text(1000).default(""),
  variants: z
    .array(
      z.object({
        labelAr: required(100),
        labelEn: text(100).default(""),
        price: z.number().min(0).max(1_000_000),
        travelFee: z.number().min(0).max(10_000).nullable().default(null),
      }),
    )
    .min(1, "Add at least one size/price")
    .max(30),
  // replaced by option groups; always cleared on save
  choice: z
    .null()
    .optional()
    .transform(() => null),
  options: z
    .array(
      z.object({
        labelAr: required(100),
        labelEn: text(100).default(""),
        options: z
          .array(
            z.object({
              ar: required(100),
              en: text(100).default(""),
              prices: z.array(z.number().min(-1_000_000).max(1_000_000)).max(30).default([0]),
            }),
          )
          .min(1, "Add at least one option")
          .max(30),
      }),
    )
    .max(10)
    .default([]),
  weightStep: z.number().min(0.05).max(10).nullable().default(null),
  sizeGuide: z.boolean().default(false),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  image: imageSchema.nullable().default(null),
});

/** Quick toggles from the product list. */
export const productPatchSchema = z.object({ available: z.boolean(), featured: z.boolean() }).partial();

export const categorySchema = z.object({
  nameAr: required(100),
  nameEn: text(100).default(""),
  emoji: text(16).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #c4492a"),
});

export const reorderSchema = z.object({ ids: z.array(z.string()).min(1).max(1000) });

const settingsTextSchema = z.object({
  siteName: required(120),
  brandName: required(120),
  brandSubtitle: text(120).default(""),
  tagline: text(200),
  welcome: text(1000),
  noCallsNotice: text(300),
  deliveryNotice: text(300),
  travelPackaging: z.object({ label: text(100), hint: text(300) }),
});

export const settingsSchema = settingsTextSchema.extend({
  brandLatin: required(120),
  logo: imageSrc,
  whatsappNumber: z.string().trim().regex(/^\d{8,15}$/, "Digits only, with country code (e.g. 9613572560)"),
  whatsappDisplay: required(40),
  currency: required(8),
  freeDeliveryProductIds: z.array(z.string()).max(200),
  travelPackaging: z.object({
    enabled: z.boolean(),
    pricePerUnit: z.number().min(0).max(10_000),
    label: text(100),
    hint: text(300),
  }),
  instagramUrl: z.union([z.literal(""), z.string().trim().url().max(500)]),
  tiktokUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).default(""),
  facebookUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).default(""),
  en: settingsTextSchema,
});

const overrides = z
  .record(z.string(), z.string().max(1000))
  .transform((r) => Object.fromEntries(TEXT_KEYS.filter((k) => r[k]?.trim()).map((k) => [k, r[k].trim()])));

export const textsSchema = z.object({ ar: overrides, en: overrides });

export const loginSchema = z.object({ username: z.string().max(100), password: z.string().max(200) });

export const accountSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(200),
  username: z.string().trim().min(3, "At least 3 characters").max(60),
  newPassword: z.union([z.literal(""), z.string().min(8, "At least 8 characters").max(200)]).optional(),
});
