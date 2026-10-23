import { adminRoute, body, contentChanged, json, makeId } from "@/server/api";
import { assertCategory, listProducts, nextSort } from "@/server/admin-data";
import { getDb, schema } from "@/server/db";
import { productSchema } from "@/server/validation";

export const GET = adminRoute(async () => json(await listProducts()));

export const POST = adminRoute(async (req) => {
  const input = await body(req, productSchema);
  await assertCategory(input.categoryId);
  const db = await getDb();
  const [row] = await db
    .insert(schema.products)
    .values({
      ...input,
      id: makeId(input.nameEn || "product"),
      sort: await nextSort(schema.products, input.categoryId),
    })
    .returning();
  contentChanged();
  return json(row, 201);
});
