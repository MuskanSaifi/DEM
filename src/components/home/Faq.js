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
      "Dial Export Mart helps businesses expand globally by offering verified leads, trusted buyers, and easy access to international markets through its B2B platform.",
  },
  {
    question: "Why should I choose Dial Export Mart over other B2B platforms in India?",
    answer:
      "Unlike many other platforms, Dial Export Mart focuses on verified connections, transparency, and a user-friendly system designed for small and medium businesses.",
  },
  {
    question: "Can small businesses use Dial Export Mart to find buyers?",
    answer:
      "Yes, small and medium businesses can easily list products and find genuine B2B buyers in India through Dial Export Mart.",
  },
  {
    question: "How can I register my business on Dial Export Mart?",
    answer:
      "To register, visit the Dial Export Mart website, click on “Become a Member,” choose your preferred pricing plan, and complete the process.",
  },
  {
    question: "Is Dial Export Mart a free B2B platform in India?",
    answer:
      "Dial Export Mart offers affordable plans and free basic listing options to help Indian exporters and manufacturers showcase their products to buyers.",
  },
  {
    question: "What industries are supported by Dial Export Mart’s B2B marketplace?",
    answer:
      "Dial Export Mart supports a wide range of industries, including apparel & fashion, electronics, agriculture, chemicals, and health & beauty etc.",
  },
  {
    question: "Does Dial Export Mart provide international B2B trade support?",
    answer:
      "Yes, Dial Export Mart facilitates import-export opportunities with global buyers to help Indian suppliers expand their presence in international B2B markets.",
  },
  {
    question: "How does Dial Export Mart ensure safe and reliable business deals?",
    answer:
      "We verify all listings, maintain a secure communication channel, and prioritize credibility and transparency in every trade to ensure reliable B2B transactions.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#e6f0ff] to-[#fcefe7] relative px-4 py-16 mt-5 mb-5">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-100 rounded-full blur-2xl opacity-40 z-0"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-100 rounded-full blur-2xl opacity-40 z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Left Content */}
      <div className="relative bg-white/90 p-10 rounded-3xl shadow-xl border border-gray-100">
  <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-snug">
    Dial Export Mart – <span className="text-indigo-600">India’s Leading B2B Marketplace</span>
  </h2>

  <p className="text-gray-700 leading-relaxed mb-4">
    Dial Export Mart is a trusted and fast-growing B2B marketplace in India
    connecting verified manufacturers, suppliers, and exporters with buyers worldwide.
  </p>

  <p className="text-gray-700 leading-relaxed mb-6">
    Our platform helps businesses discover genuine trade opportunities and
    grow internationally with confidence across multiple industries.
  </p>

  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Benefits for Exporters
  </h3>

  <ul className="space-y-3 text-gray-700">
    <li className="flex items-start gap-2">✅ Increased brand visibility in global markets</li>
    <li className="flex items-start gap-2">✅ Access to verified international buyers</li>
    <li className="flex items-start gap-2">✅ Cost-effective digital marketing for exports</li>
    <li className="flex items-start gap-2">✅ List products across multiple categories</li>
  </ul>
</div>


        {/* Right FAQ Section */}
       <div className="space-y-5 max-h-[520px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
  {allFaqs.map((faq, index) => {
    const isOpen = openIndex === index;

    return (
      <div
        key={index}
        className={`rounded-2xl border transition-all duration-300 bg-white
          ${isOpen ? "border-indigo-300 shadow-lg" : "border-gray-200 shadow-sm hover:shadow-md"}
        `}
      >
        <button
          className="w-full px-6 py-5 flex justify-between items-center text-left"
          onClick={() => toggle(index)}
        >
          <h3 className="text-base font-semibold text-gray-900 pr-4">
            {faq.question}
          </h3>

          <span
            className={`text-2xl font-bold text-indigo-600 transition-transform duration-300
              ${isOpen ? "rotate-45" : ""}
            `}
          >
            +
          </span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 px-6
            ${isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"}
          `}
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
  );
};

export default Faq;
