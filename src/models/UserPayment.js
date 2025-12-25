import mongoose from "mongoose";

const userPaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true }, // Unique PayU Order ID
    transactionId: { type: String, unique: true, sparse: true }, // Ensure uniqueness but allow null values
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Success", "Failed", "Refunded"], 
      default: "Pending" 
    },
    paymentMethod: { type: String }, // Example: "Credit Card", "UPI", "Net Banking"
    payerEmail: { type: String },
    payerMobile: { type: String },
    paymentResponse: { type: mongoose.Schema.Types.Mixed }, // Store full PayU response
    packageExpiry: { type: Date }, // ✅ Added Expiry Date Field
  },
  { timestamps: true }
);

export default mongoose.models.UserPayment || mongoose.model("UserPayment", userPaymentSchema);
