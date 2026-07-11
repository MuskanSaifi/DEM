import { NextResponse } from "next/server";

/** Lightweight ping for mobile app connection test */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "dem-website",
    time: new Date().toISOString(),
  });
}
