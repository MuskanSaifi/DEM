import { NextResponse } from "next/server";
import { conferenceTwiml } from "@/lib/dem-calling/twilio";

/** PSTN client leg joins conference — normal phone call, no app/link */
export async function POST(req) {
  const conference =
    req.nextUrl.searchParams.get("conference") || "";
  if (!conference) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  return new NextResponse(conferenceTwiml(conference, "client"), {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET(req) {
  return POST(req);
}
