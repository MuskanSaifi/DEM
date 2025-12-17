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
    case "SET_BRAND":
      const { brand, checked } = action.payload;
      return {
        ...state,
        selectedBrands: checked
          ? [...state.selectedBrands, brand]
          : state.selectedBrands.filter((b) => b !== brand),
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
        selectedBrands: [],
        brandSearchTerm: "",
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
    selectedBrands: [],
    brandSearchTerm: "",
    tags: {
      newArrivals: false,
      trending: false,
      upcoming: false,
      diwaliOffer: false,
      holiOffer: false,
    },
    selectedContainerTypes: [],
  });

  const [allBrands, setAllBrands] = useState([]);
  const [allContainerTypes, setAllContainerTypes] = useState([]); // To store all unique container types

  // Mobile filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const decode = (str) => decodeURIComponent(str).toLowerCase();

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

    // Extract brands
    const brands = [...new Set(data.products.map(p => p.tradeShopping?.brandName).filter(Boolean))];
    setAllBrands(brands);

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

    // Brand filter
    if (filters.selectedBrands.length > 0) {
      tempProducts = tempProducts.filter((p) =>
        filters.selectedBrands.includes(p.tradeShopping?.brandName)
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


  const handleBrandChange = (e) => {
    const { value, checked } = e.target;
    dispatchFilters({ type: "SET_BRAND", payload: { brand: value, checked } });
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

  // Filtered brands for display based on search term
  const filteredBrands = allBrands.filter(brand =>
    brand.toLowerCase().includes(filters.brandSearchTerm.toLowerCase())
  );

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
          {loading ? <Skeleton width={100} /> : decode(subcategorySlug)}
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
                 {/* Subcategories (visible on desktop, also in mobile filter sidebar) */}
            <div className="mb-4">
                              <label className="form-label fw-bold">Sub Categories</label>
              {loading ? (
                <Skeleton count={5} height={20} />
              ) : (
                <ul className="list-group">
                  {subcategories.map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/seller/${categorySlug}/${sub.subcategoryslug}`}
                      className="text-decoration-none"
                      onClick={() => setShowFilterSidebar(false)} // Close sidebar on subcategory click
                    >
                      <li
                        className={`list-group-item ${
                          decode(sub.subcategoryslug) ===
                          decode(subcategorySlug)
                            ? "custom-active"
                            : "text-dark"
                        }`}
                      >
                        {sub.name}
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
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
                <h5 className="text-dark mb-3">Container Type</h5>
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

                {/* Brand Filter */}
                <h5 className="text-dark mb-3">Brand</h5>
                <div className="mb-3">
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      placeholder="Search Brand"
                      className="form-control"
                      value={filters.brandSearchTerm}
                      onChange={(e) => dispatchFilters({ type: "SET_FILTER", field: "brandSearchTerm", value: e.target.value })}
                    />
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                  </div>
                  <div className="brand-list" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '5px', borderRadius: '5px' }}>
                    {loading ? (
                      <Skeleton count={3} height={20} />
                    ) : filteredBrands.length > 0 ? (
                      filteredBrands.map((brand) => (
                        <div className="form-check" key={brand}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={brand}
                            id={`brand-${brand}`}
                            checked={filters.selectedBrands.includes(brand)}
                            onChange={handleBrandChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`brand-${brand}`}
                          >
                            {brand}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-sm">No brands matching search.</p>
                    )}
                  </div>
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="text-uppercase text-lg text-secondary">
              {loading ? <Skeleton width={200} /> : decode(subcategorySlug)}{" "}
              Products
            </h1>
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
              <p className="text-danger">{error}</p>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const isInWishlist = wishlistItems.some(
                  (item) => item._id === product._id
                );

                return (
                  <div key={`${product._id}-${index}`} className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm p-3 rounded-3">
                      <div className="position-relative text-center">
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.png"}
                          alt={product.name}
                          width={180}
                          height={180}
                          className="rounded-md object-cover mx-auto block"
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
                      <p className="text-sm">
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
                          <div className="mb-3 pb-2 border-bottom">
                            {/* <h3 className="fw-bold text-dark text-sm mb-2">
                              {product.businessProfile.companyName}
                            </h3> */}
                            <div className="d-flex flex-wrap align-items-center text-sm">
                              {/* Location */}
                              {(shouldDisplay(product.businessProfile.city) ||
                                shouldDisplay(
                                  product.businessProfile.state
                                )) && (
                                <div className="d-flex align-items-center text-muted me-3">
                                  <FaMapMarkerAlt className="me-1 text-secondary" />
                                  <span>
                                    {product.businessProfile.city}
                                    {product.businessProfile.city &&
                                    product.businessProfile.state
                                      ? ", "
                                      : ""}
                                    {product.businessProfile.state}
                                  </span>
                                </div>
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

                      <table className="table table-sm mt-2 text-sm">
                        <tbody>
                          {shouldDisplay(
                            product.tradeShopping?.fixedSellingPrice ||
                              product.price
                          ) && (
                            <tr>
                              <th>Price:</th>
                              <td>
                                ₹
                                {product.tradeShopping?.fixedSellingPrice ||
                                  product.price}{" "}
                                {product.currency || "INR"}
                              </td>
                            </tr>
                          )}
                          {shouldDisplay(product.minimumOrderQuantity) && (
                            <tr>
                              <th>MOQ:</th>
                              <td>{product.minimumOrderQuantity}</td>
                            </tr>
                          )}
                          {shouldDisplay(product.tradeShopping?.brandName) && (
                            <tr>
                              <th>Brand:</th>
                              <td>{product.tradeShopping.brandName}</td>
                            </tr>
                          )}
                          {shouldDisplay(product.tradeShopping?.unit) && (
                            <tr>
                              <th>Unit:</th>
                              <td>{product.tradeShopping.unit}</td>
                            </tr>
                          )}
                          {shouldDisplay(
                            product.tradeShopping?.stockQuantity
                          ) && (
                            <tr>
                              <th>Stock:</th>
                              <td>{product.tradeShopping.stockQuantity}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

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
  <div className="d-flex justify-content-center mt-4 gap-3">
    <button
      className="btn btn-outline-primary"
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
    >
      ◀ Previous
    </button>

    <span className="fw-bold">
      Page {page} of {totalPages}
    </span>

    <button
      className="btn btn-outline-primary"
      disabled={page === totalPages}
      onClick={() => setPage(page + 1)}
    >
      Next ▶
    </button>
  </div>
)}


        </main>

 
      </div>
    </div>
  );
};

export default SubcategoryProductPage;