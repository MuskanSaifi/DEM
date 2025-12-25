import connectdb from "@/lib/dbConnect";
import Blog from "@/models/Blogs";

// DO NOT AWAIT the second argument. Destructure directly.
export async function GET(req, { params }) {
  try {
    await connectdb();

    const slug = params.slug;

    if (!slug) {
      return new Response(JSON.stringify({ message: "Slug is required" }), {
        status: 400,
      });
    }

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return new Response(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(blog), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Internal server error", error: error.message }),
      { status: 500 }
    );
  }
}
