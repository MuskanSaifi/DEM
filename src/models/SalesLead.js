import mongoose from "mongoose";

const salesLeadSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    state: {
      type: String,
    },
    product: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "not_applicable"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesEmployee",
      default: null,
    },
    assignedAt: { type: Date, default: null },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesAdmin",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesEmployee",
      required: true,
    },
    remarks: [
      {
        remark: String,
        remarkType: {
          type: String,
          enum: ["general", "call", "email", "meeting", "followup", "other"],
          default: "general",
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "remarks.addedByType",
        },
        addedByType: {
          type: String,
          enum: ["SalesEmployee", "SalesAdmin"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for better query performance
salesLeadSchema.index({ assignedTo: 1, status: 1 });
salesLeadSchema.index({ assignedTo: 1, assignedAt: 1 });
salesLeadSchema.index({ createdBy: 1 });
salesLeadSchema.index({ status: 1 });
salesLeadSchema.index({ paymentStatus: 1 });

export default mongoose.models.SalesLead ||
  mongoose.model("SalesLead", salesLeadSchema);
