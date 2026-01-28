// models/UserNotification.js
import mongoose from "mongoose";

const UserNotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["warning", "info", "success", "error"], 
    default: "warning" 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product" 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
UserNotificationSchema.index({ userId: 1, isRead: 1 });
UserNotificationSchema.index({ createdAt: -1 });

export default mongoose.models.UserNotification || mongoose.model("UserNotification", UserNotificationSchema);
