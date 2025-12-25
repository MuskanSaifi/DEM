import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimesCircle } from "react-icons/fa";
import { Table, Spinner, Button, Accordion, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import ProductTags from "./components/ProductTags";
import Image from "next/image";
import Link from "next/link";


const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Search state for name, email, company, mobile
  const [searchDate, setSearchDate] = useState(""); // ✅ Search state for registration date
 const [remarkFilter, setRemarkFilter] = useState(""); // ✅ Remark Filter

 const [loading, setLoading] = useState(true);
const [fetchError, setFetchError] = useState(null); // ✅ New state for robust error reporting
// ✅ NEW PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0); 
  const [limit] = useState(50); // Matches the backend default limit

const [remarkUpdates, setRemarkUpdates] = useState({});
const [selectedRemarks, setSelectedRemarks] = useState({});
const [customRemarks, setCustomRemarks] = useState({});

const handleCustomRemarkChange = (userId, value) => {
  setCustomRemarks((prev) => ({
    ...prev,
    [userId]: value,
  }));
  handleRemarkChange(userId, value);
};


  useEffect(() => {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);

// 🚨 Dependency change: Fetch only when currentPage changes
  useEffect(() => {
    fetchUsers();
}, [currentPage, searchTerm, searchDate, remarkFilter]);

  // You might want to remove the static tooltip initialization if using Bootstrap 5+
  useEffect(() => {
    // Note: Tooltip initialization should be guarded against window not existing if this component is server-side rendered.
    if (typeof window !== 'undefined' && window.bootstrap?.Tooltip) {
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach((tooltipTriggerEl) => {
            new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
  }, [users]); // Re-run when users load

  // Function to change page
const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null); 
    
    // ✅ 1. फ़िल्टर पैरामीटर को URL में जोड़ें
    const apiUrl = `/api/adminprofile/users?page=${currentPage}&limit=${limit}` +
                   `&searchTerm=${searchTerm}` +
                   `&searchDate=${searchDate}` +
                   `&remarkFilter=${remarkFilter}`;
                       
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 45000) 
    );

    try {
      const response = await Promise.race([
        axios.get(apiUrl), 
        timeoutPromise,
      ]);
      
      if (response.data.success) {
        setUsers(response.data.users); 
        // ✅ Update pagination state using the filtered total count
        setTotalUsersCount(response.data.totalUsersCount);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        throw new Error(response.data.message || "API fetch failed.");
      }
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setFetchError(error.message || "Failed to fetch users due to a network or server error.");
      Swal.fire("Error", "Failed to fetch users. The server might be slow or the data volume is too high. Loading only one page at a time should fix this.", "error"); 
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteUser = async (userId) => {
    if (!userId) return;

    // Confirm delete action
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the user and their products!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`/api/adminprofile/users?userId=${userId}`);

      if (response.data.success) {
        Swal.fire("Deleted!", response.data.message, "success");
        setUsers(users.filter((user) => user._id !== userId)); // ✅ Remove from UI
      } else {
        Swal.fire("Error!", response.data.message, "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire("Error!", "Failed to delete user", "error");
    }
  };

  // ✅ Handle Delete Function
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure want to delete this product?",
      text: "You won't be able to undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // const token = localStorage.getItem("token");
          // if (!token) {
          //   toast.error("User not authenticated");
          //   return;
          // }
          const res = await axios.delete(
            `/api/userprofile/manageproducts/${id}`
            // ,
            // {
            //   headers: { Authorization: `Bearer ${token}` },
            // }
          );
          if (res.data.success) {
            toast.success("Product deleted successfully!");
          } else {
            toast.error(res.data.message || "Failed to delete product.");
          }
        } catch (error) {
          toast.error("Failed to delete product.");
        }
      }
    });
  };

  const handleRemarkChange = (userId, newRemark) => {
  setRemarkUpdates((prev) => ({
    ...prev,
    [userId]: newRemark,
  }));
};

