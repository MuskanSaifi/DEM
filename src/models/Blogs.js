import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  author: String,
  content: String,
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  image: String,
  imagePublicId: String, // Store Cloudinary public_id
  inlineImagePublicIds: [String], // ✅ new field
}, { timestamps: true });


const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
export default Blog;
