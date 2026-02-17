import { NextResponse } from "next/server";

const GONE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>410 Gone</title><meta name="robots" content="noindex, nofollow"></head><body><h1>410 Gone</h1><p>This page has been permanently removed.</p><p><a href="/">Go to Home</a></p></body></html>`;

export function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // /india and /india/* → 410 Gone (permanently removed, not 404)
  if (pathname === "/india" || pathname.startsWith("/india/")) {
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
  ],
};
