// models/Report.js

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
 {
 // 🎯 FIX 1: reportedByRole and reportedBy field
 reportedByModel: { type: String, enum: ["User", "Buyer"], required: true }, // 'User' ya 'Buyer' store karega
 reportedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'reportedByModel', // Dynamic reference ke liye
        required: true 
    }, 
 // sellerId abhi bhi 'User' ko refer karega
 sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
reason: { type: String, required: true },
 status: { type: String, enum: ["pending", "reviewed"], default: "pending" }
 },
 { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", reportSchema);