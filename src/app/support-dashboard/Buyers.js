"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import Swal from "sweetalert2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Buyers = ({ supportMember, appliedClientFilter }) => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const buyersPerPage = 10;

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
    setCurrentPage(1);
    fetchBuyers();
  }, [searchTerm, paymentStatusFilter]);

  const filteredBuyers = searchDate
    ? buyers.filter((b) => {
        const d = b.createdAt
          ? new Date(b.createdAt).toISOString().split("T")[0]
          : "";
        return d === searchDate;
      })
    : buyers;

  // Pagination Logic
  const indexOfLastBuyer = currentPage * buyersPerPage;
  const indexOfFirstBuyer = indexOfLastBuyer - buyersPerPage;
  const currentBuyers = filteredBuyers.slice(
    indexOfFirstBuyer,
    indexOfLastBuyer
  );

  const totalPages = Math.ceil(filteredBuyers.length / buyersPerPage);

  const handleRemarkAdd = async (buyerId, newRemark) => {
    try {
      const res = await fetch("/api/adminprofile/buyers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: buyerId, remark: newRemark }),
      });
      const result = await res.json();
      if (result.success) {
        setBuyers((prev) =>
          prev.map((b) =>
            b._id === buyerId
              ? { ...b, remarks: result.updated?.remarks || [...(b.remarks || []), { text: newRemark, addedAt: new Date() }] }
              : b
          )
        );
      }
    } catch (err) {
      Swal.fire("Error", "Failed to add remark", "error");
    }
  };

  const handleRemarkSelect = async (buyerId, value) => {
    if (value === "__custom__") {
      const { value: customRemark } = await Swal.fire({
        title: "Add Custom Remark",
        input: "text",
        inputLabel: "Enter your remark",
        inputPlaceholder: "Type your custom remark...",
        showCancelButton: true,
        confirmButtonText: "Add",
        inputValidator: (val) => (val?.trim() ? null : "Remark cannot be empty"),
      });
      if (customRemark?.trim()) handleRemarkAdd(buyerId, customRemark.trim());
      return;
    }
    if (value) handleRemarkAdd(buyerId, value);
  };

  const handleDeleteBuyer = () => {
    Swal.fire({
      icon: "info",
      title: "Restricted Action",
      text: "Only admin can delete buyers",
      confirmButtonColor: "#3085d6",
    });
  };

  if (!supportMember?.allBuyerAccess) {
    return (
      <div className="text-center text-danger fw-bold mt-5">
        Admin can't give you access to this page.
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">

        <h6 className="text-center mb-4 res-color2 text-light w-50 rounded-5 m-auto p-2 common-shad">
          All Buyers
        </h6>

        <Form className="mb-3 d-flex align-items-center gap-2 res-color2 rounded-3 common-shad p-3 flex-nowrap">

          <Form.Control
            type="text"
            placeholder="Search by name, email, phone, or business name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: "280px" }}
          />

          <Form.Control
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            style={{ minWidth: "160px" }}
          />

          <Form.Select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            style={{ minWidth: "150px" }}
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
              setCurrentPage(1);
              fetchBuyers();
            }}
          >
            Reset
          </Button>

        </Form>

        {error && <p className="text-danger">Error: {error}</p>}
        {!loading && !error && filteredBuyers.length === 0 && <p>No buyers found.</p>}

        {/* Scrollable Table */}
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>

          <Table className="table-striped table-bordered table-hover common-shad">

            <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>Product Name</th>
                <th>Remark</th>
                <th>Payment</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td><Skeleton width={20} /></td>
                      <td><Skeleton width={100} /></td>
                      <td><Skeleton width={150} /></td>
                      <td><Skeleton width={120} /></td>
                      <td><Skeleton width={130} /></td>
                      <td><Skeleton width={120} /></td>
                      <td><Skeleton width={80} /></td>
                      <td><Skeleton width={170} /></td>
                      <td><Skeleton width={60} height={30} /></td>
                    </tr>
                  ))
                : currentBuyers.map((buyer, index) => (
                    <tr key={buyer._id}>
                      <td>{indexOfFirstBuyer + index + 1}</td>

                      <td>{buyer.fullname || "N/A"}</td>

                      <td>{buyer.email || "N/A"}</td>

                      <td>{buyer.mobileNumber || "N/A"}</td>

                      <td>{buyer.productname || "N/A"}</td>

                      <td>
                        <div className="d-flex flex-column gap-1">
                          {(buyer.remarks || []).length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mb-1">
                              {[...(buyer.remarks || [])]
                                .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
                                .map((r, i) => (
                                  <span
                                    key={i}
                                    className="badge bg-secondary text-wrap text-start"
                                    style={{ fontSize: "0.7rem", maxWidth: "100%" }}
                                  >
                                    {r.text}
                                    <small className="ms-1 opacity-75">
                                      ({r.addedAt ? new Date(r.addedAt).toLocaleDateString() : ""})
                                    </small>
                                  </span>
                                ))}
                            </div>
                          )}
                          <Form.Select
                            size="sm"
                            value=""
                            onChange={(e) => {
                              handleRemarkSelect(buyer._id, e.target.value);
                              e.target.value = "";
                            }}
                          >
                            <option value="">Add remark...</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Interested">Interested</option>
                            <option value="Hot Lead">Hot Lead</option>
                            <option value="Call Back">Call Back</option>
                            <option value="Negotiating">Negotiating</option>
                            <option value="Closed">Closed</option>
                            <option value="Email Sent">Email Sent</option>
                            <option value="Meeting Scheduled">Meeting Scheduled</option>
                            <option value="Spam">Spam</option>
                            <option value="Not Responding">Not Responding</option>
                            <option value="__custom__">Custom Remark...</option>
                          </Form.Select>
                        </div>
                      </td>

                      <td>
                        {(buyer.paymentStatus || "unpaid")
                          .charAt(0)
                          .toUpperCase() +
                          (buyer.paymentStatus || "unpaid").slice(1)}
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
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleDeleteBuyer}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}

            </tbody>
          </Table>
        </div>

{/* Pagination */}
{totalPages > 1 && (
  <div className="d-flex justify-content-center mt-3">

    <Pagination>

      <Pagination.Prev
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      />

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 2 && page <= currentPage + 2)
          ) {
            return true;
          }
          return false;
        })
        .map((page, index, array) => {
          const prevPage = array[index - 1];

          return (
            <React.Fragment key={page}>
              {prevPage && page - prevPage > 1 && (
                <Pagination.Ellipsis disabled />
              )}

              <Pagination.Item
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Pagination.Item>
            </React.Fragment>
          );
        })}

      <Pagination.Next
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      />

    </Pagination>

  </div>
)}

      </div>
    </div>
  );
};

export default Buyers;