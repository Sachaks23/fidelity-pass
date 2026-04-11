import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0]; // strip port if any
  const pathname = request.nextUrl.pathname;

  const isAdminSubdomain =
    hostname === "admin.fidco.fr" || hostname === "admin.localhost";

  // ─── Admin subdomain logic ────────────────────────────────────────────────
  if (isAdminSubdomain) {
    // Allow Next.js assets to pass through
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/api/admin-auth/")
    ) {
      return NextResponse.next();
    }

    const adminToken = request.cookies.get("admin-token")?.value;

    // Unauthenticated
    if (!adminToken) {
      // Allow access to login page itself
      if (pathname === "/admin-login") {
        return NextResponse.next();
      }
      // Redirect everything else to login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin-login";
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated: only allow admin routes
    if (
      pathname === "/admin-login" ||
      pathname === "/admin-dashboard" ||
      pathname.startsWith("/api/")
    ) {
      return NextResponse.next();
    }

    // Redirect any other path to dashboard
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/admin-dashboard";
    return NextResponse.redirect(dashUrl);
  }

  // ─── Main domain: block /admin/* ─────────────────────────────────────────
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/admin-login" ||
    pathname === "/admin-dashboard"
  ) {
    // Return 404 for these routes on the main domain
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
