import { eq } from "drizzle-orm";
import { adminRoute, body, contentChanged, HttpError, json } from "@/server/api";
import { assertCategory, nextSort } from "@/server/admin-data";
import { getDb, schema } from "@/server/db";
import { productPatchSchema, productSchema } from "@/server/validation";

type P = { id: string };

async function find(id: string) {
  const db = await getDb();
  const row = await db.query.products.findFirst({ where: (t, { eq }) => eq(t.id, id) });
  if (!row) throw new HttpError(404, "Product not found.");
  return row;
}

export const GET = adminRoute<P>(async (_req, { params }) => json(await find(params.id)));

/** Full edit from the product form. */
export const PUT = adminRoute<P>(async (req, { params }) => {
  const input = await body(req, productSchema);
  const current = await find(params.id);
  await assertCategory(input.categoryId);
  const moved = current.categoryId !== input.categoryId;
  const db = await getDb();
  const [row] = await db
    .update(schema.products)
    .set({
      ...input,
      // a product moved to another category goes to the end of it
      ...(moved && { sort: await nextSort(schema.products, input.categoryId) }),
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, params.id))
    .returning();
  contentChanged();
  return json(row);
});

/** Quick toggles (available / featured) from the list. */
export const PATCH = adminRoute<P>(async (req, { params }) => {
  const input = await body(req, productPatchSchema);
  await find(params.id);
  const db = await getDb();
  const [row] = await db
    .update(schema.products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schema.products.id, params.id))
    .returning();
  contentChanged();
  return json(row);
});

export const DELETE = adminRoute<P>(async (_req, { params }) => {
  const db = await getDb();
  const deleted = await db.delete(schema.products).where(eq(schema.products.id, params.id)).returning({ id: schema.products.id });
  if (!deleted.length) throw new HttpError(404, "Product not found.");
  contentChanged();
  return json({ ok: true });
});
