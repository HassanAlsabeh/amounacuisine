import { NextResponse } from "next/server";
import { login } from "@/server/auth";
import { body, errorResponse, json } from "@/server/api";
import { sessionCookie, signSession } from "@/server/session";
import { loginSchema } from "@/server/validation";

export async function POST(req: Request) {
  try {
    const { username, password } = await body(req, loginSchema);
    const result = await login(username, password);
    if (!result.ok) {
      if (result.reason === "locked")
        return json({ error: `Too many failed attempts. Try again in ${result.retryAfterMinutes} minutes.` }, 429);
      if (result.reason === "not-configured")
        return json({ error: "The admin account isn't set up. Set ADMIN_USERNAME and ADMIN_PASSWORD on the server." }, 503);
      return json({ error: "Wrong username or password." }, 401);
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookie(await signSession(result.sessionVersion)));
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
