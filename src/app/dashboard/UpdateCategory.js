"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

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

const generateSlug = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

export default function UpdateCategory() {
  // ⬇ NO REDUX ANYMORE
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);

  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const [previewImage, setPreviewImage] = useState("");

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

  // =========================================
  // FETCH CATEGORIES (NO REDUX)
  // =========================================
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(
          "/api/admin/update-category/category-light",
          { cache: "no-store" }
        );
        const data = await res.json();
        setCategories(data);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategory(false);
      }
    }
    loadCategories();
  }, []);

  // =========================================
  // FETCH ALL SUBCATEGORIES
  // =========================================
  useEffect(() => {
    async function loadSubs() {
      try {
        const res = await axios.get(`/api/admin/update-category/subcategory-light`);
        setAllSubCategories(res.data);
      } catch {
        toast.error("Failed to load subcategories");
      }
    }
    loadSubs();
  }, []);

  // =========================================
  // TIPTAP INITIALIZATION
  // =========================================
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: true }),
      Heading,
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
      setCategoryData((prev) => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
  });

  // =========================================
  // AUTO SLUG UPDATE
  // =========================================
  useEffect(() => {
    if (!slugEdited && categoryData.name) {
      setCategoryData((prev) => ({
        ...prev,
        categoryslug: generateSlug(prev.name),
      }));
    }
  }, [categoryData.name]);

  // =========================================
  // CATEGORY SELECT CHANGE
  // =========================================
  const handleCategorySelectChange = async (e) => {
    const id = e.target.value;
    if (!id) return resetForm();

    try {
      const res = await axios.get(`/api/adminprofile/category/${id}`);
      const cat = res.data;

      setCategoryData({
        id: cat._id,
        name: cat.name,
        icon: cat.icon || "",
        categoryslug: cat.categoryslug || "",
        metatitle: cat.metatitle || "",
        metadescription: cat.metadescription || "",
        metakeywords: cat.metakeywords || "",
        content: cat.content || "",
        isTrending: cat.isTrending || false,
        subcategories: cat.subcategories?.map((s) => s._id) || [],
      });

      setPreviewImage(cat.icon);
      setSlugEdited(false);
      editor?.commands.setContent(cat.content || "");
    } catch {
      toast.error("Failed to load category details");
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

  // =========================================
  // INPUT CHANGE
  // =========================================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCategoryData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "categoryslug") setSlugEdited(true);
  };

  // =========================================
  // IMAGE UPDATE
  // =========================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setCategoryData((prev) => ({ ...prev, icon: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // =========================================
  // SUBMIT UPDATE
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(`/api/adminprofile/category`, categoryData);
      toast.success("Category updated successfully!");
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed.");
    }

    setLoading(false);
  };

  // =========================================
  // RENDER UI
  // =========================================
  return (
    <div className="p-4">
      <h3>Update Category</h3>

      {/* CATEGORY DROPDOWN */}
      <select
        className="form-control mb-3"
        onChange={handleCategorySelectChange}
      >
        <option value="">-- Select Category --</option>

        {loadingCategory && <option>Loading...</option>}

        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* SHOW FORM ONLY IF CATEGORY SELECTED */}
      {categoryData.id && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            className="form-control mb-3"
            value={categoryData.name}
            onChange={handleInputChange}
          />

          <input
            type="text"
            name="categoryslug"
            className="form-control mb-3"
            value={categoryData.categoryslug}
            onChange={handleInputChange}
          />

          <input
            type="text"
            name="metatitle"
            className="form-control mb-3"
            value={categoryData.metatitle}
            onChange={handleInputChange}
            placeholder="Meta Title"
          />

          <textarea
            name="metadescription"
            className="form-control mb-3"
            value={categoryData.metadescription}
            onChange={handleInputChange}
            placeholder="Meta Description"
          />

          <input
            type="text"
            name="metakeywords"
            className="form-control mb-3"
            value={categoryData.metakeywords}
            onChange={handleInputChange}
            placeholder="Meta Keywords"
          />

          {/* TIPTAP EDITOR */}
          <div className="border p-2 bg-white mb-3">
            <EditorContent editor={editor} className="min-h-[200px]" />
          </div>

          {/* IMAGE UPLOAD */}
          <input type="file" className="form-control mb-3" onChange={handleImageChange} />

          {previewImage && (
            <Image src={previewImage} width={120} height={120} alt="Preview" />
          )}

          {/* TRENDING */}
          <label className="mt-3 d-flex gap-2 align-items-center">
            <input
              type="checkbox"
              name="isTrending"
              checked={categoryData.isTrending}
              onChange={handleInputChange}
            />
            Trending Category
          </label>

          {/* SUBCATEGORY MULTI SELECT */}
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

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Category"}
          </button>
        </form>
      )}
    </div>
  );
}
