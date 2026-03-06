// src/models/SalesLead.js
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
      set: (v) => v.replace(/\s+/g, "")
    },
    email: {
      type: String,
    },
    state: {
      type: String,
    },
    gst: {
      type: String,
      default: "",
    },
    product: {
      type: String,
      required: true, 
    },
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "converted",
        "lost",
        "followup",
        "proposal",
        "not_interested",
        "ringing",
        "hotfollowup",
      ],
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
        editedAt: {
          type: Date,
          default: null,
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
salesLeadSchema.index({
  gst: 1,
  mobile: 1,
  companyName: 1,
  email: 1,
});

// Avoid using cached model with stale schema (e.g. after adding new enum values)
if (mongoose.models.SalesLead) delete mongoose.models.SalesLead;
export default mongoose.model("SalesLead", salesLeadSchema);
