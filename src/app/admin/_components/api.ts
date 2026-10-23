import type { schema } from "@/server/db";
import type { Settings } from "@/lib/types";

/* Shapes the admin API sends and receives (dates arrive as strings over JSON). */

export type Category = typeof schema.categories.$inferSelect & { productCount: number };
export type Product = Omit<typeof schema.products.$inferSelect, "updatedAt"> & { updatedAt: string };
export type ProductInput = Omit<Product, "id" | "sort" | "updatedAt">;
export type CategoryInput = Pick<Category, "nameAr" | "nameEn" | "emoji" | "color">;
export type TextEntry = { key: string; defaults: { ar: string; en: string }; values: { ar: string; en: string } };
export type { Settings };

export class ApiError extends Error {}

/** JSON request to the admin API. Signs the user out to the login page if the session ended. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method: init.method ?? "GET",
    headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401 && path !== "/login") {
    window.location.href = "/admin/login";
    throw new ApiError("Your session ended. Please sign in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

const MAX_SIDE = 1600;
const SHRINK_ABOVE_BYTES = 1024 * 1024;

/**
 * Phone photos are often several MB; shrink them in the browser to at most
 * 1600px as JPEG before uploading. Small images (and ones the browser can't
 * decode) are sent as they are.
 */
async function shrink(file: File): Promise<File> {
  if (file.size <= SHRINK_ABOVE_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; // transparent PNGs get a white background as JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", await shrink(file));
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Upload failed");
  return data.url as string;
}
