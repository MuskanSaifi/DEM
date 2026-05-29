import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import connectdb from "@/lib/dbConnect";
import { getUserFromRequest } from "@/lib/userAuth";
import UserCertificateDocument from "@/models/UserCertificateDocument";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function safeFileName(name) {
  return (name || "document.pdf")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 120);
}

export async function GET(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const documents = await UserCertificateDocument.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, documents }, { status: 200 });
  } catch (error) {
    console.error("User certificate documents GET:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const title = (formData.get("title") || "").toString().trim();

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "PDF file is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Certificate title is required" },
        { status: 400 }
      );
    }

    const mime = file.type || "application/pdf";
    if (mime !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: "File must be 10 MB or smaller" },
        { status: 400 }
      );
    }

    const originalName = safeFileName(file.name);
    const storedName = `${Date.now()}-${originalName}`;
    const dir = path.join(process.cwd(), "public", "uploads", "user-certificates", String(user.id));
    await fs.mkdir(dir, { recursive: true });
    const fullPath = path.join(dir, storedName);
    await fs.writeFile(fullPath, buffer);

    const fileUrl = `/uploads/user-certificates/${user.id}/${storedName}`;

    const doc = await UserCertificateDocument.create({
      userId: user.id,
      title,
      fileName: originalName,
      fileUrl,
      fileSize: buffer.length,
      mimeType: mime,
    });

    return NextResponse.json(
      { success: true, document: doc },
      { status: 201 }
    );
  } catch (error) {
    console.error("User certificate documents POST:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
