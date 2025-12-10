"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/store/categorySlice";

// Tiptap Editor
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
import ImageExtension from "@tiptap/extension-image";

// Helper to generate slug
const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const UpdateCategory = () => {
  const dispatch = useDispatch();

  // ⭐ Get categories from Redux
  const { data: categories, loading: catLoading } = useSelector(
    (state) => state.categories
  );

  const [allSubCategories, setAllSubCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categoryData, setCategoryData] = useState({
    id: "",
    name: "",
    icon: "",
    categoryslug: "",
    metatitle: "",
    metadescription: "",
    metakeywords: "",
    content: "",
    isTrending: false,
    subcategories: [],
  });

  // Fetch categories once from Redux
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch all subcategories (manual)
  useEffect(() => {
    fetchAllSubCategories();
  }, []);

  // Load Subcategories manually
  const fetchAllSubCategories = async () => {
    try {
      const result = await axios.get(`/api/adminprofile/subcategory`);
      setAllSubCategories(result.data);
    } catch (error) {
      toast.error("Failed to fetch subcategories.");
    }
  };

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: true }),
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
    content: categoryData.content,
    onUpdate: ({ editor }) => {
      setCategoryData((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // Update editor when category changes
  useEffect(() => {
    if (editor && editor.getHTML() !== categoryData.content) {
      editor.commands.setContent(categoryData.content || "", false);
    }
  }, [categoryData.content, editor]);

  // Auto-update slug
  useEffect(() => {
    if (!slugEdited && categoryData.id) {
      setCategoryData((prev) => ({
        ...prev,
        categoryslug: generateSlug(prev.name),
      }));
    }
  }, [categoryData.name, slugEdited]);

  // When user selects a Category
  const handleCategorySelectChange = (e) => {
    const selectedCat = categories.find((c) => c._id === e.target.value);

    if (selectedCat) {
      setCategoryData({
        id: selectedCat._id,
        name: selectedCat.name,
        icon: selectedCat.icon || "",
        categoryslug: selectedCat.categoryslug || "",
        metatitle: selectedCat.metatitle || "",
        metadescription: selectedCat.metadescription || "",
        metakeywords: selectedCat.metakeywords || "",
        content: selectedCat.content || "",
        isTrending: selectedCat.isTrending || false,
        subcategories: selectedCat.subcategories.map((s) => s._id),
      });
      setPreviewImage(selectedCat.icon || "");
      setSlugEdited(false);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setCategoryData({
      id: "",
      name: "",
      icon: "",
      categoryslug: "",
      metatitle: "",
      metadescription: "",
      metakeywords: "",
      content: "",
      isTrending: false,
      subcategories: [],
    });
    setPreviewImage("");
    editor?.commands.clearContent();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCategoryData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "categoryslug") setSlugEdited(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCategoryData((prev) => ({ ...prev, icon: reader.result }));
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(`/api/adminprofile/category`, categoryData);
      toast.success("Category updated successfully!");

      dispatch(fetchCategories()); // refresh redux
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <h3>Update Category</h3>

      {/* Category Selection */}
      <select
        className="form-control mb-3"
        value={categoryData.id}
        onChange={handleCategorySelectChange}
      >
        <option value="">-- Select Category --</option>

        {catLoading && <option>Loading...</option>}

        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Only show form when category is selected */}
      {categoryData.id && (
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <input
            type="text"
            name="name"
            className="form-control mb-3"
            value={categoryData.name}
            onChange={handleInputChange}
          />

          {/* Slug */}
          <input
            type="text"
            name="categoryslug"
            className="form-control mb-3"
            value={categoryData.categoryslug}
            onChange={handleInputChange}
          />

          {/* Meta Fields */}
          <input
            type="text"
            name="metatitle"
            placeholder="Meta Title"
            className="form-control mb-3"
            value={categoryData.metatitle}
            onChange={handleInputChange}
          />

          <textarea
            name="metadescription"
            placeholder="Meta Description"
            className="form-control mb-3"
            value={categoryData.metadescription}
            onChange={handleInputChange}
          ></textarea>

          <input
            type="text"
            name="metakeywords"
            placeholder="Meta Keywords"
            className="form-control mb-3"
            value={categoryData.metakeywords}
            onChange={handleInputChange}
          />

          {/* Editor */}
          <div className="border rounded p-2 bg-white mb-3">
            <EditorContent editor={editor} className="min-h-[200px]" />
          </div>

          {/* Icon Upload */}
          <input type="file" className="form-control mb-3" onChange={handleImageChange} />

          {previewImage && (
            <Image
              src={previewImage}
              width={120}
              height={120}
              alt="Preview"
              className="rounded"
            />
          )}

          {/* Trending Checkbox */}
          <label className="mt-3 d-flex gap-2 align-items-center">
            <input
              type="checkbox"
              name="isTrending"
              checked={categoryData.isTrending}
              onChange={handleInputChange}
            />
            Trending Category
          </label>

          {/* Subcategory Multi-select */}
          <select
            multiple
            className="form-control mb-3"
            value={categoryData.subcategories}
            onChange={(e) =>
              setCategoryData({
                ...categoryData,
                subcategories: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
          >
            {allSubCategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Submit */}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Category"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdateCategory;
