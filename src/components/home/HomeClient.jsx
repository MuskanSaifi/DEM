// src/components/home/HomeCLient.jsx
"use client";

import React, { Suspense, lazy } from "react";
import Bannerslider from "@/components/Bannerslider.jsx";
import BuySellform from "@/components/BuySellform";

// import IndustrySlider from "@/components/IndustrySlider";
import Cities from "@/components/Cities.jsx";
import Countries from "@/components/Countries.jsx";

import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/home/Testimonials";
import WhatWeOffer from "@/components/home/Whatweoffer";
import StatsWithImage from "@/components/home/Stats";
import ContactRating from "@/components/home/ContactRating";
import CustomChatBot from "@/components/home/CustomChatBot";
import Faq from "@/components/home/Faq";
import CategoryGridPage from "@/components/home/CategoryGridPage";

// ✅ OPTIMIZED: Lazy load heavy components below the fold
const LazyStatsWithImage = lazy(() => import("@/components/home/Stats"));
const LazyWhatWeOffer = lazy(() => import("@/components/home/Whatweoffer"));
const LazyTestimonials = lazy(() => import("@/components/home/Testimonials"));
const LazyFaq = lazy(() => import("@/components/home/Faq"));
const LazyContactRating = lazy(() => import("@/components/home/ContactRating"));

// ✅ Loading component for lazy loaded sections
const SectionLoader = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="animate-pulse text-gray-400">Loading...</div>
  </div>
);

export default function HomeClient() {
  return (
    <>
      <h1 className="hidden">Best B2B Marketplace in India for Verified Suppliers & Buyers</h1>
      
      {/* ✅ Above the fold - Load immediately */}
      <Bannerslider />
      <BuySellform />

      <div className="banner-container">
        <Link href="/all-categories">
          <Image
            className="m-auto"
            src="/assets/subbanner/banner-min.png"
            alt="Banner"
            width={2000}
            height={400}
            quality={75} // ✅ Reduced from 90 to 75 for better performance
            loading="lazy"
            priority={false}
          />
        </Link>
      </div>

      <CategoryGridPage />

      <div className="banner-container">
        <Link href="/user/register">
          <Image
            className="m-auto"
            src="/assets/subbanner/banner-min-2.png"
            alt="Register Banner"
            width={2000}
            height={400}
            quality={75} // ✅ Reduced from 90 to 75 for better performance
            loading="lazy"
            priority={false}
          />
        </Link>
      </div>
      
      <Cities />
      <Countries />

      {/* ✅ Below the fold - Lazy load for better initial page load */}
      <Suspense fallback={<SectionLoader />}>
        <LazyStatsWithImage />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <LazyWhatWeOffer />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <LazyTestimonials />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <LazyFaq />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <LazyContactRating />
      </Suspense>

      {/* ✅ ChatBot - Load after page is ready */}
      <Suspense fallback={null}>
        <div className="fixed bottom-5 right-5 z-[999]">
          <CustomChatBot />
        </div>
      </Suspense>
    </>
  );
}
