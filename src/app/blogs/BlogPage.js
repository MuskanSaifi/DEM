"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Pagination } from "react-bootstrap";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'; // Import Skeleton components
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton CSS

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 8;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  return (
    <>
      <div className="text-center">
        <Image
          src="/assets/pagesbanner/Blog.png"
          alt="Blog Banner"
          layout="responsive"
          width={1425}
          height={486}
          className="w-full h-auto object-cover rounded"
          priority
        />
      </div>

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8">
          Our <span className="text-primary">Blogs</span>
        </h1>

{loading && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: blogsPerPage }).map((_, index) => (
      <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
        <div className="h-44 overflow-hidden relative">
          <Skeleton height="100%" />
        </div>

        <div className="p-4 text-center flex flex-col flex-1">
          <h2 className="text-lg font-semibold mb-2">
            <Skeleton width="80%" height={20} />
          </h2>
          <p className="text-sm text-gray-600 flex-1">
            <Skeleton count={3} />
          </p>
          <div className="mt-4">
            <Skeleton width={100} height={36} className="rounded-full" />
          </div>
        </div>

        <div className="bg-gray-100 text-center text-sm text-gray-500 p-2">
          <Skeleton width={120} />
        </div>
      </div>
    ))}
  </div>
)}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!loading && !error && currentBlogs.length === 0 && (
          <p className="text-center">No blogs found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentBlogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
            >
              <div className="h-44 overflow-hidden relative">
                <Image
                  src={blog.image || "/placeholder.png"}
                  alt={blog.title}
                  layout="fill"
                  className="object-contain"
                />
              </div>

              <div className="p-4 text-center flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-2">{blog.title}</h2>
                <p className="text-sm text-gray-600 flex-1">
                  {blog.metaDescription
                    ? blog.metaDescription.length > 100
                      ? blog.metaDescription.slice(0, 100) + "..."
                      : blog.metaDescription
                    : "No description available."}
                </p>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Read More
                </Link>
              </div>

              <div className="bg-gray-100 text-center text-sm text-gray-500 p-2">
                Published on{" "}
                {blog.createdAt
                  ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown date"}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPage;
