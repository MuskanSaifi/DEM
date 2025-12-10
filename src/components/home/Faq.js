import React, { useState } from "react";
import Image from "next/image";

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
  const [searchTerm, setSearchTerm] = useState("");

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = searchTerm
    ? allFaqs.filter((faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allFaqs.slice(0, 10); // Show top 10 by default

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#e6f0ff] to-[#fcefe7] relative px-4 py-16 mt-5 mb-5">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse z-0"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Frequently Asked <br /> Questions
          </h2>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search question here"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* FAQ List with max height */}
       <div className="space-y-4 overflow-y-auto pr-2 max-h-[470px]">

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
              <div
  key={index}
  className="bg-white border border-gray-100 rounded-xl shadow hover:shadow-lg hover:border-indigo-300 transition duration-300"
>
  <button
    className="w-full px-5 py-4 text-left flex justify-between items-center text-gray-800 font-medium"
    onClick={() => toggle(index)}
  >
    {faq.question}
    <span className="text-2xl text-indigo-500">
      {openIndex === index ? "−" : "+"}
    </span>
  </button>
  {openIndex === index && (
    <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
      {faq.answer}
    </div>
  )}
</div>

              ))
            ) : (
              <p className="text-gray-500">No matching FAQs found.</p>
            )}
          </div>
        </div>

        {/* Right Illustration */}
   <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
  <Image
    src="/assets/faq.png"
    alt="FAQ Illustration"
    fill
    className="object-contain md:object-cover"
      loading="lazy"        

  />
</div>

      </div>
    </div>
  );
};

export default Faq;
