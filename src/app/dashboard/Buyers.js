"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Buyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const response = await fetch("/api/adminprofile/buyers");
        if (!response.ok) throw new Error("Failed to fetch buyers");
        const data = await response.json();
        const sortedBuyers = data.buyers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBuyers(sortedBuyers);
        setFilteredBuyers(sortedBuyers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterBuyers(term, searchDate);
  };

  const handleDateFilter = (e) => {
    const date = e.target.value;
    setSearchDate(date);
    filterBuyers(searchTerm, date);
  };

  const filterBuyers = (term, date) => {
    let filtered = buyers;
    if (term) {
      filtered = filtered.filter(
        (buyer) =>
          buyer.fullname.toLowerCase().includes(term.toLowerCase()) ||
          buyer.email.toLowerCase().includes(term.toLowerCase()) ||
          buyer.mobileNumber.includes(term) ||
          buyer.productname.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (date) {
      filtered = filtered.filter((buyer) => buyer.otpExpires?.startsWith(date));
    }
    setFilteredBuyers(filtered);
  };

  const handleDeleteBuyer = async (id) => {
    if (!id) return;

    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch(`/api/adminprofile/buyers?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire("Deleted!", "The buyer has been deleted.", "success");
        const updatedBuyers = buyers.filter((buyer) => buyer._id !== id);
        setBuyers(updatedBuyers);
        setFilteredBuyers(updatedBuyers);
      } else {
        Swal.fire("Error", "Failed to delete buyer: " + data.message, "error");
      }
    } catch (error) {
      console.error("❌ Error deleting buyer:", error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    }
  };

  const handleRemarkUpdate = async (buyerId, newRemark) => {
    try {
      const res = await fetch("/api/adminprofile/buyers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: buyerId, remark: newRemark }),
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire("Success", "Remark updated", "success");
        setBuyers((prev) =>
          prev.map((b) => (b._id === buyerId ? { ...b, remark: newRemark } : b))
        );
        setFilteredBuyers((prev) =>
          prev.map((b) => (b._id === buyerId ? { ...b, remark: newRemark } : b))
        );
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (err) {
      console.error("❌ Remark update error:", err);
      Swal.fire("Error", "Failed to update remark", "error");
    }
  };

  return (
    <div className="container mt-4 text-sm">
      <div className="card shadow p-4">
        <h6 className="text-center mb-4 res-color2 text-light w-50 rounded-5 m-auto p-2 common-shad">
          All Buyers
        </h6>

        {/* ✅ Search & Date Filter */}
        <Form className="mb-3 d-flex gap-2 res-color2 rounded-3 common-shad p-3">
          <Form.Control
            type="text"
            placeholder="Search by name, email, or phone number"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Form.Control type="date" value={searchDate} onChange={handleDateFilter} />
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm("");
              setSearchDate("");
              setFilteredBuyers(buyers);
            }}
          >
            Reset
          </Button>
        </Form>

        {/* ✅ Conditional Rendering */}
        {loading ? (
          <div className="mb-4">
            <Skeleton height={40} count={1} className="mb-2" />
            <Skeleton height={30} count={1} className="mb-2" />
            <Table className="table-striped table-bordered table-hover table-responsive common-shad">
              <thead className="table-dark">
                <tr>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <th key={i}><Skeleton width={100} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><Skeleton height={20} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : error ? (
          <p className="text-danger">Error: {error}</p>
        ) : filteredBuyers.length === 0 ? (
          <p>No buyers found.</p>
        ) : (
          <Table className="table-striped table-bordered table-hover table-responsive common-shad">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>Product Name</th>
                <th>Inquired Products</th>
                <th>Remark</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map((buyer, index) => (
                <tr key={buyer._id}>
                  <td>{index + 1}</td>
                  <td>{buyer.fullname || "N/A"}</td>
                  <td>{buyer.email || "N/A"}</td>
                  <td>{buyer.mobileNumber || "N/A"}</td>
                  <td>{buyer.productname || "N/A"}</td>
                  <td>{buyer.inquiredProducts || "N/A"}</td>
                  <td>
                    <Form.Select
                      value={buyer.remark || ""}
                      onChange={(e) => handleRemarkUpdate(buyer._id, e.target.value)}
                    >
                      <option value="">No Remark</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Interested">Interested</option>
                      <option value="Spam">Spam</option>
                      <option value="Not Responding">Not Responding</option>
                    </Form.Select>
                  </td>
                  <td>
                    {buyer.createdAt
                      ? new Date(buyer.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                      : "N/A"}
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteBuyer(buyer._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Buyers;
