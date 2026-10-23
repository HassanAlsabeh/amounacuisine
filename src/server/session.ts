// import only signing/verifying: the package root also pulls in JWE code the edge runtime warns about
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

/*
 * Signed session token for the super admin. No database access here, so the
 * middleware (edge runtime) can use it to gate /admin and /api/admin.
 */

export const SESSION_COOKIE = "fz_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // a week

export type SessionPayload = { sub: "admin"; v: number };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  return new TextEncoder().encode(s);
}

export async function signSession(sessionVersion: number) {
  return new SignJWT({ v: sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.sub !== "admin" || typeof payload.v !== "number") return null;
    return { sub: "admin", v: payload.v };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
