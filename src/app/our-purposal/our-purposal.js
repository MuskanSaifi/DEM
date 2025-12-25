"use client"; // Keep this directive at the very top of the file

import React, { useState } from "react";
import Image from "next/image";


const services = [
  {
    title: "Website Development & Design",
    price: "₹1,20,000",
    image: "/assets/services/web-dev.png", // Placeholder for website development image/icon
    shortDescription: "Crafting visually stunning, highly functional, and SEO-optimized websites tailored to your business needs.",
    longDescription: "Our comprehensive website development and design service goes beyond aesthetics, focusing on creating a robust online presence. We ensure your site is not just beautiful but also highly performant, secure, and designed to convert visitors into customers. From initial concept to deployment and ongoing support, we handle every aspect.",
    features: [
      "Strategic Planning & Wireframing",
      "Interactive UI/UX Prototyping",
      "Custom Frontend Development (React, Next.js, etc.)",
      "Robust Backend Development (Node.js, Python, etc.)",
      "Database Design & Integration",
      "API Development & Integration",
      "E-commerce Functionality (Product Management, Shopping Cart, Checkout)",
      "CRM Integration (HubSpot, Salesforce, etc.)",
      "Advanced Security Features (SSL, DDoS Protection)",
      "Performance Optimization (Load Speed, Image Optimization)",
      "Cross-browser & Device Compatibility Testing",
      "Accessibility Standards Compliance (WCAG)",
      "Comprehensive Training & Documentation",
      "Post-Launch Support & Maintenance Packages"
    ],
    benefits: [
      "Establishes strong credibility and trust",
      "Provides 24/7 global business presence",
      "Automates lead generation and sales processes",
      "Offers superior user experience on any device",
      "Scales with your business growth",
      "Drives organic traffic and improves search rankings",
      "Enhances customer engagement and loyalty",
      "Reduces operational costs through automation",
      "Gives a competitive edge in your market",
      "Provides measurable insights with integrated analytics"
    ],
    includes: [
      "Custom UI/UX Design",
      "Responsive Design",
      "Domain & Hosting Setup",
      "Frontend & Backend Development",
      "CMS Integration",
      "Lead Forms & Payment Gateway",
      "SEO-Ready Structure",
      "Google Analytics Setup"
    ],
  },
  {
    title: "Digital Marketing Services",
    price: "₹90,000",
    image: "/assets/services/digital-marketing.png", // Placeholder for digital marketing image/icon
    shortDescription: "Driving targeted traffic, generating leads, and maximizing your online ROI through strategic digital campaigns.",
    longDescription: "Our digital marketing services are designed to put your brand in front of the right audience at the right time. We combine data-driven strategies with creative execution across various channels to achieve your business objectives, whether it's brand awareness, lead generation, or direct sales.",
    features: [
      "Keyword Research & Strategy",
      "On-page SEO Optimization (Content, Meta Tags, Images)",
      "Off-page SEO (Link Building, Outreach)",
      "Technical SEO Audits & Implementation",
      "Local SEO Optimization (Google My Business)",
      "Google Ads Campaign Management (Search, Display, Shopping, Video)",
      "Social Media Paid Campaigns (Facebook, Instagram, LinkedIn, etc.)",
      "Email Marketing Automation & Campaign Design",
      "Content Marketing Strategy & Creation (Blogs, Articles, Infographics)",
      "Conversion Rate Optimization (CRO) A/B Testing",
      "Website Analytics & Reporting (Google Analytics 4)",
      "Competitor Analysis & Market Research",
      "Reputation Management"
    ],
    benefits: [
      "Achieve higher search engine rankings",
      "Generate qualified leads consistently",
      "Maximize your return on ad spend (ROAS)",
      "Build stronger brand recognition online",
      "Engage directly with your target audience",
      "Gain actionable insights from data",
      "Stay ahead of competitors",
      "Expand your market reach globally",
      "Improve customer lifetime value",
      "Cost-effective alternative to traditional marketing"
    ],
    includes: [
      "Search Engine Optimization (SEO)",
      "Google Ads (PPC)",
      "Email Marketing",
      "Landing Page Optimization"
    ],
  },
  {
    title: "Social Media Management",
    price: "₹90,000",
    image: "/assets/services/social-media.png", // Placeholder for social media image/icon
    shortDescription: "Building and nurturing your community, enhancing brand presence, and driving engagement across social platforms.",
    longDescription: "Our social media management service crafts compelling narratives and engaging content to connect with your audience where they spend most of their time. We manage your presence across all relevant platforms, fostering community, increasing brand loyalty, and driving measurable results.",
    features: [
      "Social Media Audit & Strategy Development",
      "Profile Setup & Optimization (Facebook, Instagram, LinkedIn, X, YouTube, Pinterest)",
      "Daily Content Calendar Creation",
      "High-Quality Custom Graphics & Video Content (Posts, Stories, Reels)",
      "Engaging Caption Writing & Hashtag Research",
      "Community Management & Audience Engagement (Comments, DMs)",
      "Social Media Ad Campaign Setup & Optimization",
      "Influencer Collaboration Management",
      "Performance Tracking & Analytics Reporting",
      "Crisis Management & Online Reputation Monitoring",
      "Competitor Social Media Analysis",
      "Regular Strategy Review Meetings"
    ],
    benefits: [
      "Significantly boosts brand visibility and recognition",
      "Fosters a loyal and engaged community",
      "Increases website traffic and lead generation",
      "Provides direct communication channel with customers",
      "Enables real-time customer feedback",
      "Cost-effective marketing channel",
      "Enhances brand storytelling and personality",
      "Drives viral reach and word-of-mouth marketing",
      "Provides valuable market insights",
      "Saves your team time and resources"
    ],
    includes: [
      "Profile Setup & Optimization",
      "Custom Posts & Reels",
      "Paid Ad Campaigns",
      "Hashtag Strategy",
      "Community Engagement"
    ],
  },
];

