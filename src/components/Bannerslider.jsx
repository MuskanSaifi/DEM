"use client";
import React, { useEffect, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import SidebarMenu from "./SidebarMenu";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Bannerslider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

useEffect(() => {
  let active = true;

  const CACHE_KEY = "HOME_BANNERS";
  const CACHE_TIME = "HOME_BANNERS_TIME";
  const EXPIRY = 24 * 60 * 60 * 1000;

  const fetchBanners = async () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME);

      if (cachedData && cachedTime) {
        const isValid = Date.now() - Number(cachedTime) < EXPIRY;
        if (isValid) {
          setBanners(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      const res = await fetch(
        "/api/adminprofile/banner?platform=web",
        { cache: "force-cache" }
      );

      const data = await res.json();
      if (!active) return;

      const bannerList = data?.banners || [];

      setBanners(bannerList);
      setLoading(false);

      // ✅ FIXED CACHE SAVE
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(bannerList)
      );
      localStorage.setItem(
        CACHE_TIME,
        Date.now().toString()
      );

    } catch (err) {
      console.error("Banner fetch error:", err);
      setLoading(false);
    }
  };

  fetchBanners();

  return () => {
    active = false;
  };
}, []);



  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">Loading banners...</div>
    );

  if (banners.length === 0)
    return (
      <div className="text-center py-10 text-gray-400">
        No active web banners found.
      </div>
    );

  // Handle banner click without <a> tag
  const handleBannerClick = (link) => {
    if (!link) return;
    if (link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      router.push(link);
    }
  };

  return (
    <>
      <section>
        <div className="container-fluid mt-4">
          <div className="row">
            <div className="col-md-2">
              <SidebarMenu />
            </div>

            <div className="col-md-10">
              <Carousel
                autoPlay
                infiniteLoop
                interval={6000}
                showThumbs={banners.length > 1} // ✅ Only show thumbs if multiple banners
                showStatus={false}
                stopOnHover // ✅ Stop on hover to save CPU
                swipeable={true} // ✅ Enable swipe
                emulateTouch={true} // ✅ Enable touch
                renderThumbs={() =>
                  banners.length > 1 ? banners.map((b, index) => (
                    <Image
                      key={index}
                      src={b.imageUrl}
                      alt={`thumb ${index + 1}`}
                      width={150}
                      height={70}
                      unoptimized
                      loading="lazy" // ✅ Lazy load thumbnails
                      style={{ objectFit: "cover" }}
                    />
                  )) : null
                }
              >
                {banners.map((b, index) => (
<div
  key={index}
  onClick={() => handleBannerClick(b.link)}
  className="flex justify-center w-full"
  style={{
    cursor: b.link ? "pointer" : "default",
  }}
>
<div
  className="relative w-full aspect-[1066/453] overflow-hidden"
  style={{ borderRadius: "8px" }} // optional
>
  <Image
    src={b.imageUrl}
    alt={b.title || `banner-${index + 1}`}
    fill
    unoptimized
    quality={100}
    priority={index === 0}
    sizes="100vw"
    style={{ objectFit: "cover" }}
  />
</div>

</div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .carousel .slide {
          max-height: 650px;
        }
        .carousel .thumb {
          border: 2px solid transparent;
        }
        .carousel .thumb.selected {
          border-color: rgb(0, 0, 0);
        }
      `}</style>
    </>
  );
};

export default Bannerslider;
