"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import Link from "next/link";
import beautify from 'js-beautify'; // Install using `npm install js-beautify`

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
        setFilteredBlogs(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Filter function
  const filterBlogs = (term, date) => {
    let filtered = blogs;
    if (term) {
      filtered = filtered.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(term.toLowerCase()) ||
          blog.author?.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (date) {
      filtered = filtered.filter((blog) => blog.createdAt?.startsWith(date));
    }
    setFilteredBlogs(filtered);
  };

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterBlogs(e.target.value, searchDate);
  };

  const handleDateFilter = (e) => {
    setSearchDate(e.target.value);
    filterBlogs(searchTerm, e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchDate("");
    setFilteredBlogs(blogs);
  };

  const deleteBlog = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this blog!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/blogs?id=${id}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error);
          } else {
            const updated = blogs.filter((blog) => blog._id !== id);
            setBlogs(updated);
            setFilteredBlogs(updated);
            Swal.fire("Deleted!", "Your blog has been deleted.", "success");
          }
        } catch (error) {
          setError("Failed to delete the blog");
          Swal.fire("Error!", "Failed to delete the blog.", "error");
        }
      }
    });
  };

const editBlog = (id) => {
  const blogToEdit = blogs.find((blog) => blog._id === id);
  if (blogToEdit) {
    let formatted = beautify.html(blogToEdit.content, { indent_size: 2 });

    // Add an extra newline between blocks
    formatted = formatted.replace(/>\s*</g, ">\n\n<");

    setSelectedBlog({ ...blogToEdit, content: formatted });
    setShowModal(true);
  }
};


const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("id", selectedBlog._id);
    formData.append("title", selectedBlog.title);
    formData.append("author", selectedBlog.author);
    formData.append("content", selectedBlog.content);
    formData.append("metaTitle", selectedBlog.metaTitle || "");
    formData.append("metaDescription", selectedBlog.metaDescription || "");
    formData.append("metaKeywords", selectedBlog.metaKeywords || "");
    
    // image file (only if user selected new one)
    if (selectedBlog.newImage) {
      formData.append("image", selectedBlog.newImage);
    }

    const res = await fetch("/api/blogs", {
      method: "PATCH",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to update blog");

    const updated = await res.json();

    const updatedBlogs = blogs.map((b) =>
      b._id === selectedBlog._id ? updated.blog : b
    );

    setBlogs(updatedBlogs);
    setFilteredBlogs(updatedBlogs);
    setShowModal(false);

    Swal.fire("✅ Updated!", "Blog updated successfully", "success");
  } catch (error) {
    console.error("Update Error:", error);
    Swal.fire("❌ Error", "Could not update the blog", "error");
  }
};


  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h1 className="fs-2">📝 All Blogs</h1>

<div className="mb-3 mt-4">
  <div className="d-flex flex-wrap gap-3">
    <input
      type="text"
  className="form-control max-w-[250px]"
      placeholder="Search by title or author"
      value={searchTerm}
      onChange={handleSearch}
    />
    <input
      type="date"
  className="form-control max-w-[200px]"
      value={searchDate}
      onChange={handleDateFilter}
    />
    <button className="btn btn-secondary">
      Reset
    </button>
  </div>
</div>


{loading && (
  <table className="table table-bordered table-hover mt-2">
    <thead className="table-dark">
      <tr>
        <th>#</th>
        <th>Image</th>
        <th>Title</th>
        <th>Author</th>
        <th>Created At</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx}>
          <td><Skeleton width={20} /></td>
          <td><Skeleton width={80} height={60} /></td>
          <td><Skeleton width={150} /></td>
          <td><Skeleton width={100} /></td>
          <td><Skeleton width={90} /></td>
          <td className="d-flex gap-2">
            <Skeleton width={60} height={30} />
            <Skeleton width={60} height={30} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}
        {error && <p className="text-danger">Error: {error}</p>}
        {!loading && !error && filteredBlogs.length === 0 && <p>No blogs found.</p>}

        {!loading && filteredBlogs.length > 0 && (
          <table className="table table-bordered table-hover mt-2">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Title</th>
                <th>Author</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog, index) => (
                <tr key={blog._id}>
                  <td>{index + 1}</td>
                  <td>
                 <Image
  src={blog.image?.startsWith("http") ? blog.image : "/placeholder.png"}
  alt={blog.title}
  width={80}
  height={80}
  className="rounded img-fluid object-cover"
/>
                  </td>
<td>
<Link href={`/blogs/${blog.slug}`} target="_blank">
  {blog.title}
</Link>
</td>
                  <td>{blog.author}</td>
                  <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="d-flex gap-2">
                    <button onClick={() => deleteBlog(blog._id)} className="btn btn-danger btn-sm">
                      🗑️ Delete
                    </button>
                    <button onClick={() => editBlog(blog._id)} className="btn btn-success btn-sm">
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

{/* Edit Modal */}
{showModal && selectedBlog && (
  <div
  className="modal fade show d-block bg-black bg-opacity-50 flex justify-center items-center z-[1050] "
    tabIndex="-1"
    role="dialog"
  >
<div className="m-5 max-w-full" role="document">
<div
  className="modal-content p-3 w-full rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.2)]"
>

        <div className="modal-header border-bottom-0">
          <h5 className="modal-title">✏️ Edit Blog</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={selectedBlog.title}
              onChange={(e) =>
                setSelectedBlog({ ...selectedBlog, title: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Author</label>
            <input
              type="text"
              className="form-control"
              value={selectedBlog.author}
              onChange={(e) =>
                setSelectedBlog({ ...selectedBlog, author: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Content</label>
            <textarea
              rows="5"
              className="form-control"
              value={selectedBlog.content}
              onChange={(e) =>
                setSelectedBlog({ ...selectedBlog, content: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Meta Title</label>
            <input
              type="text"
              className="form-control"
              value={selectedBlog.metaTitle || ""}
              onChange={(e) =>
                setSelectedBlog({ ...selectedBlog, metaTitle: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Meta Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={selectedBlog.metaDescription || ""}
              onChange={(e) =>
                setSelectedBlog({ ...selectedBlog, metaDescription: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Meta Keywords</label>
            <input
              type="text"
              className="form-control"
              value={selectedBlog.metaKeywords || ""}
              onChange={(e) =>
                setSelectedBlog({ ...selectedBlog, metaKeywords: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Image</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedBlog({ ...selectedBlog, newImage: e.target.files[0] })
              }
            />
          </div>
        </div>
        <div className="modal-footer border-top-0">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default AllBlogs;
