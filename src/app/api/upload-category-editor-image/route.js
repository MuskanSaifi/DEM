// src/app/api/upload-category-editor-image/route.js
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file"); // Get the file from formData

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Convert file to Buffer for Cloudinary upload
    const buffer = await file.arrayBuffer();
    const base64Image = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "category-editor-inline", // Ensure this is the correct folder
    });

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}