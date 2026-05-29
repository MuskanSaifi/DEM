import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import connectdb from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/env";
import UserCertificateDocument from "@/models/UserCertificateDocument";
import {
  getCertificatePdfUrl,
  isCloudinaryFileUrl,
} from "@/lib/cloudinaryCertificates";

function getUserIdFromRequest(req) {
  const authorizationHeader = req.headers.get("Authorization");
  let token = null;

  if (authorizationHeader) {
    token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : authorizationHeader;
  } else {
    token = new URL(req.url).searchParams.get("token");
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded?.id ? String(decoded.id) : null;
  } catch {
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    await connectdb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const doc = await UserCertificateDocument.findById(id);
    if (!doc || String(doc.userId) !== userId) {
      return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 });
    }

    const fileName = doc.fileName || "certificate.pdf";

    if (isCloudinaryFileUrl(doc.fileUrl) || doc.cloudinaryPublicId) {
      const pdfUrl = getCertificatePdfUrl(doc);
      const pdfRes = await fetch(pdfUrl);
      if (!pdfRes.ok) {
        console.error("Cloudinary fetch failed:", pdfRes.status, pdfUrl);
        return NextResponse.json(
          { success: false, message: "Could not load PDF from storage." },
          { status: 502 }
        );
      }

      const buffer = Buffer.from(await pdfRes.arrayBuffer());
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": doc.mimeType || "application/pdf",
          "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    if (!doc.fileUrl?.startsWith("/uploads/")) {
      return NextResponse.json({ success: false, message: "Invalid file path" }, { status: 400 });
    }

    const diskPath = path.join(process.cwd(), "public", doc.fileUrl.replace(/^\//, ""));

    let buffer;
    try {
      buffer = await fs.readFile(diskPath);
    } catch {
      return NextResponse.json(
        { success: false, message: "PDF file is missing. Please upload again." },
        { status: 404 }
      );
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Certificate file GET:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
