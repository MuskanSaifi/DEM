"use client";

import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/store/categorySlice";
import "./metamodal.css";

export default function AllCategory() {
  const dispatch = useDispatch();

  // Redux State
  const { data: categories, loading, error } = useSelector(
    (state) => state.categories
  );

  // Local States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showMetaModal, setShowMetaModal] = useState(false);

  const [metaForm, setMetaForm] = useState({
    id: "",
    name: "",
    metatitle: "",
    metadescription: "",
    metakeywords: "",
    categoryslug: "",
  });

  // Fetch categories once
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Generate slug
  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  // Optimized Filter (Avoid filtering inside JSX)
  const filteredCategories = useMemo(() => {
    return (
      categories?.filter((category) => {
        const categoryDate = category.createdAt
          ? new Date(category.createdAt).toISOString().split("T")[0]
          : "";

        const matchesName =
          category.name?.toLowerCase().includes(searchTerm) ||
          category.subcategories?.some((s) =>
            s.name.toLowerCase().includes(searchTerm)
          );

        const matchesDate = !searchDate || categoryDate === searchDate;

        return matchesName && matchesDate;
      }) || []
    );
  }, [categories, searchTerm, searchDate]);

  // Delete category
  const handleDelete = async (categoryId) => {
    const confirm = await Swal.fire({
      title: "Delete this category?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/api/adminprofile/category?id=${categoryId}`);
      Swal.fire("Deleted!", "Category removed successfully", "success");
      dispatch(fetchCategories());
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.error || "Failed to delete", "error");
    }
  };

  // Open modal and load data
  const openMetaModal = (category) => {
    setMetaForm({
      id: category._id,
      name: category.name || "",
      metatitle: category.metatitle || "",
      metadescription: category.metadescription || "",
      metakeywords: category.metakeywords || "",
      categoryslug: category.categoryslug || "",
    });
    setShowMetaModal(true);
  };

  // Update
  const handleMetaUpdate = async () => {
    try {
      await axios.patch(`/api/adminprofile/category/meta`, metaForm);
      Swal.fire("Success", "Category updated", "success");
      setShowMetaModal(false);
      dispatch(fetchCategories());
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.error || "Failed to update",
        "error"
      );
    }
  };

  // --------------------
  // RENDER
  // --------------------

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-4">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="container mt-4">
      {/* Search Filters */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search category or subcategory"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>

        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button className="btn btn-secondary w-100" onClick={() => setSearchTerm("")}>
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered text-center">
        <thead className="bg-dark text-white">
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Subcategories</th>
            <th>Created At</th>
            <th>Operations</th>
          </tr>
        </thead>

        <tbody>
          {filteredCategories.length === 0 ? (
            <tr>
              <td colSpan="5">No matching categories found.</td>
            </tr>
          ) : (
            filteredCategories.map((category) => (
              <tr key={category._id}>
                <td>
                  {category.icon && (
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={50}
                      height={50}
                    />
                  )}
                </td>

                <td>
                  <div>{category.name}</div>
                  <small className="text-muted">{category._id}</small>
                </td>

                <td>
                  {category.subcategories?.length ? (
                    <ul className="list-unstyled m-0">
                      {category.subcategories.map((sub) => (
                        <li className="common-shad rounded-2 m-2" key={sub._id}>
                          {sub.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No Subcategories"
                  )}
                </td>

                <td>{new Date(category.createdAt).toLocaleString()}</td>

                <td>
                  <button
                    className="btn btn-success btn-sm w-100 mb-2"
                    onClick={() => openMetaModal(category)}
                  >
                    Update Category
                  </button>

                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => handleDelete(category._id)}
                  >
                    Delete Category
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showMetaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Update Category</h4>

            <input
              type="text"
              placeholder="Category Name"
              value={metaForm.name}
              onChange={(e) =>
                setMetaForm({
                  ...metaForm,
                  name: e.target.value,
                  categoryslug: generateSlug(e.target.value),
                })
              }
            />

            <input type="text" value={metaForm.categoryslug} disabled />

            <input
              type="text"
              placeholder="Meta Title"
              value={metaForm.metatitle}
              onChange={(e) =>
                setMetaForm({ ...metaForm, metatitle: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Meta Description"
              value={metaForm.metadescription}
              onChange={(e) =>
                setMetaForm({ ...metaForm, metadescription: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Meta Keywords"
              value={metaForm.metakeywords}
              onChange={(e) =>
                setMetaForm({ ...metaForm, metakeywords: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button onClick={handleMetaUpdate}>Update</button>
              <button onClick={() => setShowMetaModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
