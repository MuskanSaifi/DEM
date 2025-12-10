"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Buyers = ({ supportMember }) => {
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

        {error && <p className="text-danger">Error: {error}</p>}
        {!loading && !error && filteredBuyers.length === 0 && <p>No buyers found.</p>}

        <Table className="table-striped table-bordered table-hover table-responsive common-shad">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Product Name</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td><Skeleton width={20} /></td>
                  <td><Skeleton width={100} /></td>
                  <td><Skeleton width={150} /></td>
                  <td><Skeleton width={120} /></td>
                  <td><Skeleton width={130} /></td>
                  <td><Skeleton width={170} /></td>
                  <td><Skeleton width={60} height={30} /></td>
                </tr>
              ))
            ) : (
              filteredBuyers.map((buyer, index) => (
                <tr key={buyer._id}>
                  <td>{index + 1}</td>
                  <td>{buyer.fullname || "N/A"}</td>
                  <td>{buyer.email || "N/A"}</td>
                  <td>{buyer.mobileNumber || "N/A"}</td>
                  <td>{buyer.productname || "N/A"}</td>
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
                    <Button variant="danger" size="sm" onClick={handleDeleteBuyer}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Buyers;
