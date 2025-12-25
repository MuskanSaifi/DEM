import mongoose from "mongoose";


const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String },
    iconPublicId: { type: String }, // ✅ Add this field to store Cloudinary public_id
    subcategoryslug: { type: String },
    metatitle: { type: String },
    metadescription: { type: String },
    metakeyword: { type: String }, // 👈 Add this
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

// ✅ CRITICAL: Indexes for performance optimization
// Note: name field doesn't have unique: true, so we add index
subcategorySchema.index({ name: 1 }); // Name queries
subcategorySchema.index({ subcategoryslug: 1 }); // Slug queries
subcategorySchema.index({ category: 1 }); // Category filter

// ✅ Ensure model is not re-registered
const SubCategory = mongoose.models.SubCategory || mongoose.model("SubCategory", subcategorySchema);
export default SubCategory;
