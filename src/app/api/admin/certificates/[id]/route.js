import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import { verifyToken } from "@/lib/auth";
import Admin from "@/models/Admin";
import Certificate from "@/models/Certificate";

function getAdminIdFromCookie(req) {
  const token = req.cookies.get("adminToken")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.id || null;
}

export async function PATCH(req, { params }) {
  try {
    await connectdb();
    const adminId = getAdminIdFromCookie(req);
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const admin = await Admin.findById(adminId).lean();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const cert = await Certificate.findById(id);
    if (!cert) {
      return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 });
    }

    if (body.status) {
      if (!["active", "revoked", "expired"].includes(body.status)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
      }
      cert.status = body.status;
      if (body.status === "revoked") {
        cert.revokedAt = new Date();
        cert.revokedReason = String(body.revokedReason || "").trim();
      }
    }

    if (body.issuedAt) {
      const d = new Date(body.issuedAt);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ success: false, message: "Invalid issuedAt" }, { status: 400 });
      }
      cert.issuedAt = d;
    }

    if (body.validUntil) {
      const d = new Date(body.validUntil);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ success: false, message: "Invalid validUntil" }, { status: 400 });
      }
      cert.validUntil = d;
    }

    if (body.companyName !== undefined) {
      cert.companyName = String(body.companyName || "").trim();
    }

    await cert.save();
    return NextResponse.json({ success: true, certificate: cert }, { status: 200 });
  } catch (error) {
    console.error("Admin certificates PATCH error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

