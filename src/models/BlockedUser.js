import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema(
  {
    blockedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // optional
    blockedByBuyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" }, // optional
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.BlockedUser ||
  mongoose.model("BlockedUser", blockedUserSchema);
