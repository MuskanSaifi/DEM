import React, { useState } from "react";

const allFaqs = [
  {
    question: "Which is the best B2B marketplace in India for exporters and suppliers?",
    answer:
      "Dial Export Mart is one of the leading marketplaces in India, connecting verified exporters, suppliers, and manufacturers with global buyers.",
  },
  {
    question: "How does Dial Export Mart help in growing an import-export business?",
    answer:
      "Dial Export Mart helps businesses expand globally by offering verified leads, trusted buyers, and easy access to international markets.",
  },
  {
    question: "Why should I choose Dial Export Mart over other B2B platforms in India?",
    answer:
      "Unlike many platforms, Dial Export Mart focuses on verified connections, transparency, and ease of use.",
  },
  {
    question: "Can small businesses use Dial Export Mart?",
    answer:
      "Yes, small and medium businesses can easily list products and connect with genuine buyers.",
  },
  {
    question: "How can I register my business on Dial Export Mart?",
    answer:
      "Simply visit Dial Export Mart, click on 'Become a Member', and complete the registration process.",
  },
  {
    question: "Is Dial Export Mart a free B2B platform?",
    answer:
      "We provide free and premium plans designed for businesses at different growth stages.",
  },
  {
    question: "What industries are supported by Dial Export Mart?",
    answer:
      "We support industries like apparel, electronics, agriculture, chemicals, and health & beauty.",
  },
  {
    question: "Does Dial Export Mart provide international trade support?",
    answer:
      "Yes, we connect Indian exporters with global buyers for international trade.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* SECTION TITLE */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 mt-2">
            Everything you need to know about Dial Export Mart
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* LEFT CONTENT */}
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Dial Export Mart –{" "}
              <span className="text-indigo-600">India’s Leading B2B Marketplace</span>
            </h3>

            <p className="text-gray-700 leading-relaxed mb-4">
              Dial Export Mart connects verified manufacturers, exporters, and suppliers with buyers worldwide.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Our platform helps businesses grow globally with trust, transparency, and smart digital solutions.
            </p>

            <ul className="space-y-3 text-gray-700">
              <li>✅ Increased global brand visibility</li>
              <li>✅ Verified international buyers</li>
              <li>✅ Cost-effective marketing solutions</li>
              <li>✅ Multi-category product listings</li>
            </ul>
          </div>

          {/* FAQ ACCORDION */}
          <div className="space-y-4">
            {allFaqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`rounded-xl bg-white border transition-all duration-300
                    ${isOpen
                      ? "border-indigo-300 shadow-md"
                      : "border-gray-200 hover:shadow-sm"}
                  `}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-2 flex justify-between items-center text-left"
                  >
                    <h3 className="text-sm font-medium text-gray-800 mb-0">
                      {faq.question}
                    </h3>

                    <span
                      className={`text-xl font-bold text-indigo-600 transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`px-6 transition-all duration-300 overflow-hidden ${
                      isOpen ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Faq;
