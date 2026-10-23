import "server-only";

import { count, inArray, sql } from "drizzle-orm";
import categoriesJson from "@/data/categories.json";
import en from "@/data/en.json";
import { CATALOG, RETIRED_PRODUCT_IDS } from "@/data/products";
import settingsJson from "@/data/settings.json";
import type { Settings, SettingsText } from "@/lib/types";
import type { Db } from "./index";
import { categories, kv, products } from "./schema";

/*
 * src/data holds the catalogue from the shop's Instagram menus. It's copied into an empty
 * database once. Raising CATALOG_VERSION pushes it over a live database on the
 * next request after deploy (prices, sizes, options, texts, availability);
 * photos uploaded from the admin panel are kept. Between versions the admin
 * panel is the source of truth.
 */
export const CATALOG_VERSION = 1;

const enCats = en.categories as Record<string, string>;

const categoryRows = () =>
  categoriesJson.map((c, i) => ({ id: c.id, nameAr: c.name, nameEn: enCats[c.id] ?? "", emoji: c.emoji, color: c.color, sort: i }));

const productRows = () => CATALOG.map((p, i) => ({ ...p, choice: null, sort: i }));

const seedSettings = (): Settings => ({ ...(settingsJson as Omit<Settings, "en">), en: en.settings as SettingsText });

export async function seedIfEmpty(db: Db) {
  const [{ n }] = await db.select({ n: count() }).from(categories);
  if (n > 0) return;

  // two cold starts can race to seed; whoever is second just skips
  await db.insert(categories).values(categoryRows()).onConflictDoNothing();
  await db.insert(products).values(productRows()).onConflictDoNothing();
  await db
    .insert(kv)
    .values([
      { key: "settings", value: seedSettings() },
      { key: "texts", value: { ar: {}, en: {} } },
      { key: "catalogVersion", value: CATALOG_VERSION },
    ])
    .onConflictDoNothing();
}

/** Bring a database seeded from an older catalogue up to CATALOG_VERSION. Safe to run twice at once. */
export async function syncCatalog(db: Db) {
  const row = await db.query.kv.findFirst({ where: (t, { eq }) => eq(t.key, "catalogVersion") });
  if (Number(row?.value ?? 1) >= CATALOG_VERSION) return;

  const excluded = (col: string) => sql.raw(`excluded.${col}`);

  await db
    .insert(categories)
    .values(categoryRows())
    .onConflictDoUpdate({
      target: categories.id,
      set: { nameAr: excluded("name_ar"), nameEn: excluded("name_en"), emoji: excluded("emoji"), color: excluded("color"), sort: excluded("sort") },
    });

  await db
    .insert(products)
    .values(productRows())
    .onConflictDoUpdate({
      target: products.id,
      set: {
        categoryId: excluded("category_id"),
        emoji: excluded("emoji"),
        nameAr: excluded("name_ar"),
        nameEn: excluded("name_en"),
        descriptionAr: excluded("description_ar"),
        descriptionEn: excluded("description_en"),
        noteAr: excluded("note_ar"),
        noteEn: excluded("note_en"),
        storyAr: excluded("story_ar"),
        storyEn: excluded("story_en"),
        ingredientsAr: excluded("ingredients_ar"),
        ingredientsEn: excluded("ingredients_en"),
        variants: excluded("variants"),
        choice: sql`NULL`,
        options: excluded("options"),
        weightStep: excluded("weight_step"),
        available: excluded("available"),
        featured: excluded("featured"),
        sort: excluded("sort"),
        // a photo uploaded in the admin panel stays; stock photos are replaced
        image: sql`CASE WHEN products.image IS NULL OR products.image->>'src' LIKE 'https://images.unsplash.com/%' THEN excluded.image ELSE products.image END`,
        updatedAt: sql`now()`,
      },
    });

  if (RETIRED_PRODUCT_IDS.length) await db.delete(products).where(inArray(products.id, RETIRED_PRODUCT_IDS));

  // the welcome wording follows the catalogue; the rest of the settings stay as edited
  const current = await db.query.kv.findFirst({ where: (t, { eq }) => eq(t.key, "settings") });
  if (current) {
    const s = current.value as Settings;
    const fresh = seedSettings();
    const next: Settings = {
      ...s,
      tagline: fresh.tagline,
      welcome: fresh.welcome,
      en: { ...s.en, tagline: fresh.en.tagline, welcome: fresh.en.welcome },
    };
    await db.update(kv).set({ value: next }).where(sql`${kv.key} = 'settings'`);
  }

  await db
    .insert(kv)
    .values({ key: "catalogVersion", value: CATALOG_VERSION })
    .onConflictDoUpdate({ target: kv.key, set: { value: CATALOG_VERSION } });
}
