"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

const stats = [
  { value: 50000, suffix: "+", label: "Active Verified Sellers" },
  { value: 20000, suffix: "+", label: "Products Listed Daily" },
  { value: 3000, suffix: "+", label: "Buyer Enquiries Per Day" },
  { value: 97, suffix: "%", label: "Positive Buyer-Seller Match Rate" },
];

const Counter = ({ end, suffix }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) observer.observe(counterRef.current);

    return () => {
      if (counterRef.current) observer.unobserve(counterRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 50);
    let frame;

    const animate = () => {
      start += increment;
      if (start >= end) {
        setCount(end);
        return;
      }
      setCount(Math.floor(start));
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, isVisible]);

  return (
    <span ref={counterRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const StatsWithImage = () => {
  return (
    <section className="py-6 px-3 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 md:gap-12">

        {/* ✅ Stats Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 flex-1 w-full">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="
              bg-white 
              shadow-sm md:shadow-md 
              rounded-xl md:rounded-2xl 
              p-3 md:p-6 
              text-center"
            >
              <span className="text-lg md:text-3xl font-bold text-purple-600 block">
                <Counter end={stat.value} suffix={stat.suffix} />
              </span>

              <p className="text-[10px] md:text-sm text-gray-500 leading-tight mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ Image Section */}
        <div className="flex-1 w-full relative min-h-[180px] md:min-h-[400px]">
          <Image
            src="/assets/statban.png"
            alt="Stats"
            fill
            className="object-contain"
            loading="lazy"
          />
        </div>

      </div>
    </section>
  );
};

export default StatsWithImage;