import cloudinary from "@/lib/cloudinary";

/**
 * Upload user certificate PDF to Cloudinary (raw resource).
 */
export async function uploadUserCertificatePdf(buffer, userId, fileName) {
  const dataUri = `data:application/pdf;base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `user-certificates/${userId}`,
    resource_type: "raw",
    use_filename: true,
    unique_filename: true,
    filename_override: (fileName || "certificate.pdf").replace(/\.pdf$/i, ""),
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
  };
}

export async function deleteUserCertificatePdf(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    console.error("Cloudinary delete certificate PDF:", err?.message || err);
  }
}

export function isCloudinaryFileUrl(url) {
  return typeof url === "string" && /^https?:\/\/res\.cloudinary\.com\//i.test(url);
}

export function publicIdFromCloudinaryUrl(url) {
  if (!isCloudinaryFileUrl(url)) return null;
  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;
  const path = afterUpload.replace(/^v\d+\//, "");
  return path.replace(/\.pdf$/i, "");
}

/** Reliable delivery URL for raw PDF (works in browser inline). */
export function getCertificatePdfUrl(doc) {
  if (doc?.cloudinaryPublicId) {
    return cloudinary.url(doc.cloudinaryPublicId, {
      resource_type: "raw",
      secure: true,
    });
  }
  return doc?.fileUrl || "";
}
