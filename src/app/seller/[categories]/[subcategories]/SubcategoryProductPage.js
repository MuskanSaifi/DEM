// Dialexportmart/src/app/seller/[categories]/[subcategories]/SubcategoryProductPage.js
"use client";

import React, { useEffect, useState, useCallback, useReducer } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Buyfrom from "./Buyfrom";
import Slider from "rc-slider"; // Import the slider component
import "rc-slider/assets/index.css"; // Import slider styles

import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaUser,
  FaUserClock,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaTimes,
  FaSearch, // For brand search input
} from "react-icons/fa";

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import {
  addProductToWishlist,
  removeProductFromWishlist,
  fetchUserWishlist,
} from "../../../store/wishlistSlice";

// Filter Reducer
const filterReducer = (state, action) => {
  switch (action.type) {
    case "SET_FILTER":
      return { ...state, [action.field]: action.value };
    case "SET_TAG":
      return {
        ...state,
        tags: { ...state.tags, [action.tag]: action.value },
      };
    case "SET_CONTAINER_TYPE":
      const { type, containerChecked } = action.payload;
      return {
        ...state,
        selectedContainerTypes: containerChecked
          ? [...state.selectedContainerTypes, type]
          : state.selectedContainerTypes.filter((t) => t !== type),
      };
    case "SET_PRICE_RANGE":
      return { ...state, minPrice: action.payload[0], maxPrice: action.payload[1] };
    case "CLEAR_FILTERS":
      return {
        productName: "",
        minPrice: 0,
        maxPrice: 100000, // Default max price, adjust as per your data
        minMOQ: "",
        maxMOQ: "",
        tags: {
          newArrivals: false,
          trending: false,
          upcoming: false,
          diwaliOffer: false,
          holiOffer: false,
        },
        selectedContainerTypes: [],
      };
    default:
      return state;
  }
};

