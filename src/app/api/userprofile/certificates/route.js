import connectdb from "@/lib/dbConnect";
import { getJwtSecret } from "@/lib/env";
import jwt from "jsonwebtoken";
import Certificate from "@/models/Certificate";

export async function GET(req) {
  try {
    await connectdb();

    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ success: false, message: "No token provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : authorizationHeader;

    const decoded = jwt.verify(token, getJwtSecret());
    const certs = await Certificate.find({ userId: decoded.id })
      .select("companyName certificateNumber issuedAt validUntil status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify({ success: true, certificates: certs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("User certificates GET error:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

