import { count, eq } from "drizzle-orm";
import { adminRoute, body, contentChanged, HttpError, json } from "@/server/api";
import { getDb, schema } from "@/server/db";
import { categorySchema } from "@/server/validation";

type P = { id: string };

export const PUT = adminRoute<P>(async (req, { params }) => {
  const input = await body(req, categorySchema);
  const db = await getDb();
  const [row] = await db.update(schema.categories).set(input).where(eq(schema.categories.id, params.id)).returning();
  if (!row) throw new HttpError(404, "Category not found.");
  contentChanged();
  return json(row);
});

export const DELETE = adminRoute<P>(async (_req, { params }) => {
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(schema.products).where(eq(schema.products.categoryId, params.id));
  if (n > 0) throw new HttpError(409, `This category still has ${n} product(s). Move or delete them first.`);
  const deleted = await db.delete(schema.categories).where(eq(schema.categories.id, params.id)).returning();
  if (!deleted.length) throw new HttpError(404, "Category not found.");
  contentChanged();
  return json({ ok: true });
});
