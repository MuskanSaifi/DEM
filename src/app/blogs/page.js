import BlogPage from "./BlogPage";

export const metadata = {
  title: "Our Blogs",
  description: "Read insightful blogs and updates from our team.",
  keywords: ["blogs", "articles", "updates", "insights"],
  alternates: {
    canonical: "https://www.dialexportmart.com/blogs", 
  },
};

export default function Page() {
  return <BlogPage />;
}
