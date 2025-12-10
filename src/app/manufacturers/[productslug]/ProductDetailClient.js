"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useParams } from "next/navigation";
import Buyfrom from "./Buyfrom";

import { useDispatch, useSelector } from "react-redux";
import {
  addProductToWishlist,
  removeProductFromWishlist,
  fetchUserWishlist,
} from "../../store/wishlistSlice";
import { FaHeart, FaRegHeart } from "react-icons/fa";

// 🔑 Helper function for masking sensitive data (e.g., GST/PAN/Aadhar)
const maskData = (data) => {
  if (!data || typeof data !== 'string' || data.length < 5) {
    return 'N/A'; // Return default for invalid or short data
  }
  const visibleLength = 4;
  // Ensure the data is treated as a string before slicing
  const dataString = String(data); 
  const maskedPart = '*'.repeat(dataString.length - visibleLength);
  const visiblePart = dataString.slice(-visibleLength);
  return `${maskedPart}${visiblePart}`; // Example: XXXXXXXXXXXXXXXX1234
};

const ProductDetailClient = ({ productslug: propProductSlug }) => {
  const params = useParams();
  const slugFromURL = params?.productslug || propProductSlug;

  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRelatedDropdown, setShowRelatedDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const { items: wishlistItems, loading: wishlistLoading } = useSelector(
    (state) => state.wishlist
  );
  const user = useSelector((state) => state.user.user);
  const buyer = useSelector((state) => state.buyer.buyer);

  // ✅ Fetch product data based on slug + auth info
  useEffect(() => {
    if (!slugFromURL) return;

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        const encodedSlug = encodeURIComponent(slugFromURL);
        const authId = user?._id || buyer?._id || buyer?.mobileNumber;
        const authParam = user?._id ? "userId" : buyer ? "buyerId" : null;

        const url = `/api/manufacturers/${encodedSlug}${
          authId && authParam ? `?${authParam}=${authId}` : ""
        }`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

        const data = await response.json();
        setProducts(data.products || []);
        setSubcategories(data.subcategories || []);
        setRelatedProducts(data.relatedProducts || []);
        setBusinessProfile(data.businessProfile || null);
      } catch (err) {
        console.error("Error fetching product:", err?.message || err);
        setError("Could not load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slugFromURL, user, buyer]); // ✅ include buyer dependency

  // ✅ Fetch wishlist on mount or login change
  useEffect(() => {
    const loggedInId = user?._id || buyer?.mobileNumber;
    const role = user ? "user" : buyer ? "buyer" : null;
    if (loggedInId && role) {
      dispatch(fetchUserWishlist({ loggedInId, role }));
    }
  }, [user, buyer, dispatch]);

  // ✅ Handle Wishlist Add/Remove
  const handleToggleWishlist = (productId) => {
    const loggedInId = user?._id || buyer?._id || buyer?.mobileNumber;
    if (!loggedInId) {
      alert("Please log in to manage your wishlist!");
      return;
    }

    const isInWishlist = wishlistItems.some(
      (item) => item._id === productId || item.productId === productId
    );

    if (isInWishlist) {
      dispatch(removeProductFromWishlist(productId));
    } else {
      dispatch(addProductToWishlist(productId));
    }
  };

  // 🔒 Mask GST Number once businessProfile is available
  const maskedGstNumber = businessProfile 
    ? maskData(businessProfile.gstNumber)
    : 'N/A';

  return (
    <div className="container mt-4 mb-5">
      {/* Breadcrumb */}
      <nav className="breadcrumb bg-light p-3 rounded text-sm">
        <Link href="/">Home</Link> / <Link href="/products">Products</Link> /{" "}
        {loading ? <Skeleton width={100} /> : <h1 className="text-sm">{slugFromURL}</h1>}
      </nav>

      {/* Mobile Dropdowns */}
      <div className="d-md-none mb-4">
        {/* Subcategories Dropdown */}
        <div className="mb-3">
          <button
            className="btn btn-sm btn-primary w-100 text-start"
            onClick={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
          >
            Subcategories
          </button>
          {showSubcategoryDropdown && (
            <ul className="list-group mt-1">
              {subcategories.length > 0 ? (
                subcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/seller/${sub?.category?.categoryslug}/${sub?.subcategoryslug}`}
                    className="text-decoration-none"
                  >
                    <li className="list-group-item">{sub.name}</li>
                  </Link>
                ))
              ) : (
                <li className="list-group-item text-muted">No subcategories.</li>
              )}
            </ul>
          )}
        </div>

        {/* Related Products Dropdown */}
        <div>
          <button
            className="btn btn-sm btn-success w-100 text-start"
            onClick={() => setShowRelatedDropdown(!showRelatedDropdown)}
          >
            Related Products
          </button>
          {showRelatedDropdown && (
            <ul className="list-group mt-1">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((prod) => (
                  <Link
                    key={prod._id}
                    href={`/manufacturers/${prod.productslug}`}
                    className="text-decoration-none"
                  >
                    <li className="list-group-item">{prod.name}</li>
                  </Link>
                ))
              ) : (
                <li className="list-group-item text-muted">No related products.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="row">
        {/* Sidebar (Subcategories) */}
        <aside className="col-md-3 mb-4 d-none d-md-block">
          <div className="bg-white p-3 rounded common-shad sticky top-20">
            <div className="mb-3 text-light global-heading rounded-2 common-shad px-4 text-center py-1 text-sm">
              Subcategories
            </div>
            {loading ? (
              <Skeleton count={5} height={20} />
            ) : subcategories.length > 0 ? (
              <ul className="list-group">
                {subcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/seller/${sub?.category?.categoryslug}/${sub?.subcategoryslug}`}
                    className="text-decoration-none"
                  >
                    <li className="list-group-item hover:bg-gray-100">{sub.name}</li>
                  </Link>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No subcategories available.</p>
            )}
          </div>
        </aside>

        {/* Main Product Section */}
        <div className="col-md-6 mb-4">
          {loading ? (
            <Skeleton height={400} />
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : products.length > 0 ? (
            products.map((product) => {
              const isInWishlist = wishlistItems.some(
                (item) => item._id === product._id || item.productId === product._id
              );

              return (
                <div
                  key={product._id}
                  className="card shadow-sm border-0 mb-3 rounded-4 overflow-hidden"
                >
                  <div className="row g-0">
                    {/* Image */}
                    <div className="col-12 col-md-4 bg-light d-flex align-items-center justify-content-center p-2 position-relative">
                      <Image
                        src={product?.images?.[0]?.url || "/placeholder.png"}
                        alt={product?.name || "Product"}
                        width={150}
                        height={150}
                        className="img-fluid rounded"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder.png";
                        }}
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

                    {/* Product Info */}
                    <div className="col-12 col-md-8 p-3">
                      <h2 className="text-primary fw-bold mb-2">{product.name}</h2>
                      <div className="d-flex flex-wrap justify-content-between mb-2">
                        <p className="mb-0">
                          <strong>Price:</strong> ₹{product.price} {product.currency || "INR"}
                        </p>
                        <p className="mb-0">
                          <strong>MOQ:</strong> {product.minimumOrderQuantity}{" "}
                          {product.moqUnit || "Number"}
                        </p>
                      </div>

                      {product.description && (
                        <p className="text-muted small mb-2">
                          {product.description.length > 120
                            ? `${product.description.slice(0, 120)}...`
                            : product.description}
                        </p>
                      )}

                      {/* Business Info */}
                      {businessProfile && (
                        <div className="border-top pt-3 mt-3 small">
                          <p className="mb-1">
                            <strong>Company Name:</strong> {businessProfile.companyName}
                          </p>
                         <p className="mb-1">
                            {/* MASKING APPLIED HERE */}
                            <strong>GST Number:</strong> {maskedGstNumber}
                          </p>
                          <p className="mb-1">
                            <strong>Year Established:</strong>{" "}
                            {businessProfile.yearOfEstablishment}
                          </p>
                        </div>
                      )}

                      {product?.tradeShopping && (
                        <div className="mb-2 small">
                          <p className="mb-0">
                            <strong>GST:</strong> {product.tradeShopping.gst}%
                          </p>
                          <p className="mb-0">
                            <strong>Selling Price Type:</strong>{" "}
                            {product.tradeShopping.sellingPriceType}
                          </p>
                          <p className="mb-0">
                            <strong>Returnable:</strong>{" "}
                            {product.tradeShopping.isReturnable ? "Yes" : "No"}
                          </p>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <Link
                          href={`/products/${product._id}`}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-500 rounded hover:bg-blue-50 transition"
                        >
                          More Details
                        </Link>
                        <Buyfrom product={product} sellerId={product?.userId} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-warning">
              This Product is not available. It may belong to a seller you have blocked.
            </p>
          )}
        </div>

        {/* Related Products */}
        <aside className="col-md-3 mb-4 d-none d-md-block">
          <div className="bg-white p-3 rounded common-shad sticky top-20">
            <div className="mb-3 text-light global-heading rounded-2 common-shad px-4 text-center py-1 text-sm">
              Related Products
            </div>
            {loading ? (
              <Skeleton count={5} height={20} />
            ) : relatedProducts.length > 0 ? (
              <ul className="list-group">
                {relatedProducts.map((prod) => (
                  <Link
                    key={prod._id}
                    href={`/manufacturers/${prod.productslug}`}
                    className="text-web text-decoration-none"
                  >
                    <li className="list-group-item hover:bg-gray-100">{prod.name}</li>
                  </Link>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No related products available.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProductDetailClient;
