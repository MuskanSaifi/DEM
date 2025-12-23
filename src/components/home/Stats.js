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

  // ✅ OPTIMIZED: Use Intersection Observer to start animation only when visible
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

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return; // ✅ Don't start animation until visible

    let start = 0;
    const duration = 2000;
    // ✅ OPTIMIZED: Use requestAnimationFrame instead of setInterval
    // ✅ Reduced frequency - still smooth but less CPU intensive
    const increment = end / (duration / 50);
    let animationFrameId;

    const animate = () => {
      start += increment;
      if (start >= end) {
        setCount(end);
        return;
      } else {
        setCount(Math.floor(start));
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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
    <section className="py-4 px-4 md:px-20 bg-white">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Stats Section */}
        <div className="grid grid-cols-2 gap-6 flex-1">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl p-6 text-center"
            >
              <span className="text-3xl font-bold text-purple-600 mb-2">
                <Counter end={stat.value} suffix={stat.suffix} />
              </span>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Right Image Section */}
        <div className="flex-1 relative z-10 h-full min-h-[400px]">
        <div className="relative w-full h-full"> 
<Image
  src="/assets/statban.png"
  alt="Smiling woman"
  width={1383} // Set your desired width
  height={922} // Set your desired height
  className="object-contain"
    loading="lazy"        

/>

</div>

        </div>
      </div>
    </section>
  );
};

export default StatsWithImage;
