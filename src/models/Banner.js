import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String },
    imageUrl: { type: String, required: true },
    public_id: { type: String, required: true },
    platform: {
      type: String,
      enum: ["web", "app", "both"],
      default: "both",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
