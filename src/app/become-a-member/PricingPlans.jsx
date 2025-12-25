"use client";
import React, { useState, useEffect } from "react";
import "./PricingPlans.css";
import { FaCheckCircle, FaTimesCircle, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";

const PricingPlans = () => {
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const router = useRouter();

  // ✅ Dynamic state
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 For payment modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [expandedSections, setExpandedSections] = useState({});

  // ✅ Fetch from MongoDB API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/adminprofile/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // ✅ Expand/Collapse features
  const handleToggle = (planTitle, sectionTitle) => {
    const key = `${planTitle}-${sectionTitle}`;
    setExpandedSections((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  // ✅ Payment handling
  const handlePayNowClick = (plan) => {
    if (!user) {
      router.push("/user/login");
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleFixedAmount = () => {
    const numericAmount = parseFloat(selectedPlan.price) * 1.18;
    const queryParams = new URLSearchParams({
      amount: numericAmount,
      packageName: selectedPlan.title,
      totalAmount: numericAmount,
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
      totalAmount: customAmount,
    }).toString();

    router.push(`/payment/initiate?${queryParams}`);
  };

  // ✅ Render features dynamically
  const renderFeatures = (plan, sectionTitle, features = []) => {
    const isExpanded = expandedSections[`${plan.title}-${sectionTitle}`];
    return (
      <div className="accordion-item">
        <button
          className="accordion-header"
          onClick={() => handleToggle(plan.title, sectionTitle)}
        >
          {sectionTitle}
          {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
        </button>
        {isExpanded && (
          <ul className="accordion-content">
            {features.map((feature, idx) => {
              // Handles both [{text,included}] and [["text",true]] formats
              const text = Array.isArray(feature) ? feature[0] : feature.text;
              const included = Array.isArray(feature)
                ? feature[1]
                : feature.included;

              return (
                <li key={idx} className="text-ssm flex items-center gap-2">
                  {included ? (
                    <FaCheckCircle color="#04BA00" />
                  ) : (
                    <FaTimesCircle color="#F34234" />
                  )}
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  // ✅ Loading / Empty states
  if (loading) return <p className="text-center mt-10">Loading plans...</p>;
  if (!plans.length)
    return <p className="text-center mt-10 text-gray-500">No plans found</p>;

  // ✅ Main UI
  return (
    <>
      {/* Banner */}
      <div className="text-center">
        <Image
          src="/assets/pagesbanner/packages.png"
          alt="Membership Banner"
          layout="responsive"
          width={1425}
          height={486}
          className="rounded w-full object-cover"
          priority
        />
      </div>

      {/* Pricing Cards */}
      <section className="pricing-section rounded-4 mt-5">
        <h1 className="title">
          Pricing and <span>Plan</span>
        </h1>

        <div className="pricing-cards">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`card ${plan.highlighted ? "highlight" : ""}`}
            >
              {plan.highlighted && (
                <div className="ribbon shadow">
                  <span className="d-block">Popular</span> Choice
                </div>
              )}

              <h2
                className={`py-2 shadow pricing-titlt rounded-2 ${
                  plan.highlighted ? "title-highlight" : "title-normal"
                }`}
              >
                {plan.title}
              </h2>

              {/* Dynamic sections */}
              {renderFeatures(plan, "Top Service", plan.topService)}
              {renderFeatures(plan, "Website Packages", plan.website)}
              {renderFeatures(
                plan,
                "SEO (Search Engine Optimization)",
                plan.seo
              )}
              {renderFeatures(
                plan,
                "SMO (Social Media Optimization)",
                plan.smo
              )}

              <h3>₹ {Number(plan.price).toLocaleString("en-IN")}</h3>
              <p className="gst">+ 18% GST Per Year</p>

              <button
                className="shadow"
                onClick={() => handlePayNowClick(plan)}
              >
                Pay Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 💳 Payment Modal */}
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
    </>
  );
};

export default PricingPlans;
