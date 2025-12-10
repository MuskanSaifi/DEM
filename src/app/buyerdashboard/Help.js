"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone, MessageSquare, HelpCircle } from "lucide-react";

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How can I contact a seller?",
      answer:
        "You can contact a seller directly from the product page using the 'Chat with Seller' or 'Send Inquiry' button. Make sure you are logged in as a buyer.",
    },
    {
      question: "How do I unblock a seller?",
      answer:
        "Go to your Buyer Dashboard → Blocked Sellers → Click on the 'Unblock' button beside the seller you want to unblock.",
    },
    {
      question: "I didn’t receive my order confirmation email. What should I do?",
      answer:
        "Please check your spam or junk folder. If the email is still missing, contact our support team using the form below.",
    },
    {
      question: "How can I report a seller?",
      answer:
        "Visit the seller’s profile or product page and click on 'Report Seller'. Fill out the form with the issue details.",
    },
    {
      question: "Can I update my registered email or phone number?",
      answer:
        "Yes. Go to your Buyer Profile → Edit Profile and update your contact information. Make sure to verify your new details.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 text-gray-800">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl p-6 shadow-lg mb-10">
        <div className="bg-white/20 p-3 rounded-full">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">Help & Support</h1>
          <p className="text-white/90 text-sm">
            Find quick answers to your questions or contact our team for help.
          </p>
        </div>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-3 text-left font-medium text-gray-800"
              >
                <span>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-purple-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="p-3 text-gray-600 bg-gray-50 rounded-b-xl border-t">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== CONTACT SUPPORT ===== */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Contact & Support</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Mail className="mx-auto w-9 h-9 text-blue-500" />,
              title: "Email Us",
              info: "support@dialexportmart.com",
            },
            {
              icon: <Phone className="mx-auto w-9 h-9 text-green-500" />,
              title: "Call Support",
              info: "+91 84486 68076",
            },
            {
              icon: <MessageSquare className="mx-auto w-9 h-9 text-purple-500" />,
              title: "Live Chat",
              info: "Available 10AM – 7PM",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md text-center p-6 transition-all hover:scale-[1.02]"
            >
              <div className="mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.info}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SUBMIT QUERY FORM ===== */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Submit a Query</h2>
        <p className="text-gray-600 mb-6">
          Can’t find what you’re looking for? Send us a message and our team will get back to you shortly.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("✅ Your query has been submitted! Our team will contact you soon.");
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Your Message</label>
            <textarea
              required
              rows="4"
              placeholder="Describe your issue or question..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium px-8 py-3 rounded-lg shadow hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Submit Query
          </button>
        </form>
      </div>
    </div>
  );
};
export default Help;
