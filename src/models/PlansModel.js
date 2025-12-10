// models/PlansModel.js
import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
  text: String,
  included: { type: Boolean, default: true },
});

const planSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topService: [featureSchema],
  website: [featureSchema],
  seo: [featureSchema],
  smo: [featureSchema],
  price: { type: String, required: true },
  highlighted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
