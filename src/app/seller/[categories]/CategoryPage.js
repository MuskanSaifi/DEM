"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Buyfrom from "./Buyfrom";
import { FaCheckCircle, FaFilter, FaMapMarkerAlt, FaUserClock } from "react-icons/fa";
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import heart icons

// Import Slider component and styles from rc-slider
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; // Don't forget to import the styles!

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { addProductToWishlist, removeProductFromWishlist, fetchUserWishlist } from '../../store/wishlistSlice'; // Adjust path if necessary

const CategoryPage = ({ categorySlug }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]); // This will store the *original* fetched products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryContent, setCategoryContent] = useState("");

  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalProducts, setTotalProducts] = useState(0);


  // State for mobile dropdowns
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false); // NEW: State for mobile filter dropdown

  // Redux hooks for wishlist
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
 const user = useSelector((state) => state.user.user);
const buyer = useSelector((state) => state.buyer.buyer);
const token = useSelector((state) => state.user.token);
const buyerToken = useSelector((state) => state.buyer.token);

  // --- NEW: Filter States ---
  const [filters, setFilters] = useState({
    minPrice: 0, // Default min price for slider
    maxPrice: 100000, // Default max price for slider (adjust based on your product data)
    minMOQ: "",
    maxMOQ: "",
    productName: "",
    // Tags filter state
    tags: {
      newArrivals: false,
      trending: false,
      upcoming: false,
      diwaliOffer: false,
      holiOffer: false,
    },
  });

  // --- Price Range Options for Dropdowns (Example) ---
  const priceOptions = [
    { label: "Min", value: 0 },
    { label: "₹100", value: 100 },
    { label: "₹500", value: 500 },
    { label: "₹1,000", value: 1000 },
    { label: "₹5,000", value: 5000 },
    { label: "₹10,000", value: 10000 },
    { label: "₹50,000", value: 50000 },
    { label: "₹1,00,000", value: 100000 },
    { label: "₹5,00,000", value: 500000 },
  ];

  // --- NEW: Debounce for product name filter ---
  const [debouncedProductName, setDebouncedProductName] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductName(filters.productName);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [filters.productName]);

 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/category-products?categorySlug=${categorySlug}&page=${page}&limit=20`
      );

      if (!response.ok) throw new Error("API fetch failed");

      const data = await response.json();

      setCategories([data.category]);
      setCategoryContent(data.category.content);
      setSubcategories(data.category.subcategories);
      setProducts(data.products);

      setTotalPages(data.totalPages);
      setTotalProducts(data.totalProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (categorySlug) fetchData();
}, [categorySlug, page]);


  const getCategoryName = () => {
    const matched = categories.find((cat) => cat.categoryslug === categorySlug);
    return matched?.name || categorySlug;
  };

  // Helper function to check if a value should be displayed
  const shouldDisplay = (value) => {
    if (value === null || typeof value === 'undefined') {
      return false;
    }
    if (typeof value === 'string' && (value.trim() === '' || value.trim().toLowerCase() === 'n/a')) {
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    return true;
  };

  // Check if a product is in the wishlist
  const isProductInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  useEffect(() => {
  if ((user && user._id) || (buyer && buyer._id)) {
    dispatch(fetchUserWishlist());
  }
}, [user, buyer, dispatch]);

// Auto scroll to top on pagination change
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}, [page]);

 const handleWishlistToggle = (product) => {
  if (!user && !buyer) {
    alert("Please log in to manage your wishlist.");
    return;
  }

  const isInWishlist = wishlistItems.some(item => item._id === product._id);
  if (isInWishlist) {
    dispatch(removeProductFromWishlist(product._id));
  } else {
    dispatch(addProductToWishlist(product));
  }
};

  // --- Handle Filter Changes for text inputs and dropdowns ---
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  }, []);

  // --- NEW: Handle Price Slider Change ---
  const handlePriceSliderChange = useCallback((value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      minPrice: value[0],
      maxPrice: value[1],
    }));
  }, []);

  // NEW: Handle Tag Filter Change
  const handleTagFilterChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      tags: {
        ...prevFilters.tags,
        [name]: checked,
      },
    }));
  }, []);

  // --- NEW: Memoized filtered products ---
  const filteredProducts = useMemo(() => {
    let currentProducts = products; // Start with the full list of products fetched from the API

    // Filter by Product Name (using debounced value)
    if (debouncedProductName) {
      const lowercasedName = debouncedProductName.toLowerCase();
      currentProducts = currentProducts.filter(product =>
        product.name.toLowerCase().includes(lowercasedName)
      );
    }

    // Filter by Price (using slider values)
    currentProducts = currentProducts.filter(product => {
      const productPrice = product.tradeShopping?.fixedSellingPrice || product.price;
      // If productPrice is not available or invalid, treat it as not matching the filter.
      // Otherwise, check if it falls within the selected min/max range.
      return shouldDisplay(productPrice) && productPrice >= filters.minPrice && productPrice <= filters.maxPrice;
    });


    // Filter by MOQ
    if (shouldDisplay(filters.minMOQ)) {
      const minM = parseFloat(filters.minMOQ);
      currentProducts = currentProducts.filter(product =>
        shouldDisplay(product.minimumOrderQuantity) && product.minimumOrderQuantity >= minM
      );
    }
    if (shouldDisplay(filters.maxMOQ)) {
      const maxM = parseFloat(filters.maxMOQ);
      currentProducts = currentProducts.filter(product =>
        shouldDisplay(product.minimumOrderQuantity) && product.minimumOrderQuantity <= maxM
      );
    }

    // Filter by Tags
    const activeTags = Object.keys(filters.tags).filter(tag => filters.tags[tag]);
    if (activeTags.length > 0) {
      currentProducts = currentProducts.filter(product => {
        // Check if the product has *any* of the selected tags set to true
        return activeTags.some(tag => product.tags?.[tag]);
      });
    }

    return currentProducts;
  }, [products, debouncedProductName, filters.minPrice, filters.maxPrice, filters.minMOQ, filters.maxMOQ, filters.tags, shouldDisplay]);


  return (
    <div className="container mt-4 mb-5">
      {/* Breadcrumb */}
      <nav className="breadcrumb bg-light p-3 rounded">
        <span className="text-secondary">Home / {getCategoryName()}</span>
      </nav>

      {/* Mobile Dropdowns for Categories and Subcategories */}
      <div className="d-md-none mb-3">
    

        {/* --- Mobile Filters Section --- */}
        <div className="mt-3">
          
<button
  className="btn btn-outline-info w-100 mb-2 d-flex justify-content-center align-items-center gap-2 py-2"
  type="button"
  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
>
  <FaFilter size={16} />
  <span>{mobileFilterOpen ? "Hide Filters" : "Show Filters"}</span>
</button>
          {mobileFilterOpen && (
            <div className="mt-2 bg-white p-3 rounded common-shad">
                  {/* Category Dropdown */}
        <div className="mb-2">
          <button
            className="btn btn-outline-primary w-100"
            type="button"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          >
            All Categories
          </button>
          {categoryDropdownOpen && (
            <div className="mt-2">
              {loading ? (
                <Skeleton count={5} height={20} />
              ) : (
                <ul className="list-group">
                  {categories.map((cat) => {
                    const isActive = cat.categoryslug === categorySlug;
                    return (
                      <Link
                        key={cat._id}
                        href={`/seller/${cat.categoryslug}`}
                        className="text-decoration-none"
                        onClick={() => setCategoryDropdownOpen(false)} // Close on click
                      >
                        <li
                          className={`list-group-item ${
                            isActive
                              ? "custom-active"
                              : "text-dark"
                          }`}
                        >
                          {cat.name}
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Subcategory Dropdown */}
        <div className="mb-3">
          <button
            className="btn btn-outline-primary w-100"
            type="button"
            onClick={() => setSubcategoryDropdownOpen(!subcategoryDropdownOpen)}
          >
            Subcategories
          </button>
          {subcategoryDropdownOpen && (
            <div className="mt-2">
              {loading ? (
                <Skeleton count={5} height={20} />
              ) : (
                <ul className="list-group">
                  {subcategories.map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/seller/${categorySlug}/${sub.subcategoryslug}`}
                      className="text-decoration-none"
                      onClick={() => setSubcategoryDropdownOpen(false)} // Close on click
                    >
                      <li className="list-group-item text-dark">{sub.name}</li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
              <div className="mb-3">
                <label htmlFor="productName" className="form-label fw-bold">Product Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="productName"
                  name="productName"
                  value={filters.productName}
                  onChange={handleFilterChange}
                  placeholder="Search by name..."
                />
              </div>

              {/* NEW: Price Range Filter for Mobile (Slider + Dropdowns) */}
              <div className="mb-4">
                <label className="form-label fw-bold">Price Range (₹)</label>
                <div className="px-2 mb-3"> {/* Add padding for the slider */}
                  <Slider
                    range
                    min={0}
                    max={filters.maxPrice} // Use the state's maxPrice, which can be dynamically set
                    defaultValue={[0, 100000]} // Initial default value
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={handlePriceSliderChange}
                    trackStyle={[{ backgroundColor: '#6f42c1' }]} // Custom color for the track
                    handleStyle={[ // Custom color for handles
                      { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
                      { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
                    ]}
                    railStyle={{ backgroundColor: '#e9ecef' }} // Custom color for the rail
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <select
                    className="form-select form-select-sm w-auto me-2"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange} // Reusing handleFilterChange for dropdown
                  >
                    {priceOptions.map(option => (
                      <option key={`min-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span>to</span>
                  <select
                    className="form-select form-select-sm w-auto ms-2"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange} // Reusing handleFilterChange for dropdown
                  >
                    {priceOptions.map(option => (
                      <option key={`max-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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

              {/* Tags Filter for Mobile */}
              <div className="mb-3">
                <label className="form-label fw-bold">Tags</label>
                <div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="newArrivalsMobile"
                      name="newArrivals"
                      checked={filters.tags.newArrivals}
                      onChange={handleTagFilterChange}
                    />
                    <label className="form-check-label" htmlFor="newArrivalsMobile">
                      New Arrivals
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="trendingMobile"
                      name="trending"
                      checked={filters.tags.trending}
                      onChange={handleTagFilterChange}
                    />
                    <label className="form-check-label" htmlFor="trendingMobile">
                      Trending
                    </label>
                  </div>
                   <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="upcomingMobile"
                      name="upcoming"
                      checked={filters.tags.upcoming}
                      onChange={handleTagFilterChange}
                    />
                    <label className="form-check-label" htmlFor="upcomingMobile">
                      Upcoming
                    </label>
                  </div>
                   <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="diwaliOfferMobile"
                      name="diwaliOffer"
                      checked={filters.tags.diwaliOffer}
                      onChange={handleTagFilterChange}
                    />
                    <label className="form-check-label" htmlFor="diwaliOfferMobile">
                      Diwali Offer
                    </label>
                  </div>
                   <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="holiOfferMobile"
                      name="holiOffer"
                      checked={filters.tags.holiOffer}
                      onChange={handleTagFilterChange}
                    />
                    <label className="form-check-label" htmlFor="holiOfferMobile">
                      Holi Offer
                    </label>
                  </div>
                  {/* Add other tags here following the same pattern */}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* --- END Mobile Filters Section --- */}
      </div>

      {/* Main Layout */}
      <div className="row mt-4">
        {/* Sidebar - Categories & Filters (Desktop Only) */}
        <aside className="col-md-3 d-none d-md-block">
        

          {/* --- Filters Section in Desktop Sidebar --- */}
          <div className="bg-white p-3 rounded common-shad mt-4 sticky top-5">
              <div >
                   <div className="mb-3 text-light global-heading rounded-2 common-shad px-4 text-center py-1 text-sm">
              Filters
            </div>
<label className="form-label fw-bold"> All Categories</label>

            {loading ? (
              <Skeleton count={5} height={20} />
            ) : (
              <ul className="list-group">
                {categories.map((cat) => {
                  const isActive = cat.categoryslug === categorySlug;
                  return (
              <Link
  key={cat._id}
  href={`/seller/${cat.categoryslug}`}
  className="text-decoration-none"
>
  <li
    className={`list-group-item ${
      isActive
        ? "custom-active"
        : "text-dark"
    }`}
  >
    {cat.name}
  </li>
</Link>
                  );
                })}
              </ul>
            )}
          </div>
            <div className="mb-3 mt-3">
              <label htmlFor="productNameDesktop" className="form-label fw-bold">Product Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="productNameDesktop"
                name="productName" // Matches the filter state key
                value={filters.productName}
                onChange={handleFilterChange}
                placeholder="Search by name..."
              />
            </div>

            {/* NEW: Price Range Filter for Desktop (Slider + Dropdowns) */}
            <div className="mb-4">
              <label className="form-label fw-bold">Price Range (₹)</label>
              <div className="px-2 mb-3"> {/* Add padding for the slider */}
                <Slider
                  range
                  min={0}
                  max={filters.maxPrice} // Use the state's maxPrice, which can be dynamically set
                  defaultValue={[0, 100000]} // Initial default value
                  value={[filters.minPrice, filters.maxPrice]}
                  onChange={handlePriceSliderChange}
                  trackStyle={[{ backgroundColor: '#6f42c1' }]} // Custom color for the track
                  handleStyle={[ // Custom color for handles
                    { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
                    { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
                  ]}
                  railStyle={{ backgroundColor: '#e9ecef' }} // Custom color for the rail
                />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <select
                  className="form-select form-select-sm w-auto me-2"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange} // Reusing handleFilterChange for dropdown
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
                  onChange={handleFilterChange} // Reusing handleFilterChange for dropdown
                >
                  {priceOptions.map(option => (
                    <option key={`max-desktop-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            <div className="mb-3">
              <label className="form-label fw-bold">MOQ Range</label>
              <div className="row g-2">
                <div className="col">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    name="minMOQ" // Matches the filter state key
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
                    name="maxMOQ" // Matches the filter state key
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
          </div>
          {/* --- END Filters Section --- */}
        </aside>

        {/* Main Product Listing Area */}
        <main className="col-md-6 common-shad rounded-2 p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="text-uppercase text-lg text-secondary">
              {getCategoryName()} Products
            </h1>
            <span className="badge text-dark text-sm">
              {loading ? <Skeleton width={30} /> :  <>Total Products: {filteredProducts.length}</>}
            </span>
          </div>

          <div className="row g-4">
            {loading ? (
              // Display skeleton loaders while loading
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-md-6">
                  <div className="card border-0 shadow-sm p-3 rounded-3">
                    <Skeleton height={180} />
                    <Skeleton count={3} />
                    <Skeleton width={100} height={20} className="mt-2" />
                  </div>
                </div>
              ))
            ) : error ? (
              <p className="text-danger text-center col-12">{error}</p>
            ) : filteredProducts.length > 0 ? (
              // Map through filtered products
              filteredProducts.map((product, index) => (
                <div key={`${product._id}-${index}`} className="col-md-6">
                  <div className="card border-0 shadow-sm p-3 rounded-3 position-relative">
                    {/* Wishlist Button */}
                    <button
                      className="btn btn-link p-0 position-absolute top-0 end-0 m-2"
                      onClick={() => handleWishlistToggle(product)}
                      title={isProductInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      disabled={loading}
                    >
                      {isProductInWishlist(product._id) ? (
                        <FaHeart size={16} className="text-danger" />
                      ) : (
                        <FaRegHeart size={16} className="text-muted" />
                      )}
                    </button>

                    <div className="position-relative text-center">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.png"}
                        alt={product.name}
                        width={180}
                        height={180}
                        className="rounded-md object-cover mx-auto block"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }}
                      />
                    </div>
                    <h2 className="mt-2 text-primary text-sm text-center">
                      {product.name}
                    </h2>
                    <p className="text-sm">
                      {product.description
                        ? product.description.split(" ").slice(0, 15).join(" ") + (product.description.split(" ").length > 15 ? "..." : "") // Shorten description
                        : "No description available."}
                    </p>
                    {/* Company Info Section */}
                    {product.businessProfile && shouldDisplay(product.businessProfile.companyName) && (
                      <div className="mb-3 pb-2 border-bottom">
                        <h3 className="fw-bold text-dark text-sm mb-2">{product.businessProfile.companyName}</h3>
                        <div className="d-flex flex-wrap align-items-center text-sm">
                          {/* Location */}
                          {(shouldDisplay(product.businessProfile.city) || shouldDisplay(product.businessProfile.state)) && (
                            <div className="d-flex align-items-center text-muted me-3 mb-1">
                              <FaMapMarkerAlt className="me-1 text-secondary" />
                              <span>
                                {product.businessProfile.city}
                                {product.businessProfile.city && product.businessProfile.state ? ", " : ""}
                                {product.businessProfile.state}
                              </span>
                            </div>
                          )}

                          {/* GST */}
                          {shouldDisplay(product.businessProfile.gstNumber) && (
                            <span className="me-3 text-success d-flex align-items-center mb-1">
                              <FaCheckCircle className="me-1" /> GST
                            </span>
                          )}

                          {/* TrustSEAL badge */}
                          {product.businessProfile.trustSealVerified && (
                            <span className="me-3 text-warning d-flex align-items-center mb-1">
                              <FaCheckCircle className="me-1" /> TrustSEAL Verified
                            </span>
                          )}

                          {/* Member Year */}
                          {shouldDisplay(product.businessProfile.yearOfEstablishment) && (
                            <span className="text-muted d-flex align-items-center mb-1">
                              <FaUserClock className="me-1" /> Member: {new Date().getFullYear() - product.businessProfile.yearOfEstablishment} yrs
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <table className="table table-sm mt-2 text-sm">
                      <tbody>
                        {shouldDisplay(product.tradeShopping?.fixedSellingPrice || product.price) && (
                          <tr>
                            <th>Price:</th>
                            <td>
                              ₹{product.tradeShopping?.fixedSellingPrice || product.price}{" "}
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
                        {shouldDisplay(product.tradeShopping?.stockQuantity) && (
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
                    {/* Assuming Buyfrom component handles product and sellerId correctly */}
                    <Buyfrom product={product} sellerId={product?.userId?._id} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-warning text-center col-12">
                No products found for this category matching your filter criteria.
              </p>
            )}
          </div>

          {/* Pagination */}
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


        {/* Subcategories Sidebar (Desktop Only) */}
        <aside className="col-md-3 d-none d-md-block">
          <div className="bg-white p-3 rounded common-shad sticky top-5">
            <div className="mb-3 text-light global-heading rounded-2 common-shad px-4 text-center py-1 text-sm">
              Subcategories
            </div>

            {loading ? (
              <Skeleton count={5} height={20} />
            ) : (
              <ul className="list-group">
                {subcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/seller/${categorySlug}/${sub.subcategoryslug}`}
                    className="text-decoration-none"
                  >
                    <li className="list-group-item text-dark">{sub.name}</li>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-4">
        {/* Category HTML Content */}
        {categoryContent && (
          <div
            className="mb-4" // Added common-shad for consistent styling
            dangerouslySetInnerHTML={{ __html: categoryContent }}
          />
        )}
      </div>
    </div>
  );
};
export default CategoryPage;