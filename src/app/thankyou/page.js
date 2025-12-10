import React from 'react';

const ThankYouPage = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl max-w-xl w-full p-10 text-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-t-3xl"></div>
        
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Thank You!</h1>
        <p className="text-gray-600 text-lg mb-6">
          We appreciate your action. You’ll hear from us soon.
        </p>
        <a
          href="/"
          className="inline-block mt-4 px-6 py-3 bg-emerald-500 text-white text-base font-semibold rounded-full shadow-md hover:bg-emerald-600 transition"
        >
          Go to Homepage
        </a>
        
        <div className="mt-10 text-sm text-gray-400">Made with ❤️ by Your Brand</div>
      </div>
    </div>
  );
};

export default ThankYouPage;
