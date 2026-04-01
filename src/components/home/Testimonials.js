import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FaQuoteLeft } from "react-icons/fa";
import Image from "next/image";

const testimonials = [
  {
    name: "Ramesh Patel",
    title: "Spices Manufacturer",
    content:
      "We listed our spices and masala products on Dial Export Mart and started receiving genuine bulk inquiries from serious buyers. The platform helped us expand our wholesale network and reach new markets.",
    image: "/assets/testimonials/1.png",
    alt: "Dial Export Mart Client Review - Spices Manufacturer Ramesh Patel India",
  },
  {
    name: "Pooja Agarwal",
    title: "Kurtis Supplier",
    content:
      "Dial Export Mart helped us connect with garment wholesalers easily. Our product visibility improved, and we received consistent inquiries from verified buyers.",
    image: "/assets/testimonials/2.png",
    alt: "Dial Export Mart Client Review - Kurtis Supplier Pooja Agarwal India",
  },
  {
    name: "Sunita Verma",
    title: "Saree Buyer",
    content:
      "I purchased sarees for my retail store through Dial Export Mart. The product quality and fabric were excellent. I am now a regular buyer on this platform.",
    image: "/assets/testimonials/3.png",
    alt: "Dial Export Mart Client Review - Saree Buyer Sunita Verma India",
  },
  {
    name: "Imran Khan",
    title: "Non Woven Bags Manufacturer",
    content:
      "This platform helped us promote our non woven bags to bulk packaging buyers. We received inquiries from multiple locations, which supported our business growth.",
    image: "/assets/testimonials/4.png",
    alt: "Dial Export Mart Client Review - Non Woven Bags Manufacturer Imran Khan India",
  },
  {
    name: "Ajay Singh",
    title: "Rice Supplier",
    content:
      "After listing our rice products, we started receiving direct inquiries from bulk buyers and distributors. Dial Export Mart is a useful platform for wholesale suppliers.",
    image: "/assets/testimonials/5.png",
    alt: "Dial Export Mart Client Review - Rice Supplier Ajay Singh India",
  },
  {
    name: "Farhan Ali",
    title: "Wooden Handicraft Manufacturer",
    content:
      "We listed our wooden handicraft products and connected with buyers from different regions. The platform improved our product visibility and inquiry quality.",
    image: "/assets/testimonials/6.png",
    alt: "Dial Export Mart Client Review - Wooden Handicraft Manufacturer Farhan Ali India",
  },
  {
    name: "Neelam Joshi",
    title: "Home Decor Buyer",
    content:
      "I found reliable manufacturers for home decor products easily. Supplier profiles were detailed, which made sourcing faster and more confident.",
    image: "/assets/testimonials/7.png",
    alt: "Dial Export Mart Client Review - Home Decor Buyer Neelam Joshi India",
  },
  {
    name: "Karan Mehta",
    title: "Hoodie Manufacturer",
    content:
      "After listing our hoodies, we started receiving genuine bulk inquiries. Managing inquiries and connecting with buyers is simple and efficient.",
    image: "/assets/testimonials/8.png",
    alt: "Dial Export Mart Client Review - Hoodie Manufacturer Karan Mehta India",
  },
];



const Testimonials = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-14">
        <div className="text-2xl font-bold text-gray-800 mt-2">
            What Our Clients Say
          </div>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Trusted by businesses across India for quality, reliability, and growth.
          </p>
        </div>

        <Swiper
          spaceBetween={30}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1400: { slidesPerView: 4 },
          }}
          modules={[Autoplay, Pagination]}
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="group h-full bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-purple-300">
                
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-purple-200 text-5xl">
                  <FaQuoteLeft />
                </div>

                {/* Image */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-r from-purple-400 to-indigo-500">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 text-center italic leading-relaxed mb-6">
                  “{item.content}”
                </p>

                <div className="text-center">
                  <strong className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </strong>
                  <p className="text-sm text-purple-600">{item.title}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
