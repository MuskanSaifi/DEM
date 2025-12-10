// src/app/dashboard/CreateBlog.js
"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit"; // CORRECTED IMPORT: Changed from "@tiptap/extension-starter-kit"
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
// import ImageExtension from "@tiptap/extension-image"; // No longer needed, using CustomImage
import CustomImage from "@/extensions/CustomImage"; // Adjust this path to your CustomImage.js

const initialState = {
  title: "",
  slug: "",
  author: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

const CreateBlog = () => {
  const [formData, setFormData] = useState(initialState);
  const [file, setFile] = useState(null); // For main blog image
  const [preview, setPreview] = useState(null); // For main blog image preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage, // 👈 Use your custom image extension here!
      Heading.configure({ levels: [1, 2, 3, 4, 5] }),
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      CodeBlock,
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // Slug auto-generate
  useEffect(() => {
    setFormData((prev) => {
      if (prev.slugEdited) return prev;
      return {
        ...prev,
        slug: prev.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      };
    });
  }, [formData.title]);

  const handleSlugChange = (e) => {
    setFormData({ ...formData, slug: e.target.value, slugEdited: true });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleImageUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "slugEdited") {
          formDataObj.append(key, value);
        }
      });

      if (file) {
        formDataObj.append("image", file);
      }

      // --- NEW LOGIC: Extract inline image public_ids ---
      const parser = new DOMParser();
      const doc = parser.parseFromString(formData.content, "text/html");
      const inlineImagePublicIds = Array.from(doc.querySelectorAll("img[data-public-id]")) // Select only images with data-public-id
        .map((img) => img.getAttribute("data-public-id"))
        .filter(Boolean); // Filter out null or empty values

      formDataObj.append("inlineImagePublicIds", JSON.stringify(inlineImagePublicIds));
      // --- END NEW LOGIC ---

      const response = await axios.post("/api/blogs", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Blog Created!",
          text: "Your blog has been successfully created.",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Go to Dashboard",
        }).then(() => {
          router.push("/dashboard");
        });
      }
    } catch (error) {
      console.error("❌ Submission Error:", error);
      const message =
        error.response?.data?.error || "Failed to create blog. Please try again!";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: message,
        confirmButtonColor: "#d33",
      });
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 rounded-3 shadow-sm">
        <h1 className="fs-3 mb-4">📝 Create Blog</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleChange}
            placeholder="Meta Title"
            className="form-control mb-2"
          />
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleChange}
            placeholder="Meta Description"
            className="form-control mb-2"
          />
          <input
            type="text"
            name="metaKeywords"
            value={formData.metaKeywords}
            onChange={handleChange}
            placeholder="Meta Keywords"
            className="form-control mb-2"
          />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Blog Title"
            required
            className="form-control mb-2"
          />
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="Slug (Blog URL)"
            className="form-control mb-2"
          />
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Author"
            required
            className="form-control mb-2"
          />

          {editor && (
            <div className="toolbar mb-2">
              <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
              <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
              <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
              <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
              <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
              <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
              <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4</button>
              <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>H5</button>
              <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet List</button>
              <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
              <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>Blockquote</button>
              <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code</button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter link URL");
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
              >
                Link
              </button>
              {editor && (
                <div className="toolbar mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async () => {
                        const file = input.files[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append("file", file);

                        const res = await fetch("/api/upload-editor-image", {
                          method: "POST",
                          body: formData,
                        });

                        const data = await res.json();
                        if (data.url && data.public_id) {
                          // Pass publicId to the CustomImage extension
                          editor.chain().focus().setImage({ src: data.url, publicId: data.public_id }).run();
                        } else {
                            console.error("❌ Failed to get URL or public_id from inline image upload.");
                        }
                      };
                      input.click();
                    }}
                  >
                    Upload Inline Image
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="editor-wrapper border p-1 mb-2 rounded bg-white">
            {editor ? <EditorContent editor={editor} /> : <p>Loading Editor...</p>}
          </div>

          <input type="file" accept="image/*" onChange={handleImageUpload} className="form-control mb-2" />

          {preview && (
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={200}
              className="img-fluid rounded mb-2"
              unoptimized
              loader={() => preview}
            />
          )}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