const saveRemark = async (userId) => {
  const remark = remarkUpdates[userId];
  if (!remark) return toast.error("Please select a remark.");

  try {
    const res = await fetch(`/api/adminprofile/users?id=${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ remark }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Remark updated successfully");

      // ✅ Update the user's remark in local users state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, remark } : user
        )
      );

      // ✅ Clear the temporary update value
      setRemarkUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[userId];
        return newUpdates;
      });
    } else {
      toast.error("Failed to update remark: " + data.message);
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};


  // ✅ Handle search input change
const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1); 
  };

  // ✅ Handle date filter change
const handleDateFilter = (e) => {
    setSearchDate(e.target.value);
    setCurrentPage(1);
  };

// ✅ Handle remark filter change - फ़िल्टर बदलने पर पेज 1 पर रीसेट करें
  const handleRemarkFilterChange = (e) => {
    setRemarkFilter(e.target.value);
    setCurrentPage(1);
  };

  const usersToDisplay = users;

  // 🚨 Filter users is now performed only on the users fetched for the current page.
  const filteredUsers = users.filter((user) => {
    const userDate = user.createdAt ? new Date(user.createdAt).toISOString().split("T")[0] : null;

    const matchesSearch = (
      user.fullname?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.companyName?.toLowerCase().includes(searchTerm) ||
      user.mobileNumber?.includes(searchTerm)
    );

    const matchesDate = (
      searchDate === "" || (userDate && userDate === searchDate)
    );

    const matchesRemark = (
      remarkFilter === "" || user.remark === remarkFilter
    );

    return matchesSearch && matchesDate && matchesRemark;
  });

  // calculatedprogreessbar
  const calculateProgress = (product) => {
    let totalFields = 0;
    let completedFields = 0;

    const checkAndCount = (obj) => {
      if (!obj) return;
      Object.keys(obj).forEach((key) => {
        totalFields++;
        if (obj[key] !== null && obj[key] !== "" && obj[key] !== undefined) {
          completedFields++;
        }
      });
    };

    checkAndCount(product);
    checkAndCount(product.tradeInformation);
    checkAndCount(product.specifications);
    checkAndCount(product.tradeShopping);

    if (product.images && product.images.length > 0) completedFields++;
    totalFields++;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const getStrengthLabel = (percentage) => {
    if (percentage <= 30) return { text: "Weak", color: "bg-danger" };
    if (percentage <= 70) return { text: "Medium Strength", color: "bg-warning" };
    return { text: "Strong", color: "bg-success" };
  };

  return (
    <div className="container mt-4">
      
      <h6 className="text-center mb-4 res-color2 text-light w-50 rounded-5	m-auto  p-2 common-shad">All Users & Their Products</h6>

      {/* ✅ Search & Date Filter */}
  <Form className="mb-3 d-flex flex-row align-items-center gap-2 flex-nowrap overflow-auto res-color2 rounded-3 common-shad p-3">
    <Form.Control
      type="text"
      placeholder="Search by name, email, company name, or phone number"
      value={searchTerm}
   onChange={handleSearch} // ✅ Call updated handler
  className="min-w-[250px]"
    />
    <Form.Control
      type="date"
      value={searchDate}
      onChange={handleDateFilter} // ✅ Call updated handler
       className="min-w-[180px]"
    />
    <Form.Select
      value={remarkFilter}
     onChange={handleRemarkFilterChange} // ✅ Call updated handler
     className="min-w-[200px]"
    >
      <option value="">All Remarks</option>
      <option value="Interested">Interested</option>
      <option value="Not Interested">Not Interested</option>
      <option value="Don't Pick Call">Don't Pick Call</option>
      <option value="Follow Up Needed">Follow Up Needed</option>
      <option value="Wrong Number">Wrong Number</option>
      <option value="Converted">Converted</option>
      <option value="Call Later">Call Later</option>
      <option value="Number Switched Off">Number Switched Off</option>
      <option value="Busy">Busy</option>
      <option value="No Requirement">No Requirement</option>
      <option value="Out of Budget">Out of Budget</option>
      <option value="Invalid Number">Invalid Number</option>
      <option value="Duplicate Lead">Duplicate Lead</option>
      <option value="Language Issue">Language Issue</option>
      <option value="Not Reachable">Not Reachable</option>
      <option value="Whatsapp Only">Whatsapp Only</option>
      <option value="Spam Lead">Spam Lead</option>
      <option value="Paid Client">Paid Client</option>
      <option value="Other">Other</option>
    </Form.Select>
<Button
      variant="secondary"
      onClick={() => {
        setSearchTerm("");
        setSearchDate("");
        setRemarkFilter("");
        setCurrentPage(1); // ✅ Reset page on reset filters
      }}
      className="min-w-[100px]"
    >
      Reset
    </Button>
  </Form>
  
{/* ✅ PAGINATION CONTROLS AND COUNT */}
      <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-muted text-sm">
            Total Users: <strong>{totalUsersCount}</strong> | Showing: **Page {currentPage} of {totalPages}**
          </h5>
          <nav>
            <ul className="pagination pagination-sm m-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <Button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading}>Previous</Button>
              </li>
              {/* Simple Page Number Display */}
              <li className="page-item active">
                  <Button className="page-link" disabled>
                    {currentPage}
                  </Button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <Button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading}>Next</Button>
              </li>
            </ul>
          </nav>
      </div>
      
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-secondary">Loading a large dataset. This may take a moment...</p>
        </div>
        ) : fetchError ? ( // ✅ Display dedicated error message
          <div className="alert alert-danger text-center">
            <strong>Error:</strong> {fetchError}. Please check server logs and network.
          </div>
      ) :  (
        <Table className="common-shad striped bordered hover responsive ">
          <thead className="table-dark"><tr><th>#</th>
              <th>Full Name</th>
              <th>Email | Mobile</th>
              {/* <th>Mobile</th> */}
              <th>
<span
  data-bs-toggle="tooltip"
  data-bs-placement="top"
  title="TP = Total Products | SP = Support Person"
  className="cursor-help underline decoration-dotted"
>
  Company | TP | SP
</span>

</th>
              <th>Remark</th>
              <th>Registered On</th> {/* ✅ Added Date */}
              <th>Action</th></tr>
          </thead>
          <tbody>
           {usersToDisplay.length > 0 ? ( 
              usersToDisplay.map((user, index) => (
                <React.Fragment key={user._id}>
                  <tr className="text-sm"><td>{index + 1}</td><td>{user.fullname}</td><td>{user.email} | {user.mobileNumber}</td><td>{user.companyName} | {user.products?.length} | {user.supportPerson?.name}</td>

<td className="py-2">
  <div className="flex items-center gap-2">
<div className="flex flex-col space-y-1">
  <select
    value={selectedRemarks[user._id] || user.remark || ""}
    onChange={(e) => {
      const value = e.target.value;
      setSelectedRemarks((prev) => ({
        ...prev,
        [user._id]: value,
      }));
      if (value !== "Other") {
        handleRemarkChange(user._id, value);
      }
    }}
    className="border px-3 py-1 rounded text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <option value="">-- Select / Update Remark --</option>
<option value="Interested">Interested</option>
<option value="Not Interested">Not Interested</option>
<option value="Don't Pick Call">Don't Pick Call</option>
<option value="Follow Up Needed">Follow Up Needed</option>
<option value="Wrong Number">Wrong Number</option>
<option value="Converted">Converted</option>
<option value="Call Later">Call Later</option>
<option value="Number Switched Off">Number Switched Off</option>
<option value="Busy">Busy</option>
<option value="No Requirement">No Requirement</option>
<option value="Out of Budget">Out of Budget</option>
<option value="Invalid Number">Invalid Number</option>
<option value="Duplicate Lead">Duplicate Lead</option>
<option value="Language Issue">Language Issue</option>
<option value="Not Reachable">Not Reachable</option>
<option value="Whatsapp Only">Whatsapp Only</option>
<option value="Spam Lead">Spam Lead</option>
<option value="Paid Client">Paid Client</option>
    <option value="Other">Other</option>
  </select>

  {selectedRemarks[user._id] === "Other" && (
<input
  type="text"
  placeholder="Enter custom remark"
  value={customRemarks[user._id] || ""}
  onChange={(e) => handleCustomRemarkChange(user._id, e.target.value)}
  className="border px-3 py-1 rounded text-sm bg-white shadow-sm"
/>
  )}
</div>



    <button
      onClick={() => saveRemark(user._id)}
      className="bg-blue-600 hover:bg-blue-700 transition-all duration-150 text-white px-3 py-1 rounded text-sm shadow"
    >
      Save
    </button>
  </div>
  {user.remark && (
    <div className="text-xs text-gray-600 mt-1">
      Current: <span className="font-medium text-black">{user.remark}</span>
    </div>
  )}
</td>


<td>
  {user.createdAt
    ? new Date(user.createdAt).toLocaleString("en-GB", {
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
                      <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user._id)}>
                        🗑️
                      </Button>
                    </td></tr><tr><td colSpan="7" className="td-bg">
                      {user.products?.length > 0 ? (
                        <Accordion>
                          {user.products.map((product, i) => {
                            const progress = calculateProgress(product);
                            const strength = getStrengthLabel(progress);

                            const formatDate = (date) =>
                              new Date(date).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Kolkata",
                              });
                            return (
                              <Accordion.Item key={product._id} eventKey={i.toString()} className="mb-2">
                                <Accordion.Header>
    <strong className="text-sm">{i + 1}. {product.name}</strong>
                                  <div className="nnn">
                                    <FaTimesCircle className="text-danger bg-light rounded-3 my-shad" role="button" onClick={() => handleDelete(product._id)} />
                                  </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                  {/* <strong className="text-sm text-danger">{product._id}</strong> */}
                                  <div className="d-flex justify-content-between">
                                    <div>
                                    <span className="res-color2 text-light text-sm common-shad px-3 py-1 rounded-2">
                                    🕒 <b>Created At:</b> {formatDate(product.createdAt)}
                                    </span> 
                                    </div>

                                    <div>
                                  <span className="res-color2 text-light text-sm common-shad px-3 py-1 rounded-2">
                                    🕒 <b>Updated At: </b>{formatDate(product.updatedAt)}
                                    </span>
                                    </div>
                                  </div>

                                  <div className="row mb-3 mt-3">
                                    <div className="col-md-2">
                                <Link href={`/products/${product._id}`}>
    <Image
      src={product?.images[0]?.url || "/default-image.jpg"}
      alt="Product"
      width={100}
      height={100}
      className="me-3 p-2 rounded-[5px] object-cover common-shad"
      unoptimized
    />
</Link>
                                    </div>

                                     <div className="col-md-10">
                                            <div className="row align-items-stretch">
                                              <div className="col-md-2">
                                                <div className="res-color1 text-center p-2 rounded-3 common-shad h-100 d-flex flex-column justify-content-center">
                                                  <span className="text-sm d-block">Product Name</span>  
                                                  <span className="res1-text-color fw-bold">{product.name}</span> 
                                                </div>
                                              </div>

                                              <div className="col-md-2">
                                                <div className="res-color1 text-center p-2 rounded-3 common-shad h-100 d-flex flex-column justify-content-center">
                                                  <span className="text-sm d-block">Product Price</span>  
                                                  <span className="res1-text-color fw-bold">{product.currency} ₹{product.price}</span>
                                                </div>
                                              </div>

                                              <div className="col-md-2">
                                                <div className="res-color1 text-center p-2 rounded-3 common-shad h-100 d-flex flex-column justify-content-center">
                                                  <span className="text-sm d-block">MOQ</span>  
                                                  <span className="res1-text-color fw-bold">{product.minimumOrderQuantity}</span>
                                                </div>
                                              </div>

                                              <div className="col-md-2">
                                                <div className="res-color1 text-center p-2 rounded-3 common-shad h-100 d-flex flex-column justify-content-center">
                                                  <span className="text-sm d-block">Category</span>  
                                                  <span className="res1-text-color fw-bold">{product?.category?.name}</span>
                                                </div>
                                              </div>

                                              <div className="col-md-2">
                                                <div className="res-color1 text-center p-2 rounded-3 common-shad h-100 d-flex flex-column justify-content-center">
                                                  <span className="text-sm d-block">Sub Category</span>  
                                                  <span className="res1-text-color fw-bold">{product?.subCategory?.name}</span>
                                                </div>
                                              </div>

                                              <div className="col-md-2">
                                                <div className="res-color1 text-center p-2 rounded-3 common-shad h-100 d-flex flex-column justify-content-center">
                                                  <span className="text-sm d-block">Location</span>  
                                                  <span className="text-sm rounded-2">
                                                    <b>State:</b> {product?.state} <br />
                                                    <b>City:</b> {product?.city}
                                                  </span>
                                                </div>
                                              </div>

                                              <p className="text-sm mt-2 text-gray-600">{product.description}</p>
                                            </div>

                                    </div>
                                  </div>

                                  <div className="progress">
                                    <div className={`progress-bar ${strength.color}`} style={{ width: `${progress}%` }}>
                                      {progress}% Complete
                                    </div>
                                  </div>
                                  <div className="container">

                                    <div className="row">
                                      {/* Trade Information */}
                                      <div className="col-md-4">
                                        <h6 className="common-shad mt-2 mb-2 rounded-2 p-2 res1-text-color res-color1">Trade Information</h6>
                                        <ul className="res-color1 p-3 rounded-3 res1-text-color common-shad">
                                          <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Supply Ability:</div>
                                              <div className="col-5">{product.tradeInformation?.supplyAbility || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Delivery Time:</div>
                                              <div className="col-5">{product.tradeInformation?.deliveryTime || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">FOB Port:</div>
                                              <div className="col-5">{product.tradeInformation?.fobPort || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Sample Policy:</div>
                                              <div className="col-5">{product.tradeInformation?.samplePolicy || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Sample Available:</div>
                                              <div className="col-5">{product.tradeInformation?.sampleAvailable || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Main Export Markets:</div>
                                              <div className="col-5">{product.tradeInformation?.mainExportMarkets?.join(", ") || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Certifications:</div>
                                              <div className="col-5">{product.tradeInformation?.certifications || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Packaging Details:</div>
                                              <div className="col-5">{product.tradeInformation?.packagingDetails || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Payment Terms:</div>
                                              <div className="col-5">{product.tradeInformation?.paymentTerms || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Main Domestic Market:</div>
                                              <div className="col-5">{product.tradeInformation?.mainDomesticMarket || "N/A"}</div>
                                            </div>
                                          </li>
                                        </ul>
                                      </div>
                                      {/* Specifications */}
                                      <div className="col-md-4">
                                        <h6 className="common-shad mt-2 mb-2 rounded-2 p-2 text-light res-color2">Specifications</h6>
                                        <ul className="res-color2 rounded-3 p-3 text-light common-shad">
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Product Type:</div>
                                              <div className="col-5">{product.specifications?.productType || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Material:</div>
                                              <div className="col-5">{product.specifications?.material || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Finish:</div>
                                              <div className="col-5">{product.specifications?.finish || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Thickness:</div>
                                              <div className="col-5">{product.specifications?.thickness || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Thickness Unit:</div>
                                              <div className="col-5">{product.specifications?.thicknessUnit || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Width:</div>
                                              <div className="col-5">{product.specifications?.width || "N/A"} {product.specifications?.widthUnit || ""}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Length:</div>
                                              <div className="col-5">{product.specifications?.length || "N/A"} {product.specifications?.lengthUnit || ""}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Weight:</div>
                                              <div className="col-5">{product.specifications?.weight || "N/A"} {product.specifications?.weightUnit || ""}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Shape:</div>
                                              <div className="col-5">{product.specifications?.shape || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Color:</div>
                                              <div className="col-5">{product.specifications?.color || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Coating:</div>
                                              <div className="col-5">{product.specifications?.coating || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Usage:</div>
                                              <div className="col-5">{product.specifications?.usage || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Origin:</div>
                                              <div className="col-5">{product.specifications?.origin || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Foldable:</div>
                                              <div className="col-5">{product.specifications?.foldable ? "Yes" : "No"}</div>
                                            </div>
                                          </li>
                                        </ul>
                                      </div>

                                      {/* Trade Shopping */}
                                      <div className="col-md-4">
                                        <h6 className="common-shad mt-2 mb-2 rounded-2 p-2 text-light res-color3">Trade Shopping</h6>
                                        <ul className="res-color3 rounded-3 p-3 text-light common-shad">
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Brand Name:</div>
                                              <div className="col-5">{product.tradeShopping?.brandName || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">GST:</div>
                                              <div className="col-5">{product.tradeShopping?.gst || "N/A"}%</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Selling Price Type:</div>
                                              <div className="col-5">{product.tradeShopping?.sellingPriceType || "N/A"}</div>
                                            </div>
                                          </li> 

                                          {product.tradeShopping?.sellingPriceType === "Fixed" && (
                                            <>
                                               <li className="text-sm bm-2">
                                                <div className="row">
                                                  <div className="col-7">Fixed Selling Price:</div>
                                                  <div className="col-5">₹{product.tradeShopping?.fixedSellingPrice || "N/A"}</div>
                                                </div>
                                              </li> 
                                            </>
                                          )}

                                          {product.tradeShopping?.sellingPriceType === "Slab Based" && (
                                            <>
                                               <li className="text-sm bm-2">
                                                <div className="row">
                                                  <div className="col-7">Slab Pricing:</div>
                                                  <div className="col-5"></div>
                                                </div>
                                              </li>
                                              {product.tradeShopping?.slabPricing?.map((slab, index) => (
                                                <li key={index} className="text-sm">
                                                  <div className="row">
                                                    <div className="col-7">{slab.minQuantity} - {slab.maxQuantity}:</div>
                                                    <div className="col-5">₹{slab.price}</div>
                                                  </div>
                                                </li>
                                              ))}
                                              
                                            </>
                                          )}

                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Unit:</div>
                                              <div className="col-5">{product.tradeShopping?.unit || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Pack Size:</div>
                                              <div className="col-5">{product.tradeShopping?.packSize || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Min Ordered Packs:</div>
                                              <div className="col-5">{product.tradeShopping?.minOrderedPacks || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Is Returnable:</div>
                                              <div className="col-5">{product.tradeShopping?.isReturnable ? "Yes" : "No"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Stock Quantity:</div>
                                              <div className="col-5">{product.tradeShopping?.stockQuantity || "N/A"}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Weight Per Unit:</div>
                                              <div className="col-5">{product.tradeShopping?.weightPerUnit || "N/A"} {product.tradeShopping?.weightUnit || ""}</div>
                                            </div>
                                          </li> 
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Shipping Type:</div>
                                              <div className="col-5">{product.tradeShopping?.shippingType || "N/A"}</div>
                                            </div>
                                          </li> 

                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Package Dimensions:</div>
                                              <div className="col-5"></div>
                                            </div>
                                          </li>
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Length:</div>
                                              <div className="col-5">{product.tradeShopping?.packageDimensions?.length || "N/A"} cm</div>
                                            </div>
                                          </li>
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Width:</div>
                                              <div className="col-5">{product.tradeShopping?.packageDimensions?.width || "N/A"} cm</div>
                                            </div>
                                          </li>
                                           <li className="text-sm bm-2">
                                            <div className="row">
                                              <div className="col-7">Height:</div>
                                              <div className="col-5">{product.tradeShopping?.packageDimensions?.height || "N/A"} cm</div>
                                            </div>
                                          </li>
                                        </ul>

                                      </div>
                                    </div>

                                    <ProductTags productId={product._id} existingTags={product.tags} />


                                  </div>

                                </Accordion.Body>
                              </Accordion.Item>
                            );

                          })}
                        </Accordion>
                      ) : (
                        <span className="text-muted">No products available</span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center">No matching users found.</td></tr>
            )}
          </tbody>


        </Table>
      )}
    </div>
  );

};

export default AllUsers;
