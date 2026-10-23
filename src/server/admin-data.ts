import "server-only";

import { asc, count, eq, max } from "drizzle-orm";
import { getDb, schema } from "./db";
import { HttpError } from "./api";

export type ProductRow = typeof schema.products.$inferSelect;
export type CategoryRow = typeof schema.categories.$inferSelect;

export async function listCategories() {
  const db = await getDb();
  const [rows, counts] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sort), asc(schema.categories.id)),
    db.select({ categoryId: schema.products.categoryId, n: count() }).from(schema.products).groupBy(schema.products.categoryId),
  ]);
  const byId = new Map(counts.map((c) => [c.categoryId, c.n]));
  return rows.map((c) => ({ ...c, productCount: byId.get(c.id) ?? 0 }));
}

export async function listProducts() {
  const db = await getDb();
  return db.select().from(schema.products).orderBy(asc(schema.products.sort), asc(schema.products.id));
}

export async function assertCategory(id: string) {
  const db = await getDb();
  const found = await db.query.categories.findFirst({ where: (t, { eq }) => eq(t.id, id) });
  if (!found) throw new HttpError(400, "That category doesn't exist.");
}

/** Next sort position at the end of a list. */
export async function nextSort(table: typeof schema.products | typeof schema.categories, categoryId?: string) {
  const db = await getDb();
  const q = db.select({ m: max(table.sort) }).from(table);
  const [{ m }] = categoryId ? await q.where(eq(schema.products.categoryId, categoryId)) : await q;
  return (m ?? -1) + 1;
}
