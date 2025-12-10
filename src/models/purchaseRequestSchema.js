import mongoose from "mongoose";

const purchaseRequestSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    default: 1,
  },
  unit: {
    type: String,
  },
  approxOrderValue: {
    amount: { type: Number },
    currency: { type: String, enum: ['INR', 'USD', 'AED'], default: 'INR' },
  },
  requirementFrequency: {
    type: String,
    enum: ['one-time', 'recurring'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.models.PurchaseRequest || mongoose.model("PurchaseRequest", purchaseRequestSchema);



