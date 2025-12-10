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

// ✅ Ensure model is not re-registered
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
