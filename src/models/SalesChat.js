import mongoose from "mongoose";

const salesChatSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "fromType",
    },
    fromType: {
      type: String,
      enum: ["SalesEmployee", "SalesAdmin"],
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "toType",
    },
    toType: {
      type: String,
      enum: ["SalesEmployee", "SalesAdmin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesLead",
      default: null, // null = general chat, otherwise chat about specific lead
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
salesChatSchema.index({ from: 1, to: 1, createdAt: -1 });
salesChatSchema.index({ leadId: 1 });
salesChatSchema.index({ isRead: 1 });

export default mongoose.models.SalesChat ||
  mongoose.model("SalesChat", salesChatSchema);
