import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import Blog from "@/models/Blogs";
import cloudinary from "@/lib/cloudinary";
import { validateContent, sanitizeContent } from "@/middleware/contentValidation";
import { Readable } from "stream"; // ✅ Import for Buffer conversion

// ✅ Convert File to Buffer
const fileToBuffer = async (file) => {
  const chunks = [];
  const stream = file.stream();
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

// ✅ Upload Image to Cloudinary
const uploadToCloudinary = async (image) => {
  try {
    const buffer = await fileToBuffer(image);
    const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "blogs",
            transformation: [{ width: 840, height: 420, crop: "limit" }],
    });
    return { imageUrl: result.secure_url, imagePublicId: result.public_id };
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

// ✅ Get all blogs
export async function GET() {
  try {
    await connectdb();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ Create Blog
export async function POST(req) {
  try {
    await connectdb();
    const formData = await req.formData();

    const title = formData.get("title")?.trim();
    const slug = formData.get("slug")?.trim();
    const author = formData.get("author")?.trim();
    let content = formData.get("content")?.trim();
    const metaTitle = formData.get("metaTitle")?.trim();
    const metaDescription = formData.get("metaDescription")?.trim();
    const metaKeywords = formData.get("metaKeywords")?.trim();

    // Parse inlineImagePublicIds
    let inlineImagePublicIds = [];
    const inlinePublicIdsString = formData.get("inlineImagePublicIds");
    if (inlinePublicIdsString) {
      try {
        inlineImagePublicIds = JSON.parse(inlinePublicIdsString);
      } catch (parseError) {
        console.error("Error parsing inlineImagePublicIds:", parseError);
      }
    }

    if (!title || !metaKeywords || !slug || !author || !content) {
      console.log("❌ Missing required fields!");
      return NextResponse.json({ error: "Required fields missing!" }, { status: 400 });
    }

    try {
      // Title / meta fields ko validate karte hain (SEO spam ke liye)
      validateContent(title, "title");
      if (metaTitle) validateContent(metaTitle, "metaTitle");
      if (metaDescription) validateContent(metaDescription, "metaDescription");
      if (metaKeywords) validateContent(metaKeywords, "metaKeywords");
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Blog ke main HTML content ko block na karke sirf sanitize karenge
    content = sanitizeContent(content);

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      console.log("❌ Slug already in use!");
      return NextResponse.json({ error: "Slug already in use!" }, { status: 400 });
    }

    let imageUrl = "";
    let imagePublicId = "";
    const image = formData.get("image"); // This is the main blog image

    if (image && image.size > 0) {
      console.log("📤 Uploading main blog image to Cloudinary...");
      const uploadResult = await uploadToCloudinary(image, "blog-main-images"); // Specify folder
      imageUrl = uploadResult.imageUrl;
      imagePublicId = uploadResult.imagePublicId;
      console.log("✅ Main Image Uploaded:", imageUrl);
    }

    const newBlog = new Blog({
      title,
      slug,
      author,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      image: imageUrl,
      imagePublicId: imagePublicId,
      inlineImagePublicIds: inlineImagePublicIds, // Save the extracted public_ids
    });

    await newBlog.save();

    return NextResponse.json({ success: true, message: "Blog created successfully!", blog: newBlog }, { status: 201 });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectdb();
    const formData = await req.formData();
    const blogId = formData.get("id");

    if (!blogId) {
      return NextResponse.json({ error: "Blog ID is required for update" }, { status: 400 });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const title = formData.get("title")?.trim();
    const slug = formData.get("slug")?.trim();
    const author = formData.get("author")?.trim();
    let content = formData.get("content")?.trim();
    const metaTitle = formData.get("metaTitle")?.trim();
    const metaDescription = formData.get("metaDescription")?.trim();
    const metaKeywords = formData.get("metaKeywords")?.trim();
    const image = formData.get("image");

    // ✅ Validate required fields
    if (!title || !slug || !author || !content) {
      return NextResponse.json({ error: "Title, slug, author, and content are required" }, { status: 400 });
    }

    // ✅ Check if slug is changed and if new slug already exists
    if (slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: blogId } });
      if (existingBlog) {
        return NextResponse.json({ error: "Slug already in use by another blog" }, { status: 400 });
      }
    }

    try {
      validateContent(title, "title");
      if (metaTitle) validateContent(metaTitle, "metaTitle");
      if (metaDescription) validateContent(metaDescription, "metaDescription");
      if (metaKeywords) validateContent(metaKeywords, "metaKeywords");
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Main HTML content ko sanitize karke save karte hain
    content = sanitizeContent(content);

    // ✅ Update fields (use provided values, not fallback to old values)
    blog.title = title;
    blog.slug = slug;
    blog.author = author;
    blog.content = content;
    blog.metaTitle = metaTitle || blog.metaTitle;
    blog.metaDescription = metaDescription || blog.metaDescription;
    blog.metaKeywords = metaKeywords || blog.metaKeywords;

    // ✅ Handle image upload
    if (image && typeof image === "object" && "size" in image && image.size > 0) {
      // 🗑️ Delete old image from Cloudinary
      if (blog.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(blog.imagePublicId);
          console.log("✅ Old image deleted");
        } catch (err) {
          console.error("❌ Error deleting old image from Cloudinary:", err);
        }
      }

      // 📤 Upload new image
      try {
        const uploadResult = await uploadToCloudinary(image);
        blog.image = uploadResult.imageUrl;
        blog.imagePublicId = uploadResult.imagePublicId;
        console.log("✅ New image uploaded:", uploadResult.imageUrl);
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    await blog.save();

    return NextResponse.json({ success: true, message: "Blog updated successfully", blog }, { status: 200 });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

// ✅ DELETE a blog
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get("id");

    if (!blogId) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
    }

    await connectdb();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ Delete main blog image from Cloudinary
    if (blog.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(blog.imagePublicId);
        console.log("✅ Main image deleted from Cloudinary");
      } catch (error) {
        console.error("❌ Cloudinary Main Image Delete Error:", error);
      {/* this part is for inline-images */}
      }
    }

    // ✅ Delete inline images from Cloudinary
    if (blog.inlineImagePublicIds?.length > 0) {
      for (const publicId of blog.inlineImagePublicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`✅ Deleted inline image: ${publicId}`);
        } catch (err) {
          console.error(`❌ Failed to delete inline image: ${publicId}`, err);
        }
      }
    }

    // ✅ Delete the blog from the database
    await Blog.findByIdAndDelete(blogId);

    return NextResponse.json({ message: "Blog deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}