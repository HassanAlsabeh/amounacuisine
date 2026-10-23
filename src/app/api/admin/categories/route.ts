import { adminRoute, body, contentChanged, json, makeId } from "@/server/api";
import { listCategories, nextSort } from "@/server/admin-data";
import { getDb, schema } from "@/server/db";
import { categorySchema } from "@/server/validation";

export const GET = adminRoute(async () => json(await listCategories()));

export const POST = adminRoute(async (req) => {
  const input = await body(req, categorySchema);
  const db = await getDb();
  const [row] = await db
    .insert(schema.categories)
    .values({ ...input, id: makeId(input.nameEn || "category"), sort: await nextSort(schema.categories) })
    .returning();
  contentChanged();
  return json({ ...row, productCount: 0 }, 201);
});
