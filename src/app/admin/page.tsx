import { redirect } from "next/navigation";
import { dictionaries, TEXT_KEYS } from "@/lib/i18n";
import { withSettingsDefaults } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { listCategories, listProducts } from "@/server/admin-data";
import { currentAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { AdminApp } from "./_components/AdminApp";

// always fresh: this page shows the live database, never a cached copy
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const db = await getDb();
  const [categories, products, kvRows] = await Promise.all([listCategories(), listProducts(), db.query.kv.findMany()]);
  const settings = withSettingsDefaults(kvRows.find((r) => r.key === "settings")!.value as Settings);
  const overrides = (kvRows.find((r) => r.key === "texts")?.value ?? { ar: {}, en: {} }) as { ar: Record<string, string>; en: Record<string, string> };

  return (
    <AdminApp
      username={admin.username}
      settings={settings}
      categories={categories}
      products={products.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }))}
      texts={TEXT_KEYS.map((key) => ({
        key,
        defaults: { ar: dictionaries.ar[key], en: dictionaries.en[key] },
        values: { ar: overrides.ar[key] ?? "", en: overrides.en[key] ?? "" },
      }))}
    />
  );
}
