import { notFound } from "next/navigation";
import BlogDetail from "./BlogDetail";
import connectdb from "@/lib/dbConnect";
import Blog from "@/models/Blogs";


export async function generateMetadata({ params }) {
  // Ensure params is fully resolved first
  const { slug } = await params;  // Await params to access slug

  if (!slug) {
    return {
      title: "Blog Not Found",
      description: "The requested blog was not found.",
    };
  }

  await connectdb();
  const blog = await Blog.findOne({ slug }).lean();

  if (!blog) {
    return {
      title: "Blog Not Found",
      description: "The requested blog was not found.",
    };
  }

  const canonicalUrl = `https://www.dialexportmart.com/blogs/${slug}`;
  const imageUrl = blog.image ? `https://www.dialexportmart.com/${blog.image}` : null;

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || "Read detailed blog article on Dial Export Mart.",
    keywords: blog.metaKeywords?.split(',') || ["export", "business", "blog"],

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || "Read detailed blog article on Dial Export Mart.",
      url: canonicalUrl,
      siteName: "Dial Export Mart",
      type: "article",
      locale: "en_US",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : [],
    },

    robots: {
      index: true,
      follow: true,
    },

    authors: [
      {
        name: "Dial Export Mart",
        url: "https://www.dialexportmart.com",
      },
    ],

    publisher: "Dial Export Mart",

    metadataBase: new URL("https://www.dialexportmart.com"),
  };
}

export default async function BlogDetailPage({ params }) {
  // Ensure params is fully resolved first
  const { slug } = await params;  // Await params to access slug

  if (!slug) {
    return notFound(); // Return a 404 if slug is missing
  }

  await connectdb();
  const blog = await Blog.findOne({ slug }).lean();

  if (!blog) return notFound();

  // Convert to plain object
  const blogData = JSON.parse(JSON.stringify(blog));

  // Add a formatted date string (ISO-safe)
  blogData.formattedDate = new Date(blog.createdAt).toISOString().split("T")[0]; // e.g., "2025-04-30"

  return <BlogDetail blog={blogData} />;
}
