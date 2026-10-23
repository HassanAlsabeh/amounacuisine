import { adminRoute, body, contentChanged, json } from "@/server/api";
import { getDb, schema } from "@/server/db";
import { withSettingsDefaults } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { settingsSchema } from "@/server/validation";

export const GET = adminRoute(async () => {
  const db = await getDb();
  const row = await db.query.kv.findFirst({ where: (t, { eq }) => eq(t.key, "settings") });
  return json(row ? withSettingsDefaults(row.value as Settings) : null);
});

export const PUT = adminRoute(async (req) => {
  const settings = await body(req, settingsSchema);
  const db = await getDb();
  await db
    .insert(schema.kv)
    .values({ key: "settings", value: settings })
    .onConflictDoUpdate({ target: schema.kv.key, set: { value: settings } });
  contentChanged();
  return json(settings);
});
