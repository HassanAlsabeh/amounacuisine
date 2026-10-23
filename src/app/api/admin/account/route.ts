import { NextResponse } from "next/server";
import { updateAccount } from "@/server/auth";
import { adminRoute, body, json } from "@/server/api";
import { sessionCookie, signSession } from "@/server/session";
import { accountSchema } from "@/server/validation";

export const GET = adminRoute(async (_req, { admin }) => json({ username: admin.username }));

export const PUT = adminRoute(async (req, { admin }) => {
  const input = await body(req, accountSchema);
  const result = await updateAccount(admin, input);
  if (!result.ok) return json({ error: result.error }, 400);
  // a new password signs out every other session; keep this one signed in
  const res = NextResponse.json({ ok: true, username: input.username });
  res.cookies.set(sessionCookie(await signSession(result.sessionVersion)));
  return res;
});
