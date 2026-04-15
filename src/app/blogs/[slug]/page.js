import { notFound } from "next/navigation";
import BlogDetail from "./BlogDetail";
import connectdb from "@/lib/dbConnect";
import Blog from "@/models/Blogs";
import { getSafeMetaContent } from "@/middleware/contentValidation";

// Cache blog HTML per slug to reduce TTFB/LCP (ISR-like on server)
export const revalidate = 3600;

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
  const imageUrl = (() => {
    if (!blog.image) return null;
    const raw = String(blog.image).trim();
    // Fix "double URL" / mixed formats (absolute vs relative)
    if (/^https?:\/\//i.test(raw)) return raw;
    const cleanPath = raw.startsWith("/") ? raw.slice(1) : raw;
    return `https://www.dialexportmart.com/${cleanPath}`;
  })();
  const safeTitle = getSafeMetaContent(blog.metaTitle) || blog.title;
  const safeDesc = getSafeMetaContent(blog.metaDescription) || "Read detailed blog article on Dial Export Mart.";
  const safeKeywords = getSafeMetaContent(blog.metaKeywords);

  return {
    title: safeTitle,
    description: safeDesc,
    keywords: safeKeywords ? safeKeywords.split(',') : ["export", "business", "blog"],

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: safeTitle,
      description: safeDesc,
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
