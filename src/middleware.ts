import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PRIVATE_PREFIXES } from "@/lib/auth/callback-url";

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Coarse private-route gate (FR-006). Ownership still enforced in Server Actions
 * via requireSession / assertOwned — not here (research R5).
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (!isPrivatePath(pathname)) {
    return NextResponse.next();
  }
  if (req.auth) {
    return NextResponse.next();
  }
  const signIn = new URL("/sign-in", req.nextUrl.origin);
  signIn.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(signIn);
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/history/:path*",
    "/interview/:path*",
  ],
};
