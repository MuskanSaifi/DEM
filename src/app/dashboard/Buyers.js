"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Buyers = ({ appliedClientFilter }) => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  useEffect(() => {
    if (!appliedClientFilter) return;
    const parts = [
      appliedClientFilter.name,
      appliedClientFilter.email,
      appliedClientFilter.phone,
      appliedClientFilter.businessName,
    ].filter(Boolean);
    if (parts.length) setSearchTerm(parts.join(" "));
    if (appliedClientFilter.paymentStatus !== undefined)
      setPaymentStatusFilter(appliedClientFilter.paymentStatus || "");
  }, [appliedClientFilter]);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
      if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);
      const response = await fetch(`/api/adminprofile/buyers?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch buyers");
      const data = await response.json();
      setBuyers(data.buyers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [searchTerm, paymentStatusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilter = (e) => {
    setSearchDate(e.target.value);
  };

  const filteredBuyers = searchDate
    ? buyers.filter((b) => {
        const d = b.createdAt ? new Date(b.createdAt).toISOString().split("T")[0] : "";
        return d === searchDate;
      })
    : buyers;

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
        setBuyers((prev) => prev.filter((buyer) => buyer._id !== id));
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
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (err) {
      console.error("❌ Remark update error:", err);
      Swal.fire("Error", "Failed to update remark", "error");
    }
  };

  const handlePaymentStatusUpdate = async (buyerId, paymentStatus) => {
    try {
      const res = await fetch("/api/adminprofile/buyers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: buyerId, paymentStatus }),
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire("Success", "Payment status updated", "success");
        setBuyers((prev) =>
          prev.map((b) => (b._id === buyerId ? { ...b, paymentStatus } : b))
        );
      } else {
        Swal.fire("Error", result.message || "Update failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update payment status", "error");
    }
  };

  return (
    <div className="container mt-4 text-sm">
      <div className="card shadow p-4">
        <h6 className="text-center mb-4 res-color2 text-light w-50 rounded-5 m-auto p-2 common-shad">
          All Buyers
        </h6>

        {/* ✅ Search & Date Filter */}
        <Form className="mb-3 d-flex gap-2 res-color2 rounded-3 common-shad p-3 flex-wrap">
          <Form.Control
            type="text"
            placeholder="Search by name, email, phone, or business name"
            value={searchTerm}
            onChange={handleSearch}
            className="min-w-[200px]"
          />
          <Form.Control type="date" value={searchDate} onChange={handleDateFilter} />
          <Form.Select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All (Paid/Unpaid)</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </Form.Select>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm("");
              setSearchDate("");
              setPaymentStatusFilter("");
              fetchBuyers();
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
                <th>Payment</th>
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
                    <Form.Select
                      size="sm"
                      value={buyer.paymentStatus || "unpaid"}
                      onChange={(e) => handlePaymentStatusUpdate(buyer._id, e.target.value)}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
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
