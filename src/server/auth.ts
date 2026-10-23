import "server-only";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb, schema, type Db } from "./db";
import { SESSION_COOKIE, verifySession } from "./session";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export type AdminRow = typeof schema.admin.$inferSelect;

/**
 * The admin account. It is created on first use from ADMIN_USERNAME and
 * ADMIN_PASSWORD; after that the password is changed from the admin panel and
 * those variables are no longer read.
 */
async function getAdmin(db: Db): Promise<AdminRow | null> {
  const existing = await db.query.admin.findFirst();
  if (existing) return existing;

  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || password.length < 8) return null;

  await db
    .insert(schema.admin)
    .values({ id: 1, username, passwordHash: await bcrypt.hash(password, 12) })
    .onConflictDoNothing();
  return (await db.query.admin.findFirst()) ?? null;
}

export type LoginResult =
  | { ok: true; sessionVersion: number }
  | { ok: false; reason: "invalid" | "locked" | "not-configured"; retryAfterMinutes?: number };

export async function login(username: string, password: string): Promise<LoginResult> {
  const db = await getDb();
  const admin = await getAdmin(db);
  if (!admin) return { ok: false, reason: "not-configured" };

  const now = new Date();
  if (admin.lockedUntil && admin.lockedUntil > now) {
    return { ok: false, reason: "locked", retryAfterMinutes: Math.ceil((admin.lockedUntil.getTime() - now.getTime()) / 60000) };
  }

  // always run bcrypt so a wrong username takes as long as a wrong password
  const passwordOk = await bcrypt.compare(password, admin.passwordHash);
  if (passwordOk && username.trim() === admin.username) {
    await db.update(schema.admin).set({ failedAttempts: 0, lockedUntil: null }).where(eq(schema.admin.id, admin.id));
    return { ok: true, sessionVersion: admin.sessionVersion };
  }

  const attempts = admin.failedAttempts + 1;
  const locked = attempts >= MAX_ATTEMPTS;
  await db
    .update(schema.admin)
    .set({
      failedAttempts: locked ? 0 : attempts,
      lockedUntil: locked ? new Date(now.getTime() + LOCK_MINUTES * 60000) : null,
    })
    .where(eq(schema.admin.id, admin.id));
  return locked ? { ok: false, reason: "locked", retryAfterMinutes: LOCK_MINUTES } : { ok: false, reason: "invalid" };
}

/**
 * The signed-in admin, or null. Checks the token signature and that the
 * session wasn't invalidated by a password change since it was issued.
 */
export async function currentAdmin(): Promise<AdminRow | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  const db = await getDb();
  const admin = await db.query.admin.findFirst();
  return admin && admin.sessionVersion === session.v ? admin : null;
}

export async function updateAccount(
  admin: AdminRow,
  input: { currentPassword: string; username: string; newPassword?: string },
): Promise<{ ok: true; sessionVersion: number } | { ok: false; error: string }> {
  if (!(await bcrypt.compare(input.currentPassword, admin.passwordHash))) return { ok: false, error: "Current password is incorrect." };

  const db = await getDb();
  const passwordChanged = Boolean(input.newPassword);
  const sessionVersion = passwordChanged ? admin.sessionVersion + 1 : admin.sessionVersion;
  await db
    .update(schema.admin)
    .set({
      username: input.username.trim(),
      ...(passwordChanged && { passwordHash: await bcrypt.hash(input.newPassword!, 12), sessionVersion }),
    })
    .where(eq(schema.admin.id, admin.id));
  return { ok: true, sessionVersion };
}
