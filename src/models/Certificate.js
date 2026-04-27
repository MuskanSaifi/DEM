import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

certificateSchema.index(
  { userId: 1, status: 1 },
  { partialFilterExpression: { userId: { $type: "objectId" } } }
);

// In Next.js dev (HMR), Mongoose may keep an old compiled model in memory.
// If schema changes, force recompile so validations match the current code.
if (mongoose.models.Certificate) {
  delete mongoose.models.Certificate;
}

export default mongoose.model("Certificate", certificateSchema);

