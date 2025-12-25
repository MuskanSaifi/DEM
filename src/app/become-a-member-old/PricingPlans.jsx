"use client";
import React, { useEffect, useState } from 'react';
import './PricingPlans.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import plans from './PlansData';
import Image from "next/image";

const PricingPlans = () => {
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    if (!token) return;
    userdata();
  }, [token]);

  const userdata = async () => {
    // Your async logic here
  };

  const handlePayNowClick = (plan) => {
    if (!user) {
      router.push("/user/login");
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleFixedAmount = () => {
    const numericAmount= parseFloat(selectedPlan.price) * 1.18;
    const queryParams = new URLSearchParams({
      amount: numericAmount,
      packageName: selectedPlan.title,
      totalAmount: numericAmount
    }).toString();
  
    router.push(`/payment/initiate?${queryParams}`);
  };
  

  const handleProceedCustom = () => {
    if (!customAmount || isNaN(customAmount) || Number(customAmount) < 1) {
      alert("Please enter a valid amount");
      return;
    }
  
    const queryParams = new URLSearchParams({
      amount: customAmount,
      packageName: selectedPlan.title,
      totalAmount: customAmount
    }).toString();
  
    router.push(`/payment/initiate?${queryParams}`);
  };
  

  return (
    <>
      <div className="text-center">
   <Image
  src="/assets/pagesbanner/Become-a-Member.png"
  alt="Blog Banner"
  layout="responsive"
  width={1425}
  height={486}
  className="rounded w-full object-cover"
  priority
/>

      </div>

      <section className="pricing-section rounded-4 mt-5 ">
        <h1 className="title">Pricing and <span>Plan</span></h1>
        <div className="pricing-cards">
          {plans.map((plan, index) => (
            <div key={index} className={`card ${plan.highlighted ? 'highlight' : ''}`}>
              {plan.highlighted && <div className="ribbon shadow"><span className='d-block'>Popular</span> Choice</div>}
              <h2 className={`py-2 shadow rounded-2 ${plan.highlighted ? 'title-highlight' : 'title-normal'}`}>
                {plan.title}
              </h2>
              <ul>
                {plan.features.map(([text, included], idx) => (
                  <li key={idx} className='text-ssm'>
                    {included ? (
                      <FaCheckCircle className="check" color="#04BA00" />
                    ) : (
                      <FaTimesCircle className="cross" color="#F34234" />
                    )}
                    {text}
                  </li>
                ))}
              </ul>
              <h3>₹ {Number(plan.price).toLocaleString('en-IN')}</h3>
              <p className="gst">+ 18% GST Per Year</p>

              <button className="shadow" onClick={() => handlePayNowClick(plan)}>
                Pay Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {showModal && selectedPlan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
        onClick={() => {
          setShowModal(false);
          setShowCustomInput(false);
          setCustomAmount("");
        }}
      >
        ×
      </button>

      <h4 className="text-lg font-semibold text-center mb-5">
        Select Payment Option for <b>{selectedPlan.title}</b>
      </h4>

      {!showCustomInput ? (
        <div className="flex flex-col gap-3">
          <button
            className="bg-green-600 text-white rounded-xl py-2 hover:bg-green-700 transition"
            onClick={handleFixedAmount}
          >
            Full Amount
          </button>
          <button
            className="border border-blue-500 text-blue-500 rounded-xl py-2 hover:bg-blue-50 transition"
            onClick={() => setShowCustomInput(true)}
          >
            Custom Amount
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="number"
            className="form-control border rounded-lg px-3 py-2"
            placeholder="Enter custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition"
            onClick={handleProceedCustom}
          >
            Proceed to Pay ₹{customAmount || ""}
          </button>
        </div>
      )}
    </div>
  </div>
)}


      {/* Modal CSS */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.4);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-box {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          text-align: center;
          width: 90%;
          max-width: 400px;
          position: relative;
        }
        .modal-buttons {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
        }
        .modal-close {
          background: transparent;
          border: none;
          font-size: 24px;
          position: absolute;
          top: 10px;
          right: 20px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default PricingPlans;