// Reusable Modal Component
const ServiceDetailModal = ({ isOpen, onClose, service }) => {
  if (!isOpen || !service) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-3xl font-bold text-gray-900">{service.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-4xl font-light leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="md:flex md:space-x-8">
          {/* Left Column: Image, Price, Short & Long Description */}
          <div className="md:w-1/3 flex flex-col items-center text-center">
            <Image
              src={service.image}
              alt={`${service.title} icon`}
              width={120}
              height={120}
              className="rounded-full object-cover mb-4 shadow-lg border border-gray-100"
            />
            <p className="mb-4">
              <span className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-xl font-extrabold shadow-md">
                {service.price}
              </span>
            </p>
            <p className="text-gray-600 italic mb-4">{service.shortDescription}</p>
            <p className="text-gray-700 text-base leading-relaxed mb-6">
              {service.longDescription}
            </p>
          </div>

          {/* Right Column: Features & Benefits */}
          <div className="md:w-2/3">
            {/* Features */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                <svg className="w-6 h-6 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Key Features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-base text-gray-700">
                {service.features.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                <svg className="w-6 h-6 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                Why Choose Us? (Benefits)
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-base text-gray-700">
                {service.benefits.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const Catalogue = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const openModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-96 flex items-center justify-center overflow-hidden">
        <Image
          src={"/assets/pagesbanner/Proposal.png"}
          alt="Digital Catalogue Banner"
          layout="fill"
          objectFit="cover"
          className="z-0"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-10 p-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center leading-tight mb-4 animate-fadeInUp">
            Our <span className="text-teal-400">Digital Services Catalogue</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 text-center max-w-2xl animate-fadeInUp delay-200">
            Explore our premium digital services to empower your business for global growth.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out border border-gray-100 p-6 flex flex-col"
            >
              <div className="flex items-center justify-center mb-6">
                <Image
                  src={service.image}
                  alt={`${service.title} icon`}
                  width={80}
                  height={80}
                  className="rounded-full object-cover shadow-lg"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
                {service.title}
              </h2>
              <p className="text-center mb-6">
                <span className="inline-block bg-teal-100 text-teal-700 px-5 py-2 rounded-full text-xl font-extrabold shadow-md">
                  {service.price}
                </span>
              </p>

              {/* Short description for card preview */}
              <p className="text-gray-600 text-center mb-4 text-sm flex-grow">
                {service.shortDescription}
              </p>

              <div className="mt-auto"> {/* Push button to the bottom */}
                <button
                  onClick={() => openModal(service)}
                  className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition-colors duration-300 font-semibold shadow-md"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Growth Package - Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white text-center p-8 md:p-12 rounded-3xl shadow-xl mt-16 animate-fadeInUp delay-400">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Unlock Your Full Potential with Our <br />
            <span className="text-yellow-300">Complete Growth Package</span>
          </h2>
          <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto">
            This all-in-one package includes **Website Development**, **Digital Marketing**, and **Social Media Management**.
            It's ideal for SMEs ready to grow online, attract quality leads, and strengthen their global brand presence.
          </p>
          <span className="inline-block bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-full text-2xl font-bold transition-colors duration-300 shadow-lg">
            ₹3,00,000
          </span>
          <button className="block mx-auto mt-6 bg-yellow-400 text-gray-900 hover:bg-yellow-500 px-10 py-4 rounded-full text-xl font-bold transition-all duration-300 shadow-lg transform hover:scale-105">
            Get Started Today!
          </button>
        </div>
      </div>

      {/* Modal Component */}
      <ServiceDetailModal isOpen={isModalOpen} onClose={closeModal} service={selectedService} />
    </>
  );
};

export default Catalogue;