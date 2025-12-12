//api/adminprofile/banner
import { NextResponse } from "next/server";
import Banner from "@/models/Banner";
import connectdb from "@/lib/dbConnect";
import cloudinary from "@/lib/cloudinary";

// ================== GET ALL BANNERS ==================
export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform"); // web | app | both

    const filter = {};
    if (platform) {
      filter.$or = [{ platform }, { platform: "both" }];
    }

    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500 });
  }
}

// ================== CREATE BANNER ==================
export async function POST(req) {
  try {
    await connectdb();
    const formData = await req.formData();
    const file = formData.get("image");
    const link = formData.get("link");
    const title = formData.get("title");
    const platform = formData.get("platform") || "both";

    if (!file) {
      return NextResponse.json({ success: false, error: "No image uploaded" }, { status: 400 });
    }

    // Convert image to buffer for Cloudinary stream
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🔹 Upload to Cloudinary inside "banner" folder
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "banner" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    const banner = await Banner.create({
      title,
      link,
      imageUrl: uploadRes.secure_url,
      public_id: uploadRes.public_id,
      platform,
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload banner" }, { status: 500 });
  }
}

// ================== UPDATE BANNER ==================
export async function PATCH(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { id, title, link, platform, isActive } = body;

    const updated = await Banner.findByIdAndUpdate(
      id,
      { title, link, platform, isActive },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });

    return NextResponse.json({ success: true, banner: updated });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

// ================== DELETE BANNER ==================
export async function DELETE(req) {
  try {
    await connectdb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ success: false, error: "Banner ID required" }, { status: 400 });

    const banner = await Banner.findById(id);
    if (!banner)
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });

    // 🔹 Delete image from Cloudinary
    await cloudinary.uploader.destroy(banner.public_id);

    // Remove from DB
    await Banner.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
