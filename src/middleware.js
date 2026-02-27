// src/middleware.js
import { NextResponse } from "next/server";

const GONE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>410 Gone</title><meta name="robots" content="noindex, nofollow"></head><body><h1>410 Gone</h1><p>This page has been permanently removed.</p><p><a href="/">Go to Home</a></p></body></html>`;

// Exact paths that should always return 410 Gone
// NOTE: Only path part (no domain, no query). Add more here from your 404 sheet.
const GONE_PATHS = new Set([
  // Examples – keep adding here:
  "/video-da0gsrh3-1Csz0MuJoWA", // example video URL
]);

// Prefix-based rules for old tracking / campaign URLs that should be treated as gone
const GONE_PREFIXES = [
  "/video-",          // https://www.dialexportmart.com/video-xxxxx
  "/company/video-",  // https://www.dialexportmart.com/company/video-xxxxx
  // Old product URLs with slug + id: /products/slug/ID
];

export function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // 1) Explicit 410 list
  if (GONE_PATHS.has(pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // 2) Old patterns we know should be permanently gone
  // - /india and children
  // - /video-*, /company/video-*
  // - Old product URLs: /products/slug/ID (2+ segments under /products)
  const isOldProductsUrl = pathname.startsWith("/products/") && pathname.split("/").length >= 4;

  if (
    pathname === "/india" ||
    pathname.startsWith("/india/") ||
    GONE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isOldProductsUrl
  ) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Protected route: redirect if not authenticated (customize as needed)
  if (pathname.startsWith("/protected-route")) {
    if (!req.cookies.get("authToken")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/india",
    "/india/:path*",
    "/protected-route/:path*",
    "/video-:path*",          // root-level video URLs
    "/company/video-:path*",  // company/video-* URLs
  ],
};
