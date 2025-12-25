import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Admin logged out" });
  response.cookies.set("adminToken", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0), // Expire immediately
    path: "/"
  });

  return response;
}
