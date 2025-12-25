"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function CreateSubCategory() {

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [productData, setProductData] = useState({
    name: "",
    category: "",
    subcategoryslug: "",
    metatitle: "",
    metadescription: "",
    metakeyword: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // ✅ Load lightweight categories (NO REDUX)
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/sub-category-categories", { cache: "no-store" });
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Category loading error:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Auto slug until manually edited
  useEffect(() => {
    if (!slugEdited) {
      setProductData((p) => ({
        ...p,
        subcategoryslug: generateSlug(p.name),
      }));
    }
  }, [productData.name, slugEdited]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
    if (name === "subcategoryslug") setSlugEdited(true);
  };

  const uploadImageToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "unsigned_subcategory_upload");

    const res = await fetch("https://api.cloudinary.com/v1_1/dchek3sr8/image/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");

    return { secure_url: data.secure_url, public_id: data.public_id };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, category, subcategoryslug, metatitle, metadescription, metakeyword } =
      productData;

    if (!name || !category || !subcategoryslug || !metatitle) {
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }

    let iconUrl = "", iconPublicId = "";

    if (file) {
      const upload = await uploadImageToCloudinary(file);
      iconUrl = upload.secure_url;
      iconPublicId = upload.public_id;
    }

    try {
      await axios.post("/api/adminprofile/subcategory", {
        ...productData,
        icon: iconUrl,
        iconPublicId,
      });

      toast.success("SubCategory created!");

      setProductData({
        name: "",
        category: "",
        subcategoryslug: "",
        metatitle: "",
        metadescription: "",
        metakeyword: "",
      });

      setSlugEdited(false);
      setFile(null);

    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create subcategory");
    }

    setLoading(false);
  };

  return (
    <div className="create-product-form p-4">

      <h3>Create New SubCategory</h3>

      {loadingCategories && <p className="text-blue-600">Loading categories...</p>}

      {/* Category Dropdown */}
      <select
        className="form-control mb-3"
        name="category"
        value={productData.category}
        onChange={handleInputChange}
        required
      >
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Form Fields */}
      <input
        type="text"
        name="name"
        className="form-control mb-3"
        placeholder="SubCategory Name"
        value={productData.name}
        onChange={handleInputChange}
        required
      />

      <input
        type="text"
        name="subcategoryslug"
        className="form-control mb-3"
        placeholder="Slug"
        value={productData.subcategoryslug}
        onChange={handleInputChange}
        required
      />

      {/* Upload Icon */}
      <input
        type="file"
        className="form-control mb-3"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Meta Fields */}
      <input
        type="text"
        name="metatitle"
        className="form-control mb-3"
        placeholder="Meta Title"
        value={productData.metatitle}
        onChange={handleInputChange}
        required
      />

      <textarea
        name="metadescription"
        rows="3"
        className="form-control mb-3"
        placeholder="Meta Description"
        value={productData.metadescription}
        onChange={handleInputChange}
        required
      ></textarea>

      <input
        type="text"
        name="metakeyword"
        className="form-control mb-3"
        placeholder="Meta Keywords"
        value={productData.metakeyword}
        onChange={handleInputChange}
        required
      />

      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating..." : "Create SubCategory"}
      </button>
    </div>
  );
}
