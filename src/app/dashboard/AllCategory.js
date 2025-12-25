"use client";

import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import axios from "axios";
import "./metamodal.css";

export default function AllCategory() {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/all-categories", { cache: "no-store" });
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Admin Category Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesName =
        category.name.toLowerCase().includes(searchTerm) ||
        category.subcategories?.some((s) =>
          s.name.toLowerCase().includes(searchTerm)
        );

      const categoryDate = category.createdAt
        ? new Date(category.createdAt).toISOString().split("T")[0]
        : "";

      const matchesDate = !searchDate || categoryDate === searchDate;

      return matchesName && matchesDate;
    });
  }, [categories, searchTerm, searchDate]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this category?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/api/adminprofile/category?id=${id}`);
      Swal.fire("Deleted!", "Category removed.", "success");

      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      Swal.fire("Error", "Failed to delete.", "error");
    }
  };

  const openMetaModal = (category) => {
    setMetaForm({
      id: category._id,
      name: category.name,
      metatitle: category.metatitle,
      metadescription: category.metadescription,
      metakeywords: category.metakeywords,
      categoryslug: category.categoryslug,
    });
    setShowMetaModal(true);
  };

  const handleMetaUpdate = async () => {
    try {
      await axios.patch(`/api/adminprofile/category/meta`, metaForm);
      Swal.fire("Success", "Category Updated!", "success");

      setShowMetaModal(false);
    } catch (e) {
      Swal.fire("Error", "Update failed.", "error");
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-4">
      {/* Search row */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Search category or subcategory"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>

        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            onChange={(e) => setSearchDate(e.target.value)}
          />
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredCategories.map((cat) => (
            <tr key={cat._id}>
              <td>
                <Image src={cat.icon} width={40} height={40} alt="" />
              </td>
              <td>{cat.name}</td>

              <td>
                {cat.subcategories.map((s) => (
                  <span key={s._id} className="badge bg-info m-1">{s.name}</span>
                ))}
              </td>

              <td>{new Date(cat.createdAt).toLocaleString()}</td>

              <td>
                <button className="btn btn-success btn-sm w-100 mb-2" onClick={() => openMetaModal(cat)}>
                  Edit Meta
                </button>

                <button className="btn btn-danger btn-sm w-100" onClick={() => handleDelete(cat._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Meta Modal */}
      {showMetaModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <h4>Update Category</h4>

            <input
              value={metaForm.name}
              onChange={(e) =>
                setMetaForm({
                  ...metaForm,
                  name: e.target.value,
                  categoryslug: generateSlug(e.target.value),
                })
              }
              placeholder="Category Name"
              className="form-control mb-2"
            />

            <input className="form-control mb-2" value={metaForm.categoryslug} disabled />

            <input
              className="form-control mb-2"
              value={metaForm.metatitle}
              placeholder="Meta Title"
              onChange={(e) => setMetaForm({ ...metaForm, metatitle: e.target.value })}
            />

            <input
              className="form-control mb-2"
              value={metaForm.metadescription}
              placeholder="Meta Description"
              onChange={(e) => setMetaForm({ ...metaForm, metadescription: e.target.value })}
            />

            <input
              className="form-control mb-2"
              value={metaForm.metakeywords}
              placeholder="Meta Keywords"
              onChange={(e) => setMetaForm({ ...metaForm, metakeywords: e.target.value })}
            />

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary w-50" onClick={handleMetaUpdate}>Update</button>
              <button className="btn btn-secondary w-50" onClick={() => setShowMetaModal(false)}>Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
