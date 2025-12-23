import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    icon: { type: String },
    iconPublicId: { type: String }, // ✅ Add this field to store Cloudinary public_id
    content: String,
    categoryslug: { type: String },
    metatitle: { type: String },
    metadescription: { type: String },
    metakeywords: { type: String },
    isTrending: { type: Boolean, default: false },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
  },
  { timestamps: true }
);

// ✅ CRITICAL: Indexes for performance optimization
// Note: name index already exists via unique: true, so we don't duplicate it
categorySchema.index({ categoryslug: 1 }); // Slug queries
categorySchema.index({ isTrending: 1 }); // Trending filter

// ✅ Ensure model is not re-registered
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
