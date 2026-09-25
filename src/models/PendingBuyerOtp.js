import mongoose from "mongoose";

const PendingBuyerOtpSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, default: "" },
    mobileNumber: { type: String, required: true, unique: true },
    countryCode: { type: String, required: true },
    productname: { type: String, default: "" },
    companyName: { type: String, default: "" },
    otp: { type: Number, required: true },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

PendingBuyerOtpSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

const PendingBuyerOtp =
  mongoose.models.PendingBuyerOtp ||
  mongoose.model("PendingBuyerOtp", PendingBuyerOtpSchema);

export default PendingBuyerOtp;
