import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { CATALOG_TAG } from "@/lib/catalog";
import { currentAdmin, type AdminRow } from "./auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

/** Validate a JSON request body; malformed input becomes a 400 with field messages. */
export async function body<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Request body must be JSON.");
  }
  return schema.parse(raw);
}

/** Visitors see admin edits immediately: drop the cached catalogue and pages built from it. */
export function contentChanged() {
  revalidateTag(CATALOG_TAG);
  // the shop pages are pre-built; rebuild them on their next visit
  revalidatePath("/", "layout");
}

type Ctx<P> = { params: Promise<P> };

/**
 * Wrap an admin route: rejects anyone not signed in (the middleware checks the
 * token too, this also checks it wasn't revoked), and turns errors into JSON.
 */
export function adminRoute<P = Record<string, never>>(
  handler: (req: Request, ctx: { params: P; admin: AdminRow }) => Promise<Response>,
) {
  return async (req: Request, { params }: Ctx<P>) => {
    try {
      const admin = await currentAdmin();
      if (!admin) return json({ error: "Not signed in." }, 401);
      return await handler(req, { params: await params, admin });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  if (err instanceof ZodError) {
    const fields = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return json({ error: fields[0] ? `${fields[0].path || "input"}: ${fields[0].message}` : "Invalid input.", fields }, 400);
  }
  console.error(err);
  return json({ error: "Something went wrong on the server." }, 500);
}

/** URL-safe id from a name, plus a short random suffix so ids never collide. */
export function makeId(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = crypto.randomUUID().slice(0, 6);
  return base ? `${base}-${suffix}` : `item-${suffix}`;
}
