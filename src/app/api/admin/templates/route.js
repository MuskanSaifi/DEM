// src/app/api/admin/templates/route.js
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import cloudinary from "@/lib/cloudinary";

// ✅ File → base64 converter
const fileToBase64 = async (file) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
};

export async function POST(req) {
  await dbConnect();
  const formData = await req.formData();

  const thumbnail = formData.get("thumbnail");
  const previewImages = formData.getAll("previewImages");

  // ✅ thumbnail upload
  const thumbBase64 = await fileToBase64(thumbnail);
  const thumbUpload = await cloudinary.uploader.upload(thumbBase64, {
    folder: "templates",
  });

  // ✅ preview images upload
  const previews = [];
  for (const img of previewImages) {
    const imgBase64 = await fileToBase64(img);
    const upload = await cloudinary.uploader.upload(imgBase64, {
      folder: "templates",
    });

    previews.push({
      url: upload.secure_url,
      publicId: upload.public_id,
    });
  }

  const template = await Template.create({
    templateId: formData.get("templateId"),
    title: formData.get("title"),
    industry: formData.get("industry"),
    style: formData.get("style"),
    type: formData.get("type"),
    thumbnail: {
      url: thumbUpload.secure_url,
      publicId: thumbUpload.public_id,
    },
    previewImages: previews,
    colors: JSON.parse(formData.get("colors")),
  });

  return Response.json({ success: true, template });
}

export async function GET() {
  await dbConnect();
  const templates = await Template.find().sort({ createdAt: -1 });
  return Response.json({ templates });
}