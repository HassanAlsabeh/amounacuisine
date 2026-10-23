import { boolean, integer, jsonb, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import type { ProductImage } from "@/lib/types";

/**
 * One size/price option. Labels are stored in both languages side by side.
 * `travelFee`: extra for travel packaging per jar (per kilo when sold by weight); null or missing = no travel option.
 */
export type VariantRow = { labelAr: string; labelEn: string; price: number; travelFee?: number | null };

/** Legacy single choice (before option groups); still read from rows saved before. */
export type ChoiceRow = { labelAr: string; labelEn: string; options: { ar: string; en: string }[] };

/**
 * Something the customer picks (spice level, extra walnut…); the first option is the default.
 * `prices[i]` is what an option adds to variant i; a single price applies to every size.
 */
export type OptionGroupRow = { labelAr: string; labelEn: string; options: { ar: string; en: string; prices: number[] }[] };

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull().default(""),
  emoji: text("emoji").notNull().default(""),
  color: text("color").notNull().default("#888888"),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  emoji: text("emoji").notNull().default(""),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull().default(""),
  descriptionAr: text("description_ar").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  noteAr: text("note_ar").notNull().default(""),
  noteEn: text("note_en").notNull().default(""),
  storyAr: text("story_ar").notNull().default(""),
  storyEn: text("story_en").notNull().default(""),
  ingredientsAr: text("ingredients_ar").notNull().default(""),
  ingredientsEn: text("ingredients_en").notNull().default(""),
  variants: jsonb("variants").$type<VariantRow[]>().notNull(),
  choice: jsonb("choice").$type<ChoiceRow | null>(),
  options: jsonb("options").$type<OptionGroupRow[]>().notNull().default([]),
  /** Sold by weight in steps of this many kilos (variant prices are per kilo); null = sold per jar/piece. */
  weightStep: real("weight_step"),
  /** Show the photo guide to jar sizes (small jar, honey-kilo jar) in the product details. */
  sizeGuide: boolean("size_guide").notNull().default(false),
  available: boolean("available").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  image: jsonb("image").$type<ProductImage | null>(),
  sort: integer("sort").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Small documents: "settings" (site settings) and "texts" (interface text overrides). */
export const kv = pgTable("kv", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

/** The single super admin. */
export const admin = pgTable("admin", {
  id: integer("id").primaryKey().default(1),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** Bumped on password change so existing sessions stop working. */
  sessionVersion: integer("session_version").notNull().default(1),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

/* Kept next to the table definitions so the two can't drift apart unnoticed. */
export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#888888',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  emoji text NOT NULL DEFAULT '',
  name_ar text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  note_ar text NOT NULL DEFAULT '',
  note_en text NOT NULL DEFAULT '',
  variants jsonb NOT NULL,
  choice jsonb,
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  image jsonb,
  sort integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS story_ar text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS story_en text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients_ar text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients_en text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_step real;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id, sort);
CREATE TABLE IF NOT EXISTS kv (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS admin (
  id integer PRIMARY KEY DEFAULT 1,
  username text NOT NULL,
  password_hash text NOT NULL,
  session_version integer NOT NULL DEFAULT 1,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz
);
`;
