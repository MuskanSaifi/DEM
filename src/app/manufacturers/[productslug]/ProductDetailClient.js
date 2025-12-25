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
<div className="col-md-9 mb-4">
  {loading ? (
    <div className="row">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="col-md-3 col-sm-6 mb-4">
          <Skeleton height={300} />
        </div>
      ))}
    </div>
  ) : error ? (
    <p className="text-danger">{error}</p>
  ) : products.length > 0 ? (
    <div className="row">
      {products.map((product) => {
        const isInWishlist = wishlistItems.some(
          (item) =>
            item._id === product._id || item.productId === product._id
        );

        return (
          <div
            key={product._id}
            className="col-6 col-sm-6 col-md-3 mb-4"
          >
            <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">

              {/* IMAGE */}
              <div className="position-relative bg-light p-3 text-center">
                <Image
                  src={product?.images?.[0]?.url || "/placeholder.png"}
                  alt={product?.name || "Product"}
                  width={180}
                  height={180}
                  className="img-fluid rounded"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />

                {/* Wishlist */}
                {(user || buyer) && (
                  <button
                    className={`position-absolute top-0 end-0 m-2 btn btn-sm ${
                      isInWishlist ? "text-danger" : "text-muted"
                    }`}
                    onClick={() => handleToggleWishlist(product._id)}
                    disabled={wishlistLoading}
                  >
                    {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                  </button>
                )}
              </div>

              {/* CONTENT */}
              <div className="card-body d-flex flex-column">

                <h6 className="fw-bold text-primary mb-1 text-truncate">
                  {product.name}
                </h6>

                <p className="small mb-1">
                  <strong>₹{product.price}</strong>{" "}
                  {product.currency || "INR"}
                </p>

                <p className="small text-muted mb-1">
                  MOQ: {product.minimumOrderQuantity}{" "}
                  {product.moqUnit || "Number"}
                </p>

                {product.description && (
                  <p className="small text-muted flex-grow-1">
                    {product.description.length > 70
                      ? `${product.description.slice(0, 70)}...`
                      : product.description}
                  </p>
                )}

                {/* Business Info */}
                {businessProfile && (
                  <div className="border-top pt-2 mt-2 small">
                    <p className="mb-1">
                      <strong>GST:</strong> {maskedGstNumber}
                    </p>
                    <p className="mb-0">
                      <strong>Established:</strong>{" "}
                      {businessProfile.yearOfEstablishment}
                    </p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className=" gap-2 mt-3">
                  <Link
                    href={`/products/${product._id}`}
                    className="btn   w-100 btn-outline-primary btn-sm mb-2"
                  >
                    Details
                  </Link>

                  <Buyfrom
                    product={product}
                    sellerId={product?.userId}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-warning">
      This Product is not available. It may belong to a seller you have blocked.
    </p>
  )}
</div>
      </div>
    </div>
  );
};

export default ProductDetailClient;
