import "server-only";

import { asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb, schema } from "@/server/db";
import type { OptionGroupRow } from "@/server/db/schema";
import { withSettingsDefaults } from "./settings";
import type { Category, Product, ProductText, Settings } from "./types";

type ProductRow = typeof schema.products.$inferSelect;

/*
 * Single entry point for site content, read from the database the admin panel
 * edits. Results are cached under the "catalog" tag; every admin save calls
 * revalidateTag(CATALOG_TAG), so visitors see changes right away.
 */

export const CATALOG_TAG = "catalog";

type TextOverrides = { ar: Record<string, string>; en: Record<string, string> };

/** An English field left empty in the admin falls back to the Arabic one. */
const or = (en: string, ar: string) => (en.trim() ? en : ar);

export const getSettings = unstable_cache(
  async (): Promise<Settings> => {
    const db = await getDb();
    const row = await db.query.kv.findFirst({ where: (t, { eq }) => eq(t.key, "settings") });
    return withSettingsDefaults(row!.value as Settings);
  },
  ["settings", "v4"],
  { tags: [CATALOG_TAG] },
);

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const db = await getDb();
    const rows = await db.select().from(schema.categories).orderBy(asc(schema.categories.sort), asc(schema.categories.id));
    return rows.map((c) => ({ id: c.id, name: c.nameAr, nameEn: or(c.nameEn, c.nameAr), emoji: c.emoji, color: c.color }));
  },
  ["categories", "v2"],
  { tags: [CATALOG_TAG] },
);

/** Option groups of a row; rows saved before option groups existed carry a single `choice` instead. */
export function optionGroups(p: Pick<ProductRow, "options" | "choice">): OptionGroupRow[] {
  if (p.options?.length) return p.options;
  if (!p.choice) return [];
  return [{ ...p.choice, options: p.choice.options.map((o) => ({ ...o, prices: [0] })) }];
}

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const db = await getDb();
    const rows = await db.select().from(schema.products).orderBy(asc(schema.products.sort), asc(schema.products.id));
    return rows.map((p) => {
      const groups = optionGroups(p);
      const en: ProductText = {
        name: or(p.nameEn, p.nameAr),
        description: or(p.descriptionEn, p.descriptionAr),
        note: or(p.noteEn, p.noteAr),
        story: or(p.storyEn, p.storyAr),
        ingredients: or(p.ingredientsEn, p.ingredientsAr),
        variants: p.variants.map((v) => or(v.labelEn, v.labelAr)),
        options: groups.map((g) => ({ label: or(g.labelEn, g.labelAr), options: g.options.map((o) => or(o.en, o.ar)) })),
      };
      return {
        id: p.id,
        category: p.categoryId,
        name: p.nameAr,
        emoji: p.emoji,
        description: p.descriptionAr,
        note: p.noteAr,
        story: p.storyAr,
        ingredients: p.ingredientsAr,
        variants: p.variants.map((v) => ({ label: v.labelAr, price: v.price, travelFee: v.travelFee ?? null })),
        options: groups.map((g) => ({ label: g.labelAr, options: g.options.map((o) => ({ label: o.ar, prices: o.prices })) })),
        weightStep: p.weightStep && p.weightStep > 0 ? p.weightStep : null,
        sizeGuide: p.sizeGuide ?? false,
        available: p.available,
        featured: p.featured,
        image: p.image,
        en,
      };
    });
  },
  ["products", "v5"],
  { tags: [CATALOG_TAG] },
);

/** Interface text the admin has overridden, per language. */
export const getTextOverrides = unstable_cache(
  async (): Promise<TextOverrides> => {
    const db = await getDb();
    const row = await db.query.kv.findFirst({ where: (t, { eq }) => eq(t.key, "texts") });
    return (row?.value as TextOverrides | undefined) ?? { ar: {}, en: {} };
  },
  ["texts", "v3"],
  { tags: [CATALOG_TAG] },
);
