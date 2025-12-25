"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
import ImageExtension from '@tiptap/extension-image';

// Slug generator function
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function CreateCategoryForm() {
  const [name, setName] = useState("");
  const [categoryslug, setCategorySlug] = useState("");
  const [metatitle, setMetaTitle] = useState("");
  const [metadescription, setMetaDescription] = useState("");
  const [metakeywords, setMetaKeywords] = useState("");
  const [isTrending, setIsTrending] = useState(false);
  const [subcategories, setSubcategories] = useState([]); // Assuming this will be managed separately if needed
  const [file, setFile] = useState(null); // For category icon
  const [loading, setLoading] = useState(false);

  // Initialize Tiptap editor for category content
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true, // You might want to upload to Cloudinary instead of base64 for production
      }),
Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
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
    content: "", // Initial content for the editor
  });

  // State to hold the content from the editor
  const [content, setContent] = useState("");

  // Update content state when editor content changes
  useEffect(() => {
    if (editor) {
      editor.on("update", ({ editor }) => {
        setContent(editor.getHTML());
      });
    }
  }, [editor]);

  // ✅ MODIFIED: Returns both secure_url and public_id
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_category_upload"); // Make sure this preset is configured in Cloudinary
    formData.append("folder", "categories");

    const res = await fetch("https://api.cloudinary.com/v1_1/dchek3sr8/image/upload", {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      const errorText = await res.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const data = await res.json();
    if (!data.secure_url || !data.public_id) { // ✅ Check for public_id too
      throw new Error(data.error?.message || "Image upload failed: Missing URL or Public ID.");
    }

    return { secure_url: data.secure_url, public_id: data.public_id }; // ✅ Return both
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let iconUrl = "";
      let iconPublicId = ""; // ✅ Initialize iconPublicId

      if (file) {
        toast.loading("Uploading icon...");
        const uploadResult = await uploadImageToCloudinary(file); // ✅ Capture the object
        iconUrl = uploadResult.secure_url;
        iconPublicId = uploadResult.public_id; // ✅ Assign public_id
        toast.dismiss();
        toast.success("Icon uploaded!");
      }

      const response = await fetch("/api/adminprofile/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryslug,
          metatitle,
          metadescription,
          metakeywords,
          icon: iconUrl,
          iconPublicId: iconPublicId, // ✅ Send iconPublicId to the backend
          content,
          isTrending,
          subcategories,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create category");

      toast.success("Category created successfully!");
      // Reset form fields
      setName("");
      setCategorySlug("");
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
      setContent(""); // Clear editor content
      editor.commands.clearContent(); // Clear Tiptap editor
      setIsTrending(false);
      setFile(null);
    } catch (err) {
      console.error("❌ Error creating category:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateCategory} className="p-4 space-y-4">
      {/* Meta Fields */}
      <input
        type="text"
        placeholder="Meta Title"
        value={metatitle}
        onChange={(e) => setMetaTitle(e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        placeholder="Meta Description"
        value={metadescription}
        onChange={(e) => setMetaDescription(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="text"
        placeholder="Meta Keywords"
        value={metakeywords}
        onChange={(e) => setMetaKeywords(e.target.value)}
        className="border p-2 w-full"
      />

      {/* Category Name and Slug */}
      <input
        type="text"
        placeholder="Category Name"
        value={name}
        onChange={(e) => {
          const value = e.target.value;
          setName(value);
          setCategorySlug(generateSlug(value));
        }}
        required
        className="border p-2 w-full"
      />

      <input
        type="text"
        placeholder="Category Slug"
        value={categoryslug}
        onChange={(e) => setCategorySlug(generateSlug(e.target.value))}
        required
        className="border p-2 w-full"
      />

      {/* Tiptap Editor for Content */}
      <div className="form-group">
        <label htmlFor="content" className="form-label">Category Content</label>
        {editor && (
          <div className="toolbar mb-2 border rounded p-2 bg-light">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="btn btn-sm btn-outline-secondary me-1">Bold</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="btn btn-sm btn-outline-secondary me-1">Italic</button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn btn-sm btn-outline-secondary me-1">Underline</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="btn btn-sm btn-outline-secondary me-1">H1</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn btn-sm btn-outline-secondary me-1">H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="btn btn-sm btn-outline-secondary me-1">H3</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className="btn btn-sm btn-outline-secondary me-1">H4</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className="btn btn-sm btn-outline-secondary me-1">H5</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className="btn btn-sm btn-outline-secondary me-1">H6</button>

            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn btn-sm btn-outline-secondary me-1">Bullet List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="btn btn-sm btn-outline-secondary me-1">Ordered List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="btn btn-sm btn-outline-secondary me-1">Blockquote</button>
            <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="btn btn-sm btn-outline-secondary me-1">Code</button>
            <button
              type="button"
              onClick={() => {
                const url = prompt("Enter link URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className="btn btn-sm btn-outline-secondary me-1"
            >
              Link
            </button>
            {/* Inline Image Upload Button for Categories */}
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

                  // This API endpoint will handle Cloudinary upload for inline images
                  const res = await fetch("/api/upload-category-editor-image", { // ✅ NEW API endpoint (not provided, but mentioned in your code)
                    method: "POST",
                    body: formData,
                  });

                  const data = await res.json();
                  if (data.url) {
                    editor.chain().focus().setImage({ src: data.url }).run();
                  } else {
                    console.error("❌ Failed to get URL from inline image upload.");
                  }
                };
                input.click();
              }}
              className="btn btn-sm btn-outline-secondary me-1"
            >
              Upload Inline Image
            </button>
          </div>
        )}
        <div className="editor-wrapper border p-2 rounded bg-white">
          {editor ? <EditorContent editor={editor} className="min-h-[200px]" /> : <p>Loading Editor...</p>}
        </div>
      </div>

      {/* Category Icon Upload */}
      <label className="block text-sm font-medium text-gray-700 mt-4">Category Icon</label>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept="image/*"
        className="border p-2 w-full"
      />
      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="Category Icon Preview"
          className="mt-2 h-20 w-20 object-cover rounded-md"
        />
      )}

      {/* Is Trending Checkbox */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isTrending}
          onChange={(e) => setIsTrending(e.target.checked)}
          className="form-checkbox"
        />
        <span>Is Trending</span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
      >
        {loading ? "Creating..." : "Create Category"}
      </button>
    </form>
  );
}