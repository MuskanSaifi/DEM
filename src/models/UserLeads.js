import mongoose from "mongoose";

const userleadsSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer', // Reference to Buyer model
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to Product model
    },
    requirementFrequency: {
      type: String,
      enum: ['one-time', 'recurring'], // Either 'one-time' or 'recurring'
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    approxOrderValue: {
      amount: { type: Number, required: true },
      currency: { type: String, enum: ['INR', 'USD', 'AED'], default: 'INR' },
    },
  },
  { timestamps: true }
);

// Fix model creation
const Userleads = mongoose.models.Userleads || mongoose.model("Userleads", userleadsSchema);

export default Userleads;
