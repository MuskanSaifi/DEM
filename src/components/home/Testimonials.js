import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { FaQuoteLeft } from 'react-icons/fa'
import Image from 'next/image'; 

const testimonials = [
  {
    name: "Parotosh Chauhan",
    title: "Manufacturer",
    content: "This service exceeded our expectations. The team was, and delivered outstanding results!",
    image: "/assets/testimonials/paritosh.jpeg",
  },
  {
    name: "Jane Smith",
    title: "Founder, GreenLeaf",
    content: "Working with them was a great experience. They really understood our needs and helped us grow.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Himanshu Pal",
    title: "CTO, DevSolutions",
    content: "Fantastic support and communication. Highly recommend them for any web-related projects!",
    image: "/assets/testimonials/himanshu.jpg",
  },
  {
    name: "Ravi Mehra",
    title: "Owner, Mehra Handicrafts",
    content: "Dial Export provided outstanding support to my small business and played a crucial role in helping me establish a strong market presence.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Anjali Desai",
    title: "Entrepreneur",
    content: "I was genuinely surprised by the highly positive results I achieved by making a relatively small investment with Dial Export. It delivered beyond expectations.",
    image: "https://randomuser.me/api/portraits/women/50.jpg",
  },
  {
    name: "Pankaj Yadav",
    title: "Founder, Yadav Traders",
    content: "A big thanks to Dial Export for relieving me of all the stress involved in business setup and market entry. Their team handled everything with professionalism.",
    image: "https://randomuser.me/api/portraits/men/60.jpg",
  },
  {
    name: "Nikita Sharma",
    title: "Startup Owner",
    content: "When I had just launched my business, I discovered Dial Export. From building my website to closing key deals, they gave my startup a professional edge right from the start.",
    image: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    name: "Raj Malhotra",
    title: "Managing Director, GlobalKart",
    content: "The team at Dial Export is consistently responsive, helpful, and professional. I highly recommend them to any business seeking dependable B2B support.",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    name: "Sneha Kapoor",
    title: "Business Consultant",
    content: "They provide top-notch services across India, and their 24/7 support has helped me maintain a healthy work-life balance.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Imran Sheikh",
    title: "Export Manager",
    content: "I’m extremely grateful to Dial Export for helping me expand my business internationally. Their network and support made global outreach possible.",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
  },
  {
    name: "Meera Joshi",
    title: "Buyer, RetailMart",
    content: "As a buyer, I can confidently say that Dial Export has made my job significantly easier. Their process is smooth, efficient, and reliable.",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
  {
    name: "Vikram Saini",
    title: "Founder, Saini Ventures",
    content: "Dial Export supported me when I had nearly lost hope in my business. Their involvement played a major role in turning things around and fueling growth.",
    image: "https://randomuser.me/api/portraits/men/21.jpg",
  },
  {
    name: "Divya Arora",
    title: "Director, Arora Creations",
    content: "Connecting with Dial Export was a game-changer. The response has been so overwhelming that I’m struggling to fulfill the volume of incoming orders.",
    image: "https://randomuser.me/api/portraits/women/42.jpg",
  },
];


const Testimonials = () => {
  return (
   <section>
     <div className="bg-gradient-to-r from-indigo-100 to-purple-100 py-16 px-4 md:px-20">
      <h2 className="text-4xl font-bold text-center mb-12 text-purple-800">What Our Clients Say</h2>
      <Swiper
        spaceBetween={30}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
            320: {
              slidesPerView: 1, // Mobile Portrait
            },
            576: {
              slidesPerView: 1.5, // Small Phones landscape or slightly wider screens
            },
            768: {
              slidesPerView: 2, // Tablets
            },
            992: {
              slidesPerView: 3, // Small desktops
            },
            1200: {
              slidesPerView: 4, // Medium desktops
            },
            1600: {
              slidesPerView: 5, // Large screens
            },
          }}
          
        modules={[Autoplay, Pagination]}
        className="max-w-8xl mx-auto"
      >
        {testimonials.map((testimonial, index) => (
    <SwiperSlide key={index}>
    <div className="bg-white shadow-md rounded-3xl p-8 sm:p-10 text-center transition-all duration-500 hover:shadow-purple-400 mb-5 ">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-5">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="rounded-full border-4 border-purple-300 shadow-lg object-cover"
          />
        </div>
        <FaQuoteLeft className="text-purple-400 text-3xl mb-4" />
        <p className="text-lg sm:text-xl text-gray-700 italic mb-6 max-w-xl">
          "{testimonial.content}"
        </p>
        <h3 className="text-2xl font-semibold text-purple-700">{testimonial.name}</h3>
        <p className="text-sm text-gray-500">{testimonial.title}</p>
      </div>
    </div>
  </SwiperSlide>
        ))}
      </Swiper>
    </div>
   </section>
  )
}

export default Testimonials
