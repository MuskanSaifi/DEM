// src/components/WishList.js
"use client";

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaTrash } from 'react-icons/fa'; // Import an icon for remove, or stick with ❌

import {
  fetchUserWishlist,
  removeProductFromWishlist,
  clearWishlist
} from '../app/store/wishlistSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchUserWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [dispatch, user]);

  // Define a Skeleton Card component for reusability and cleaner rendering
  const SkeletonWishlistCard = () => (
    <div className="col-12 mb-3"> {/* Use col-12 for full width on mobile skeleton */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
        <div className="row g-0 h-100">
          <div className="col-4 bg-light d-flex align-items-center justify-content-center p-2">
            <Skeleton circle={true} width={80} height={80} />
          </div>
          <div className="col-8 p-3 d-flex flex-column justify-content-between">
            <div>
              <h5 className="card-title mb-2">
                <Skeleton width="90%" />
              </h5>
              <p className="mb-1 small">
                <Skeleton width="70%" />
              </p>
              <p className="mb-1 small">
                <Skeleton width="60%" />
              </p>
            </div>
            <div className="d-flex justify-content-end align-items-center mt-2">
              <Skeleton width={100} height={30} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Card Component for each Wishlist Item
  const WishlistMobileCard = ({ product }) => (
    <div className="col-12 mb-3">
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="d-flex align-items-center p-3">
          <Image
            src={product?.images?.[0]?.url || "/placeholder.png"}
            alt={product?.name || "Product"}
            width={80}
            height={80}
            className="rounded me-3"
            style={{ objectFit: 'cover' }} // Ensure image covers its area
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }}
          />
          <div className="flex-grow-1">
            <h5 className="mb-1 fw-bold text-primary">{product.name}</h5>
            <p className="mb-1 text-muted small">
              Price: ₹{product.price} {product.currency || "INR"}
            </p>
            <p className="mb-1 text-muted small">
              MOQ: {product.minimumOrderQuantity} {product.moqUnit}
            </p>
            <p className="mb-1 small">
              Status:{" "}
              {product?.tradeShopping?.stockQuantity > 0 ? (
                <span className="text-success">In stock</span>
              ) : (
                <span className="text-danger">Out of stock</span>
              )}
            </p>
             <p className="mb-1 small text-muted">
                Added: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button
            className="btn btn-link text-danger p-0 ms-2"
            onClick={() => dispatch(removeProductFromWishlist(product._id))}
            title="Remove from Wishlist"
            disabled={loading}
          >
            <FaTrash size={24} color="#dc3545" />
          </button>
        </div>
        <div className="card-footer bg-transparent border-top d-flex justify-content-center py-2">
          <Link href={`/products/${product._id}`} className="btn btn-outline-primary btn-sm w-75">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  // Render loading state with Skeletons
  if (loading) {
    return (
      <div className="container mt-4 mb-5">
        <h1 className="text-center mb-4">My Wishlist</h1>
        <div className="row">
          {[...Array(3)].map((_, index) => (
            <SkeletonWishlistCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error, Not Logged In, Empty Wishlist remain as is
  if (error) {
    return (
      <div className="container mt-5 text-center text-danger">
        <p>Error loading wishlist: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <h2>Wishlist</h2>
        <p className="lead">Please <Link href="/login">log in</Link> to view and manage your wishlist.</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h2>Your Wishlist is Empty</h2>
        <p className="lead">Start adding products you love!</p>
        <Link href="/" className="btn btn-primary mt-3">Browse Products</Link>
      </div>
    );
  }

  // Actual Wishlist Items
  return (
    <div className="container mt-4 mb-5">
      <h1 className="text-center mb-4">My Wishlist</h1>

      {/* Desktop Table View */}
      <div className="d-none d-md-block table-responsive">
        <table className="table table-bordered align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Added</th>
              <th>Remove Product</th>
            </tr>
          </thead>
          <tbody>
            {wishlistItems.map((product) => (
              <tr key={product._id}>
           

                {/* Product Name and Image */}
                <td className="text-start">
                  <div className="d-flex align-items-center gap-3">
                    <Image
                      src={product?.images?.[0]?.url || "/placeholder.png"}
                      alt={product?.name || "Product"}
                      width={60}
                      height={60}
                      className="rounded"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }}
                    />
                    <div>
                      <Link href={`/manufacturers/${product.productslug}`} className="fw-bold text-decoration-none text-primary">
                        {product.name}
                      </Link>
                      <div className="small text-muted">
                        MOQ: {product.minimumOrderQuantity} {product.moqUnit}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td>₹{product.price} {product.currency || "INR"}</td>

                {/* Stock Status */}
                <td>
                  {product?.tradeShopping?.stockQuantity > 0 ? (
                    <span className="text-success small">✔ In stock</span>
                  ) : (
                    <span className="text-danger small">❌ Out of stock</span>
                  )}
                </td>

                {/* Date Added */}
                <td>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>

                     {/* Remove Button */}
                <td>
                  <button
                    className="btn btn-link text-danger p-0"
                    onClick={() => dispatch(removeProductFromWishlist(product._id))}
                    title="Remove"
                    disabled={loading}
                  >
                    <FaTrash size={24} color="#dc3545" />

                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="d-md-none row row-cols-1 g-3">
        {wishlistItems.map((product) => (
          <WishlistMobileCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export { WishlistPage };