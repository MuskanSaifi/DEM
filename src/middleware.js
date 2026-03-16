// src/middleware.js
import { NextResponse } from "next/server";

const GONE_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>410 Gone</title>
<meta name="robots" content="noindex, nofollow">
</head>
<body>
<h1>410 Gone</h1>
<p>This page has been permanently removed.</p>
</body>
</html>
`;

const GONE_PATHS = new Set([
  "/video-da0gsrh3-1Csz0MuJoWA",
]);

const GONE_PREFIXES = [
  "/video-",
  "/company/video-",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // ✅ COUNTRY IN → 410
  if (pathname === "/country/in") {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: { "Content-Type": "text/html" },
    });
  }

  // 1) Explicit 410 list
  if (GONE_PATHS.has(pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: { "Content-Type": "text/html" },
    });
  }

  // 2) Old patterns
  const isOldProductsUrl =
    pathname.startsWith("/products/") && pathname.split("/").length >= 4;

  if (
    pathname === "/india" ||
    pathname.startsWith("/india/") ||
    GONE_PREFIXES.some((p) => pathname.startsWith(p)) ||
    isOldProductsUrl
  ) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: { "Content-Type": "text/html" },
    });
  }

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
    "/country/:path*",
    "/protected-route/:path*",
    "/video-:path*",
    "/company/video-:path*",
  ],
};