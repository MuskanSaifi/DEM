// src/components/ScrollToFormButton.js
"use client";

const ScrollToFormButton = () => {
  return (
    <div className="flex flex-col items-center mt-4 lg:hidden">
      <button
        onClick={() => {
          document
            .getElementById("lead-form")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="animate-bounce bg-orange-500 text-white p-3 rounded-full shadow-lg"
      >
        ↓
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Fill the form below
      </p>
    </div>
  );
};

export default ScrollToFormButton;