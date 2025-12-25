"use client";

import React, { useState } from "react";

const WhatWeDo = () => {
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Company Analysis",
      description:
        "Our dedicated team will conduct a comprehensive study of your company's current market position and operations.",
    },
    {
      id: 2,
      title: "Guidance on Improvement",
      description:
        "We provide guidance on optimizing product packaging, refining services, and enhancing client handling strategies to elevate your business.",
    },
    {
      id: 3,
      title: "Requirement Documentation",
      description:
        "Our team meticulously documents your specific requirements to tailor our approach to your unique needs.",
    },
    {
      id: 4,
      title: "Buyer Identification",
      description:
        "We leverage our expertise to identify the most suitable buyers for your firm, ensuring alignment with your company's terms and conditions.",
    },
    {
      id: 5,
      title: "Facilitated Communication",
      description:
        "We coordinate a suitable time for both parties to connect, providing support and guidance during the discussion.",
    },
    {
      id: 6,
      title: "Negotiation Support",
      description:
        "The supplier and buyer engage in discussions while our product experts facilitate and guide the process.",
    },
    {
      id: 7,
      title: "Deal Progression",
      description:
        "Once both parties agree to proceed, we move forward to finalize the deal, ensuring adherence to mutually agreed terms.",
    },
    {
      id: 8,
      title: "Deal Closure",
      description:
        "After the successful completion of the deal, we seek feedback to further refine our services and ensure satisfaction.",
    },
  ];

  return (
    <section className="py-12 mt-5 mb-5 bg-gray-50">
      <div className="container mx-auto px-5">
        <h1 className="title">   How We <span>Work</span></h1>

        <p className="mb-5 text-sm">
          At Dial Export Mart, we prioritize a thorough and personalized approach to ensure the success of your business in the market. Here's how our process works:
        </p>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`relative p-6 border rounded-lg shadow-md transition-all duration-300 ${
                activeStep === step.id
                  ? "bg-[#E9E6F7] border-[#6D4AAF]"
                  : "bg-white hover:shadow-lg"
              }`}
              onMouseEnter={() => setActiveStep(step.id)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <div
                className={`absolute -top-4 -left-4 h-12 w-12 flex items-center justify-center rounded-full text-white font-bold ${
                  activeStep === step.id
                    ? "bg-[#6D4AAF]"
                    : "bg-gray-300"
                }`}
              >
                {step.id}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

    <div className="mt-5">
    <p className="text-sm">Dial Export Mart is dedicated to fostering a workplace culture that nurtures humility, creativity, and independence among our workforce. We firmly believe in the transformative power of collaboration and creativity to empower our small and medium business customers, turning their aspirations into reality.</p>
      <p className="text-sm">As a part of We Export Trade Mart, our commitment to service excellence is unwavering. In today's market, clients often receive numerous calls from various companies for inquiries and buy leads. However, what sets us apart is our focus on facilitating direct deals. We understand the prevailing challenges, and that's why Dial Export Mart is designed to provide instant deals through our platform, complete with a sophisticated video conference call facility.</p>
      <p className="text-sm">This unique feature not only aids suppliers in understanding the specific requirements of buyers but also cultivates trust in the business relationship. Drawing from our extensive market experience, we've identified a crucial need: suppliers, manufacturers, and traders desire confirmed business deals. At Dial Export Mart, we are not just a platform; we are your partner in achieving tangible and confirmed success in the market.</p>
      
    </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
