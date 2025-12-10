"use client";

import React from "react";
import Bannerslider from "@/components/Bannerslider.jsx";
import BuySellform from "@/components/BuySellform";
// import ProductSections1 from "@/components/ProductSections1";
// import ProductSections2 from "@/components/ProductSections2";
import IndustrySlider from "@/components/IndustrySlider";
import Cities from "@/components/Cities.jsx";
import Countries from "@/components/Countries.jsx";

import CountryList from "@/components/CountryList";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/home/Testimonials";
import WhatWeOffer from "@/components/home/Whatweoffer";
import StatsWithImage from "@/components/home/Stats";
import ContactRating from "@/components/home/ContactRating";
import CustomChatBot from "@/components/home/CustomChatBot";
import Faq from "@/components/home/Faq";
import CategoryGridPage from "@/components/home/CategoryGridPage";

export default function HomeClient() {
  return (
    <>
      <h1 className="hidden">Dial Export Mart | Best B2B Marketplace in India</h1>
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
            quality={90}
            loading="lazy"
          />
        </Link>
      </div>

      <IndustrySlider />

      {/* <ProductSections1 tag="trending" Name="Trending" /> */}

      <div className="banner-container">
        <Link href="/user/register">
          <Image
            className="m-auto"
            src="/assets/subbanner/banner-min-2.png"
            alt="Register Banner"
            width={2000}
            height={400}
            quality={90}
            loading="lazy"
          />
        </Link>
      </div>

      <CategoryGridPage />
      {/* <ProductSections2 tag="upcoming" Name="Upcoming" /> */}

      <Cities />
      <Countries />
      {/* <ProductSections1 tag="diwaliOffer" Name="Featured Products" /> */}
      {/* <ProductSections1 tag="holiOffer" Name="Products You May Like" /> */}

      <CountryList />
      <StatsWithImage />
      <WhatWeOffer />
      <Testimonials />
      <Faq />
      <ContactRating />

      <div className="fixed bottom-5 right-5 z-[999]">
        <CustomChatBot />
      </div>
    </>
  );
}
