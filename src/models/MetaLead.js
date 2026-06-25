import mongoose from "mongoose";

const metaLeadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile Number is required"],
      trim: true,
      set: (value) => value.replace(/\s+/g, ""),
    },
    businessType: {
      type: String,
      required: [true, "Business Type is required"],
      enum: ["manufacturer", "supplier", "wholeseller"],
    },
    companyName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    source: {
      type: String,
      default: "meta-ads",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "lost"],
      default: "new",
    },
    remarks: [
      {
        text: { type: String, required: true },
        addedBy: { type: String, default: "Admin" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

metaLeadSchema.index({ mobileNumber: 1 });
metaLeadSchema.index({ businessType: 1 });

const MetaLead = mongoose.models.MetaLead || mongoose.model("MetaLead", metaLeadSchema);
export default MetaLead;
