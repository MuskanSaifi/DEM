import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    businessProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
      default: null,
      index: true,
    },
    companyName: { type: String, required: true },
    certificateNumber: { type: String, required: true, unique: true, index: true },
    issuedAt: { type: Date, required: true, index: true },
    validUntil: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      index: true,
    },
    issuedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, default: "" },
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);

