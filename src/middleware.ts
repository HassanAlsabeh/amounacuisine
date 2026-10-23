import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/server/session";

const PUBLIC = ["/admin/login", "/api/admin/login"];

/** Gate everything under /admin and /api/admin behind the admin session. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // the session cookie is SameSite=Lax; also refuse writes coming from another site
  if (isApi && req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) {
      return NextResponse.json({ error: "Cross-site request refused." }, { status: 403 });
    }
  }

  if (PUBLIC.includes(pathname)) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const login = new URL("/admin/login", req.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
