import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import connectdb from "@/lib/dbConnect";
import { getUserFromRequest } from "@/lib/userAuth";
import UserCertificateDocument from "@/models/UserCertificateDocument";
import {
  deleteUserCertificatePdf,
  isCloudinaryFileUrl,
  publicIdFromCloudinaryUrl,
} from "@/lib/cloudinaryCertificates";

export async function DELETE(req, { params }) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const doc = await UserCertificateDocument.findOne({ _id: id, userId: user.id });
    if (!doc) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    if (doc.cloudinaryPublicId) {
      await deleteUserCertificatePdf(doc.cloudinaryPublicId);
    } else if (doc.fileUrl?.startsWith("/uploads/")) {
      const diskPath = path.join(process.cwd(), "public", doc.fileUrl.replace(/^\//, ""));
      try {
        await fs.unlink(diskPath);
      } catch {
        /* file may already be removed */
      }
    } else if (isCloudinaryFileUrl(doc.fileUrl)) {
      const pid = publicIdFromCloudinaryUrl(doc.fileUrl);
      if (pid) await deleteUserCertificatePdf(pid);
    }

    await UserCertificateDocument.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 });
  } catch (error) {
    console.error("User certificate document DELETE:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