const SubcategoryProductPage = () => {
  const params = useParams();
  const categorySlug = params?.["categories"];
  const subcategorySlug = params?.["subcategories"];

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);


  // Dropdown states for mobile
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);

  // Filter states using useReducer
  const [filters, dispatchFilters] = useReducer(filterReducer, {
    productName: "",
    minPrice: 0,
    maxPrice: 100000, // Default max price, adjust based on your product data
    minMOQ: "",
    maxMOQ: "",
    tags: {
      newArrivals: false,
      trending: false,
      upcoming: false,
      diwaliOffer: false,
      holiOffer: false,
    },
    selectedContainerTypes: [],
  });

  const [allContainerTypes, setAllContainerTypes] = useState([]); // To store all unique container types

  // Mobile filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  const decode = (str) => decodeURIComponent(str).toLowerCase();
  
  // Format subcategory name for display (capitalize first letter of each word)
  const formatSubcategoryName = (slug) => {
    if (!slug) return "";
    const decoded = decodeURIComponent(slug);
    return decoded
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Redux Hooks
  const dispatch = useDispatch();
  const { items: wishlistItems, loading: wishlistLoading } = useSelector(
    (state) => state.wishlist
  );
  const user = useSelector((state) => state.user.user);
const buyer = useSelector((state) => state.buyer.buyer);
const token = useSelector((state) => state.user.token);
const buyerToken = useSelector((state) => state.buyer.token);

useEffect(() => {
  if ((user && user._id) || (buyer && buyer._id)) {
    dispatch(fetchUserWishlist());
  }
}, [user, buyer, dispatch]);

const handleToggleWishlist = (productId) => {
  if (!user && !buyer) {
    alert("Please log in to manage your wishlist!");
    return;
  }

  const isInWishlist = wishlistItems.some((item) => item._id === productId);

  if (isInWishlist) {
    dispatch(removeProductFromWishlist(productId));
  } else {
    dispatch(addProductToWishlist(productId));
  }
};

const fetchData = useCallback(async () => {
  if (!categorySlug || !subcategorySlug) return;

  try {
    setLoading(true);

    const res = await fetch(
      `/api/subcategory-products?categorySlug=${categorySlug}&subcategorySlug=${subcategorySlug}&page=${page}&limit=20`
    );

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Main results
    setProducts(data.products);
    setSubcategories(data.category.subcategories);
    setTotalPages(data.totalPages);

    // Extract container types
    const containerTypes = [...new Set(data.products.map(p => p.containerType).filter(Boolean))];
    setAllContainerTypes(containerTypes);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [categorySlug, subcategorySlug, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters whenever products or filter states change
  useEffect(() => {
    let tempProducts = [...products];

    // Product Name Search
    if (filters.productName) {
      tempProducts = tempProducts.filter((p) =>
        p.name.toLowerCase().includes(filters.productName.toLowerCase())
      );
    }

    // Price filter
    tempProducts = tempProducts.filter(
      (p) =>
        (p.tradeShopping?.fixedSellingPrice || p.price || 0) >= filters.minPrice &&
        (p.tradeShopping?.fixedSellingPrice || p.price || 0) <= filters.maxPrice
    );

    // MOQ filter
    if (filters.minMOQ !== "") {
      tempProducts = tempProducts.filter(
        (p) => p.minimumOrderQuantity >= parseFloat(filters.minMOQ)
      );
    }
    if (filters.maxMOQ !== "") {
      tempProducts = tempProducts.filter(
        (p) => p.minimumOrderQuantity <= parseFloat(filters.maxMOQ)
      );
    }

    // Tags filter
    const activeTags = Object.keys(filters.tags).filter(tag => filters.tags[tag]);
    if (activeTags.length > 0) {
        tempProducts = tempProducts.filter(p => {
            if (!p.tags || !Array.isArray(p.tags)) return false; // Ensure p.tags exists and is an array
            return activeTags.some(tag => {
                if (tag === "newArrivals") {
                    return p.isNewArrival === true;
                }
                return p.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase());
            });
        });
    }

    // Container Type filter
    if (filters.selectedContainerTypes.length > 0) {
      tempProducts = tempProducts.filter((p) =>
        filters.selectedContainerTypes.includes(p.containerType)
      );
    }

    setFilteredProducts(tempProducts);
  }, [products, filters]);

  // Handler for text/number inputs and select elements
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
    } else {
        dispatchFilters({ type: "SET_FILTER", field: name, value: value });
    }
  };

  const handlePriceSliderChange = (value) => {
    dispatchFilters({ type: "SET_PRICE_RANGE", payload: value });
  };

  const handleTagFilterChange = (e) => {
    const { name, checked } = e.target;
    dispatchFilters({ type: "SET_TAG", tag: name, value: checked });
  };

  const handleContainerTypeChange = (e) => {
    const { value, checked } = e.target;
    dispatchFilters({ type: "SET_CONTAINER_TYPE", payload: { type: value, containerChecked: checked } });
  };

  const handleClearFilters = () => {
    dispatchFilters({ type: "CLEAR_FILTERS" });
  };
  
  // Product name list (from current loaded products)
  const productNameList = React.useMemo(() => {
    const names = products
      .map((p) => p?.name)
      .filter(Boolean)
      .map((n) => String(n).trim())
      .filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const shouldDisplay = (value) => {
    if (value === null || typeof value === "undefined") {
      return false;
    }
    if (
      typeof value === "string" &&
      (value.trim() === "" || value.trim().toLowerCase() === "n/a")
    ) {
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    return true;
  };

  // Price options for dropdowns (you can make this more dynamic if needed)
  const priceOptions = [
    { value: "", label: "Select" },
    { value: 0, label: "₹0" },
    { value: 100, label: "₹100" },
    { value: 500, label: "₹500" },
    { value: 1000, label: "₹1,000" },
    { value: 5000, label: "₹5,000" },
    { value: 10000, label: "₹10,000" },
    { value: 25000, label: "₹25,000" },
    { value: 50000, label: "₹50,000" },
    { value: 100000, label: "₹1,00,000" },
    { value: 200000, label: "₹2,00,000" },
    { value: 500000, label: "₹5,00,000" },
  ];

  return (
    <div className="container mt-4 mb-5">
      {/* Breadcrumb */}
      <nav className="breadcrumb bg-light p-3 rounded">
        <Link href="/" className="text-decoration-none text-secondary">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href={`/seller/${categorySlug}`}
          className="text-decoration-none text-secondary"
        >
          {loading ? <Skeleton width={100} /> : decode(categorySlug)}
        </Link>{" "}
        /{" "}
        <span className="text-primary">
          {loading ? <Skeleton width={100} /> : error ? "Not Found" : decode(subcategorySlug)}
        </span>
      </nav>

      {/* Mobile Dropdowns and Filter Toggle */}
      <div className="d-md-none mb-3">
        {/* Filter Toggle for Mobile */}
    <button
  className="btn btn-outline-info w-100 mb-2 d-flex justify-content-center align-items-center gap-2 py-2"
  onClick={() => setShowFilterSidebar(!showFilterSidebar)}
>
  <FaFilter size={16} />
  <span>{showFilterSidebar ? "Hide Filters" : "Show Filters"}</span>
</button>

      </div>

      <div className="row">
        {/* Sidebar (Desktop) and Mobile Filter Sidebar */}
        <aside
          className={`col-md-3 ${
            showFilterSidebar ? "d-block" : "d-none d-md-block"
          }`}
        >

          <div className="bg-white p-3 rounded common-shad sticky top-5">
            
            {/* Close button for mobile filter sidebar */}
            {showFilterSidebar && (
              <div className="d-flex justify-content-end d-md-none mb-2">
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => setShowFilterSidebar(false)}
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* --- Filters Section in Desktop Sidebar --- */}
            <div className="mb-4">
              <div className="mb-3 text-light global-heading rounded-2 common-shad px-4 text-center py-1 text-sm">
                Filters
              </div>
              <div>
                {/* Product Name Search */}
                <div className="mb-3">
                  <label htmlFor="productNameDesktop" className="form-label fw-bold">Product Name</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="productNameDesktop"
                      name="productName"
                      value={filters.productName}
                      onChange={handleFilterChange}
                      placeholder="Search by name..."
                    />
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                  </div>
                </div>

                {/* Products List (scroll) */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Products</label>
                  {loading ? (
                    <Skeleton count={6} height={18} />
                  ) : productNameList.length > 0 ? (
                    <div
                      style={{
                        maxHeight: "180px",
                        overflowY: "auto",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "8px",
                        background: "#fff",
                      }}
                    >
                      {productNameList.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className={`btn btn-sm w-100 text-start mb-1 ${
                            filters.productName?.toLowerCase() ===
                            name.toLowerCase()
                              ? "btn-primary"
                              : "btn-light"
                          }`}
                          onClick={() => {
                            dispatchFilters({
                              type: "SET_FILTER",
                              field: "productName",
                              value: name,
                            });
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-sm mb-0">No products found.</p>
                  )}
                </div>

                {/* Price Range Filter for Desktop (Slider + Dropdowns) */}
                <div className="mb-4">
                  <label className="form-label fw-bold d-flex justify-content-between align-items-center">
                    Price Range (₹)
                    <button className="btn btn-link btn-sm text-decoration-none" onClick={() => dispatchFilters({ type: "SET_PRICE_RANGE", payload: [0, 100000] })}>CLEAR</button>
                  </label>
                  <div className="px-2 mb-3">
                    <Slider
                      range
                      min={0}
                      max={100000} // You can make this dynamic based on product data if needed
                      value={[filters.minPrice, filters.maxPrice]}
                      onChange={handlePriceSliderChange}
                      trackStyle={[{ backgroundColor: '#6f42c1' }]}
                      handleStyle={[
                        { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
                        { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
                      ]}
                      railStyle={{ backgroundColor: '#e9ecef' }}
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <select
                      className="form-select form-select-sm w-auto me-2"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    >
                      {priceOptions.map(option => (
                        <option key={`min-desktop-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span>to</span>
                    <select
                      className="form-select form-select-sm w-auto ms-2"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    >
                      {priceOptions.map(option => (
                        <option key={`max-desktop-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MOQ Range */}
                <div className="mb-3">
                  <label className="form-label fw-bold">MOQ Range</label>
                  <div className="row g-2">
                    <div className="col">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="minMOQ"
                        value={filters.minMOQ}
                        onChange={handleFilterChange}
                        placeholder="Min MOQ"
                        min="0"
                      />
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="maxMOQ"
                        value={filters.maxMOQ}
                        onChange={handleFilterChange}
                        placeholder="Max MOQ"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags Filter for Desktop */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Tags</label>
                  <div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="newArrivalsDesktop"
                        name="newArrivals"
                        checked={filters.tags.newArrivals}
                        onChange={handleTagFilterChange}
                      />
                      <label className="form-check-label" htmlFor="newArrivalsDesktop">
                        New Arrivals
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="trendingDesktop"
                        name="trending"
                        checked={filters.tags.trending}
                        onChange={handleTagFilterChange}
                      />
                      <label className="form-check-label" htmlFor="trendingDesktop">
                        Trending
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="upcomingDesktop"
                        name="upcoming"
                        checked={filters.tags.upcoming}
                        onChange={handleTagFilterChange}
                      />
                      <label className="form-check-label" htmlFor="upcomingDesktop">
                        Upcoming
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="diwaliOfferDesktop"
                        name="diwaliOffer"
                        checked={filters.tags.diwaliOffer}
                        onChange={handleTagFilterChange}
                      />
                      <label className="form-check-label" htmlFor="diwaliOfferDesktop">
                        Diwali Offer
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="holiOfferDesktop"
                        name="holiOffer"
                        checked={filters.tags.holiOffer}
                        onChange={handleTagFilterChange}
                      />
                      <label className="form-check-label" htmlFor="holiOfferDesktop">
                        Holi Offer
                      </label>
                    </div>
                    {/* Add other tags here following the same pattern */}
                  </div>
                </div>

                {/* Container Type Filter */}
                <p className="text-dark mb-3 font-bold">Container Type</p>
                <div className="mb-3">
                  {loading ? (
                    <Skeleton count={3} height={20} />
                  ) : allContainerTypes.length > 0 ? (
                    <>
                      {allContainerTypes.slice(0, 6).map((type) => ( // Show first 6, then "more"
                        <div className="form-check" key={type}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={type}
                            id={`container-${type}`}
                            checked={filters.selectedContainerTypes.includes(type)}
                            onChange={handleContainerTypeChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`container-${type}`}
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                      {allContainerTypes.length > 6 && (
                        <p className="text-primary mt-2 cursor-pointer" style={{ cursor: 'pointer' }}
                           onClick={() => alert('Implement "X More" functionality here.')}>
                          {allContainerTypes.length - 6} MORE
                        </p> // Placeholder for "X MORE" functionality
                      )}
                    </>
                  ) : (
                    <p className="text-muted text-sm">No container types available.</p>
                  )}
                </div>

                <button
                  className="btn btn-outline-danger w-100"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Listing */}
        <main className="col-md-9 common-shad rounded-2 p-3">
          {/* H1 Heading - Only use slug when we have valid data (no error) */}
          <h1 className="mb-3 text-primary text-sm fw-bold">
            {loading ? (
              <Skeleton width={400} />
            ) : error ? (
              "Subcategory Not Found"
            ) : (
              `${formatSubcategoryName(subcategorySlug)} Manufacturers & Suppliers in India`
            )}
          </h1>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge text-dark text-sm">
              {loading ? (
                <Skeleton width={30} />
              ) : (
                <>Total Products: {filteredProducts.length}</>
              )}
            </span>
          </div>

          <div className="row g-4">
            {loading ? (
              <Skeleton count={6} height={150} />
            ) : error ? (
              <div className="col-12 text-center py-5">
                <p className="text-danger fw-bold">{error}</p>
                <p className="text-muted mt-2">This subcategory does not exist. Please check the URL or browse our categories.</p>
                <Link href="/all-categories" className="btn btn-primary mt-3">Browse All Categories</Link>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const isInWishlist = wishlistItems.some(
                  (item) => item._id === product._id
                );
                return (
                  <div key={`${product._id}-${index}`} className="col-md-3 col-6">
<div className="card border-0 shadow-sm p-3 rounded-3 h-100 d-flex flex-column">
                      <div
  className="position-relative text-center mb-2"
  style={{ height: "170px" }}
>
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.png"}
                          alt={product.name}
                          width={180}
                          height={180}
                          className="rounded-md object-contain mx-auto h-100 w-100"
                        />
                        {/* Wishlist Icon */}
                      {(user || buyer) && (
                          <button
                            className={`btn btn-link p-0 position-absolute top-0 end-0 m-2 ${
                              isInWishlist ? "text-danger" : "text-muted"
                            }`}
                         onClick={() => handleToggleWishlist(product._id)}
    disabled={wishlistLoading}
    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
  >
    {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                          </button>
                        )}
                      </div>

                      <h2 className="mt-2 text-primary text-sm text-center">
                        {product.name}
                      </h2>
                     <p className="text-sm text-muted line-clamp-2 mb-2">
                        {product.description
                          ? product.description
                              .split(" ")
                              .slice(0, 15)
                              .join(" ") +
                            (product.description.split(" ").length > 20
                              ? "..."
                              : "")
                          : "N/A"}
                      </p>
                      {/* Company Info Section */}
                      {product.businessProfile &&
                        shouldDisplay(product.businessProfile.companyName) && (
                          <div className="mb-2 pb-1 border-bottom small">
                            {/* <h3 className="fw-bold text-dark text-sm mb-2">
                              {product.businessProfile.companyName}
                            </h3> */}
                            <div className="d-flex flex-wrap align-items-center text-sm">
                              {/* Certified badge */}
                              {product.isCertified && (
                                <span className="me-3 text-success d-flex align-items-center mb-1">
                                  <FaCheckCircle className="me-1" /> Certified
                                </span>
                              )}
                              {/* Location - H3 */}
                              {(shouldDisplay(product.businessProfile.city) ||
                                shouldDisplay(
                                  product.businessProfile.state
                                )) && (
                                <h3 className="h6 d-flex align-items-center text-muted me-3 mb-0"   style={{ fontSize: "12px" }}>
                                  <FaMapMarkerAlt className="me-1 text-secondary" />
                                  <span>
                                    {product.businessProfile.city}
                                    {product.businessProfile.city &&
                                    product.businessProfile.state
                                      ? ", "
                                      : ""}
                                    {product.businessProfile.state}
                                  </span>
                                </h3>
                              )}
                              {/* GST */}
                              {shouldDisplay(
                                product.businessProfile.gstNumber
                              ) && (
                                <span className="me-3 text-success d-flex align-items-center mb-1">
                                  <FaCheckCircle className="me-1" /> GST
                                </span>
                              )}
                              {/* TrustSEAL badge */}
                              {product.businessProfile.trustSealVerified && (
                                <span className="me-3 text-warning d-flex align-items-center mb-1">
                                  <FaCheckCircle className="me-1" /> TrustSEAL
                                  Verified
                                </span>
                              )}
                              {/* Member Year */}
                              {shouldDisplay(
                                product.businessProfile.yearOfEstablishment
                              ) && (
                                <span className="text-muted d-flex align-items-center mb-1">
                                  <FaUserClock className="me-1" /> Member:{" "}
                                  {new Date().getFullYear() -
                                    product.businessProfile
                                      .yearOfEstablishment}{" "}
                                  yrs
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="mt-2 text-sm">
                        {shouldDisplay(
                          product.tradeShopping?.fixedSellingPrice ||
                            product.price
                        ) && (
                          <div className="mb-1 text-muted">
                            <span className="fw-normal">Price:</span> ₹
                            {product.tradeShopping?.fixedSellingPrice ||
                              product.price}{" "}
                            {product.currency || "INR"}
                          </div>
                        )}
                        {shouldDisplay(product.minimumOrderQuantity) && (
                          <div className="mb-1 text-muted">
                            <span className="fw-normal">MOQ:</span> {product.minimumOrderQuantity}
                          </div>
                        )}
                        {/* {shouldDisplay(product.tradeShopping?.brandName) && (
                          <div className="mb-1 text-muted">
                            <span className="fw-normal">Brand:</span> {product.tradeShopping.brandName}
                          </div>
                        )} */}
                        {shouldDisplay(product.tradeShopping?.unit) && (
                          <div className="mb-1 text-muted">
                            <span className="fw-normal">Unit:</span> {product.tradeShopping.unit}
                          </div>
                        )}
                        {shouldDisplay(
                          product.tradeShopping?.stockQuantity
                        ) && (
                          <div className="mb-1 text-muted">
                            <span className="fw-normal">Stock:</span> {product.tradeShopping.stockQuantity}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/products/${product._id}`}
                        className="btn btn-outline-primary btn-sm mt-2 w-100"
                      >
                        More details
                      </Link>
                      <Buyfrom product={product} sellerId={product?.userId} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-warning text-center">
                No products found matching your filters.
              </p>
            )}
          </div>
          {!loading && totalPages > 1 && (
  <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
    <button
      className="btn btn-outline-primary rounded px-3 py-2 d-flex align-items-center gap-1"
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
    >
      <span aria-hidden>‹</span> Prev
    </button>
    {(() => {
      const show = 5;
      let start = Math.max(1, page - Math.floor(show / 2));
      let end = Math.min(totalPages, start + show - 1);
      if (end - start + 1 < show) start = Math.max(1, end - show + 1);
      const pages = [];
      for (let i = start; i <= end; i++) pages.push(i);
      return pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`btn rounded px-3 py-2 ${p === page ? "btn-primary text-white" : "btn-outline-primary"}`}
        >
          {p}
        </button>
      ));
    })()}
    <button
      className="btn btn-outline-primary rounded px-3 py-2 d-flex align-items-center gap-1"
      disabled={page === totalPages}
      onClick={() => setPage(page + 1)}
    >
      Next <span aria-hidden>›</span>
    </button>
  </div>
)}

          {/* Subcategories (moved from left filters to right side, below products) */}
          <div className="mt-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2 className="h6 fw-bold text-dark mb-0">Other Categories</h2>
              <Link
                href={`/seller/${categorySlug}`}
                className="small text-decoration-none"
              >
                View category
              </Link>
            </div>

            {loading ? (
              <Skeleton count={2} height={28} />
            ) : error ? null : subcategories?.length ? (
              <div className="d-flex flex-wrap gap-2">
                {subcategories.map((sub) => {
                  const isActive =
                    decode(sub.subcategoryslug) === decode(subcategorySlug);
                  return (
                    <Link
                      key={sub._id}
                      href={`/seller/${categorySlug}/${sub.subcategoryslug}`}
                      className={`btn btn-sm ${
                        isActive ? "btn-primary" : "btn-outline-primary"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted small mb-0">No subcategories found.</p>
            )}
          </div>

          {/* SEO Content Section - Only show when valid subcategory (no error) */}
          {!loading && !error && subcategorySlug && (
            <div className="mt-5 mb-4">
              <p className="text-muted mb-3">
                <strong>{formatSubcategoryName(subcategorySlug)}</strong> are widely used across various industries and applications. India has a strong network of manufacturers and suppliers offering <strong>{formatSubcategoryName(subcategorySlug)}</strong> in different designs, materials, and price ranges.
              </p>
              <p className="text-muted mb-3">
                On Dial Export Mart, buyers can explore verified <strong>{formatSubcategoryName(subcategorySlug)}</strong> manufacturers, suppliers, and exporters from different parts of India. The platform provides access to suppliers offering quality products, bulk order availability, and the best pricing to help businesses identify suitable sellers based on their specific requirements.
              </p>
              <p className="text-muted mb-4">
                Whether you are a wholesaler, retailer, distributor, or international buyer, you can find multiple <strong>{formatSubcategoryName(subcategorySlug)}</strong> suppliers catering to different business needs and order volumes.
              </p>

              {/* Sub Heading - Manufacturing in India */}
              <h2 className="h4 fw-bold mb-3 text-secondary">
                {formatSubcategoryName(subcategorySlug)} Manufacturing in India
              </h2>
              <p className="text-muted mb-3">
                India is renowned for its robust manufacturing infrastructure and skilled workforce across various industries. <strong>{formatSubcategoryName(subcategorySlug)}</strong> manufacturers in India offer a wide range based on market demand and industry standards.
              </p>
              <p className="text-muted mb-4">
                Many suppliers follow standard quality practices and support both domestic distribution and export requirements, making India a reliable market for <strong>{formatSubcategoryName(subcategorySlug)}</strong> manufacturing and supply.
              </p>

              {/* Why Choose Dial Export Mart */}
              <h2 className="h4 fw-bold mb-3 text-secondary">
                Why Choose Dial Export Mart
              </h2>
              <ul className="text-muted mb-4" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                <li className="mb-2">Verified <strong>{formatSubcategoryName(subcategorySlug)}</strong> manufacturers and suppliers</li>
                <li className="mb-2">Availability of bulk and wholesale suppliers</li>
                <li className="mb-2">Multiple sellers for easy comparison</li>
                <li className="mb-2">Direct communication between buyers and sellers</li>
                <li className="mb-2">Transparent and reliable B2B interactions</li>
              </ul>
            </div>
          )}

          {/* FAQ Section - Only show when valid subcategory (no error) */}
          {!loading && !error && subcategorySlug && (
            <div className="mt-5 mb-4">
              <h2 className="h3 fw-bold mb-4 text-primary">
                Frequently Asked Questions - {formatSubcategoryName(subcategorySlug)}
              </h2>
              <div className="faq-container">
                <div className="border rounded mb-3">
                  <button
                    className="w-100 text-start p-3 bg-light border-0 d-flex justify-content-between align-items-center"
                    onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  >
                    <strong>Where can I find verified {formatSubcategoryName(subcategorySlug)} manufacturers in India?</strong>
                    <span>{openFaq === 1 ? "−" : "+"}</span>
                  </button>
                  {openFaq === 1 && (
                    <div className="p-3 border-top">
                      Dial Export Mart connects buyers with verified and trusted {formatSubcategoryName(subcategorySlug)} manufacturers across India.
                    </div>
                  )}
                </div>

                <div className="border rounded mb-3">
                  <button
                    className="w-100 text-start p-3 bg-light border-0 d-flex justify-content-between align-items-center"
                    onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  >
                    <strong>Can I buy {formatSubcategoryName(subcategorySlug)} in bulk or wholesale?</strong>
                    <span>{openFaq === 2 ? "−" : "+"}</span>
                  </button>
                  {openFaq === 2 && (
                    <div className="p-3 border-top">
                      Yes, multiple {formatSubcategoryName(subcategorySlug)} suppliers on Dial Export Mart offer bulk and wholesale supply options.
                    </div>
                  )}
                </div>

                <div className="border rounded mb-3">
                  <button
                    className="w-100 text-start p-3 bg-light border-0 d-flex justify-content-between align-items-center"
                    onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  >
                    <strong>Does Dial Export Mart support exporters and international buyers?</strong>
                    <span>{openFaq === 3 ? "−" : "+"}</span>
                  </button>
                  {openFaq === 3 && (
                    <div className="p-3 border-top">
                      Yes, international buyers can directly connect with Indian {formatSubcategoryName(subcategorySlug)} exporters on the platform.
                    </div>
                  )}
                </div>

                <div className="border rounded mb-3">
                  <button
                    className="w-100 text-start p-3 bg-light border-0 d-flex justify-content-between align-items-center"
                    onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                  >
                    <strong>Is Dial Export Mart suitable for long-term business sourcing?</strong>
                    <span>{openFaq === 4 ? "−" : "+"}</span>
                  </button>
                  {openFaq === 4 && (
                    <div className="p-3 border-top">
                      Yes, the platform is designed for reliable, transparent, and long-term B2B trade.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

 
      </div>
    </div>
  );
};

export default SubcategoryProductPage;