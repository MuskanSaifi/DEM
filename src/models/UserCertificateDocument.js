import mongoose from "mongoose";

const userCertificateDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "application/pdf" },
  },
  { timestamps: true }
);

if (mongoose.models.UserCertificateDocument) {
  delete mongoose.models.UserCertificateDocument;
}

export default mongoose.model(
  "UserCertificateDocument",
  userCertificateDocumentSchema
);
