import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_PREFIXES } from "@/lib/auth/callback-url";

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Auth.js database-session cookie names (dev + secure prod). */
function hasSessionCookie(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value,
  );
}

/**
 * Coarse private-route gate (FR-006; research R5).
 * Cookie presence only — Prisma/Auth adapter must stay off Edge.
 * Real session validity is enforced in `(app)/layout` via `auth()`.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isPrivatePath(pathname) || hasSessionCookie(req)) {
    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", req.nextUrl.origin);
  signIn.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/resume",
    "/resume/:path*",
    "/history",
    "/history/:path*",
    "/interview",
    "/interview/:path*",
  ],
};
