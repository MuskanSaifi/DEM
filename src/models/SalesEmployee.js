import mongoose from "mongoose";

const salesEmployeeSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesAdmin",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inactiveReason: {
      type: String,
      enum: ["manual", "low_paid_activity"],
      default: null,
    },
    inactiveAt: {
      type: Date,
      default: null,
    },
    reactivatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SalesEmployee ||
  mongoose.model("SalesEmployee", salesEmployeeSchema);
