import { getCategories, getProducts, getSettings } from "@/lib/catalog";

/**
 * Public, read-only catalogue (settings, categories, products) in both
 * languages, for any future client such as a mobile app. Cached like the site.
 */
export async function GET() {
  const [settings, categories, products] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  return Response.json({ settings, categories, products });
}
