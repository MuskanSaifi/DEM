import React, { useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const Buyfrom = ({ product, sellerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const router = useRouter();

  const { buyer, token } = useSelector((state) => state.buyer || {});
  const user = useSelector((state) => state.user?.user);

  const toggleModal = () => {
    // If buyer or user not logged in, redirect to register page
    if (!buyer && !user) {
      router.push("/buyer/register");
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buyer?._id && !user?._id) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login or register before placing an order.",
      });
      router.push("/buyer/register");
      return;
    }

    const orderData = {
      product: product._id,
      quantity,
      unit: product.unit,
      approxOrderValue: {
        amount: product.tradeShopping?.slabPricing?.[0]?.price || product.price,
        currency: "INR",
      },
      buyer: buyer?._id || user?._id,
      requirementFrequency: "one-time",
      seller: sellerId,
    };

    try {
      const res = await fetch("/api/purchaserequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Order Submitted!",
          text: "Your order has been submitted successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        setIsOpen(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Order Failed",
          text: data?.error || "Something went wrong submitting your order.",
        });
      }
    } catch (err) {
      console.error("Order submission error:", err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Server error during order submission. Please try again.",
      });
    }
  };

  return (
    <>
      <button
        onClick={toggleModal}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
      >
        <span>🛒</span> Purchase Product
      </button>

      {isOpen && (
        <div style={modalStyles.overlay}>
          <div
            style={modalStyles.modal}
            className="p-4 rounded shadow-lg bg-white relative max-w-md mx-auto mt-24"
          >
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-3">Confirm Purchase</h2>

            <form onSubmit={handleSubmit}>
              <h3 className="font-semibold text-lg mb-2">
                Product: {product.name}
              </h3>

              <div>
                <label className="block text-gray-700 mb-3">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setQuantity("");
                    } else {
                      const parsedVal = parseInt(val, 10);
                      if (!isNaN(parsedVal)) {
                        setQuantity(parsedVal);
                      }
                    }
                  }}
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 mt-3 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full"
              >
                Submit Order
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "25px",
    marginTop: "5%",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    width: "90%",
    maxWidth: "500px",
    position: "relative",
  },
};

export default Buyfrom;
