import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { HttpError } from "./api";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
// Vercel rejects request bodies over 4.5 MB; the admin shrinks photos before upload anyway
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Store an uploaded photo and return its public URL. On Vercel it goes to
 * Vercel Blob (BLOB_READ_WRITE_TOKEN is set when a Blob store is connected);
 * locally it's written to public/uploads.
 */
export async function saveImage(file: File): Promise<string> {
  const ext = TYPES[file.type];
  if (!ext) throw new HttpError(400, "Upload a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(400, "Images must be 4 MB or smaller.");

  const name = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) throw new HttpError(500, "Photo storage isn't set up: connect a Vercel Blob store to this project.");

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
