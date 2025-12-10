"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/store/categorySlice";

// Slug generator
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const CreateSubCategory = () => {
  const dispatch = useDispatch();

  // ⬇ Fetching categories from Redux store
  const { data: selectedCategory, loading: categoryLoading, error } = useSelector(
    (state) => state.categories
  );

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

  // ⬇ Load categories from Redux
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto slug update until user edits manually
  useEffect(() => {
    setProductData((prev) => {
      if (slugEdited) return prev;
      return { ...prev, subcategoryslug: generateSlug(prev.name) };
    });
  }, [productData.name, slugEdited]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });

    if (name === "subcategoryslug") setSlugEdited(true);
  };

  /** ------------------------------------
   * Cloudinary Upload
   ------------------------------------**/
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_subcategory_upload");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dchek3sr8/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      const errTxt = await res.text();
      throw new Error(`Cloudinary upload failed: ${errTxt}`);
    }

    const data = await res.json();
    if (!data.secure_url || !data.public_id) {
      throw new Error("Image upload failed: Missing URL or Public ID.");
    }

    return { secure_url: data.secure_url, public_id: data.public_id };
  };

  /** ------------------------------------
   * Submit Form
   ------------------------------------**/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, category, subcategoryslug, metatitle, metadescription, metakeyword } =
      productData;

    if (!name || !category || !subcategoryslug || !metatitle || !metadescription || !metakeyword) {
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }

    let iconUrl = "";
    let iconPublicId = "";

    if (file) {
      toast.loading("Uploading subcategory icon...");

      try {
        const upload = await uploadImageToCloudinary(file);
        iconUrl = upload.secure_url;
        iconPublicId = upload.public_id;
        toast.dismiss();
        toast.success("Subcategory icon uploaded!");
      } catch (err) {
        toast.dismiss();
        toast.error(err.message || "Upload failed.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.post(`/api/adminprofile/subcategory`, {
        name,
        category,
        subcategoryslug,
        metatitle,
        metadescription,
        metakeyword,
        icon: iconUrl,
        iconPublicId,
      });

      if (response.status === 201) {
        toast.success("SubCategory created!");

        // Reset form
        setProductData({
          name: "",
          category: "",
          subcategoryslug: "",
          metatitle: "",
          metadescription: "",
          metakeyword: "",
        });

        setFile(null);
        setSlugEdited(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create subcategory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-product-form p-4">
      <h3>Create a New SubCategory</h3>

      {/* Category Loading State */}
      {categoryLoading && (
        <div className="text-blue-600 my-2">Loading categories...</div>
      )}

      {/* Category Error */}
      {error && <div className="text-red-500">{error}</div>}

      <input
        className="form-control mb-3"
        type="text"
        name="name"
        placeholder="Enter SubCategory Name"
        value={productData.name}
        onChange={handleInputChange}
        required
      />

      <input
        className="form-control mb-3"
        type="text"
        name="subcategoryslug"
        placeholder="SubCategory Slug"
        value={productData.subcategoryslug}
        onChange={handleInputChange}
        required
      />

      {/* Category Selection from Redux */}
      <select
        className="form-control mb-3"
        name="category"
        value={productData.category}
        onChange={handleInputChange}
        required
      >
        <option value="">Select Category</option>

        {selectedCategory?.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Icon Upload */}
      <div className="mb-3">
        <label className="form-label">SubCategory Icon</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="mt-2"
            style={{ maxWidth: "100px" }}
          />
        )}
      </div>

      <input
        className="form-control mb-3"
        type="text"
        name="metatitle"
        placeholder="Enter Meta Title"
        value={productData.metatitle}
        onChange={handleInputChange}
        required
      />

      <textarea
        className="form-control mb-3"
        name="metadescription"
        rows={3}
        placeholder="Enter Meta Description"
        value={productData.metadescription}
        onChange={handleInputChange}
        required
      ></textarea>

      <input
        className="form-control mb-3"
        type="text"
        name="metakeyword"
        placeholder="Enter Meta Keywords"
        value={productData.metakeyword}
        onChange={handleInputChange}
        required
      />

      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating..." : "Create SubCategory"}
      </button>
    </div>
  );
};

export default CreateSubCategory;
