// src/app/api/admin/templates/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, context) {
  await dbConnect();

  // ✅ FIX: params ko await karo
  const { id } = await context.params;

  const template = await Template.findById(id);
  if (!template) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  // delete thumbnail
  if (template.thumbnail?.publicId) {
    await cloudinary.uploader.destroy(template.thumbnail.publicId);
  }

  // delete preview images
  for (const img of template.previewImages) {
    await cloudinary.uploader.destroy(img.publicId);
  }

  await template.deleteOne();

  return Response.json({ success: true });
}
