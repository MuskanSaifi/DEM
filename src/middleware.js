import { NextResponse } from "next/server";

export function middleware(req) {
  console.log("Middleware executed"); // Debugging log
  // Example: Redirect if not authenticated (customize as needed)
  if (!req.cookies.get("authToken")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// (Optional) Define the paths this middleware should run on
export const config = {
  matcher: "/protected-route/:path*", // Adjust this to match your routes
};
