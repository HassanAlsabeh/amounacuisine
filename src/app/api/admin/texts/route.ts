import { dictionaries, TEXT_KEYS } from "@/lib/i18n";
import { adminRoute, body, contentChanged, json } from "@/server/api";
import { getDb, schema } from "@/server/db";
import { textsSchema } from "@/server/validation";

/** Every editable interface text with its built-in default and the current override. */
export const GET = adminRoute(async () => {
  const db = await getDb();
  const row = await db.query.kv.findFirst({ where: (t, { eq }) => eq(t.key, "texts") });
  const overrides = (row?.value ?? { ar: {}, en: {} }) as { ar: Record<string, string>; en: Record<string, string> };
  return json({
    keys: TEXT_KEYS.map((key) => ({
      key,
      defaults: { ar: dictionaries.ar[key], en: dictionaries.en[key] },
      values: { ar: overrides.ar[key] ?? "", en: overrides.en[key] ?? "" },
    })),
  });
});

export const PUT = adminRoute(async (req) => {
  const texts = await body(req, textsSchema);
  const db = await getDb();
  await db.insert(schema.kv).values({ key: "texts", value: texts }).onConflictDoUpdate({ target: schema.kv.key, set: { value: texts } });
  contentChanged();
  return json(texts);
});
