import { eq } from "drizzle-orm";
import { adminRoute, body, contentChanged, json } from "@/server/api";
import { getDb, schema } from "@/server/db";
import { reorderSchema } from "@/server/validation";

/** Body: { ids } — the products of one category in their new display order. */
export const POST = adminRoute(async (req) => {
  const { ids } = await body(req, reorderSchema);
  const db = await getDb();
  await Promise.all(ids.map((id, i) => db.update(schema.products).set({ sort: i }).where(eq(schema.products.id, id))));
  contentChanged();
  return json({ ok: true });
});
