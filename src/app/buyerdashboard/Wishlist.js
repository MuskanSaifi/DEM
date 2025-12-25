"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserWishlist,
  removeProductFromWishlist,
} from "@/app/store/wishlistSlice";
import { useRouter } from "next/navigation";
import { FaTrash, FaHeart } from "react-icons/fa";

const Wishlist = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const { buyer, token } = useSelector((state) => state.buyer);

  // ✅ Fetch wishlist when buyer logs in or page loads
  useEffect(() => {
    if (token && buyer) {
      dispatch(fetchUserWishlist());
    }
  }, [dispatch, token, buyer]);

  // ✅ Remove product from wishlist
  const handleRemove = (productId) => {
    dispatch(removeProductFromWishlist(productId));
  };

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!buyer || !token) {
      router.push("/buyer/login");
    }
  }, [buyer, token, router]);

  // ✅ Loading or error handling
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading your wishlist...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 mt-8 text-lg font-medium">
        {error}
      </div>
    );

  // ✅ Empty wishlist
  if (!items || items.length === 0)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-gray-600">
        <FaHeart className="text-6xl text-pink-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-4">
          Add products you love to your wishlist ❤️
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Products
        </button>
      </div>
    );

  // ✅ Display wishlist products
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        My Wishlist ❤️
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <div
            key={product._id}
            className="group bg-white border rounded-2xl shadow-md hover:shadow-xl transition-all p-4 flex flex-col items-center"
          >
            <div className="relative w-full h-52 mb-4 overflow-hidden rounded-xl">
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <button
                onClick={() => handleRemove(product._id)}
                className="absolute top-3 right-3 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 p-2 rounded-full shadow transition"
                title="Remove from wishlist"
              >
                <FaTrash size={16} />
              </button>
            </div>

            <h3 className="font-semibold text-lg mb-1 text-center">
              {product.name}
            </h3>
            <p className="text-gray-500 mb-3 text-center">
              ₹{product.price?.toLocaleString("en-IN")}
            </p>
            <div className="mt-auto w-full">
              <button
                onClick={() =>
                  window.open(`/products/${product._id}`, "_blank")
                }
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                View Product
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
