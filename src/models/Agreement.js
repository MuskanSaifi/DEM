import mongoose from "mongoose";

const AgreementSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "created", "signed", "downloaded"],
      default: "pending",
    },
    clientName: {
      type: String,
      required: true,
    },
    serviceProviderAddress: String,
    companyAddress: String,
    email: String,
    phone: String,
    date: String,
    month: String,
    year: String,
    serviceDetails: String,
    startDate: String,
    endDate: String,
    paymentDate: String,
    // New fields for signature
    signatureImage: String, // To store the Cloudinary URL
    signedAt: Date, // To record the timestamp of the signature
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Agreement || mongoose.model("Agreement", AgreementSchema);