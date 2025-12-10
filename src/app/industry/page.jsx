"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const IndustryPage = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoryResponse = await fetch("/api/adminprofile/category", { cache: "no-store" });
        if (!categoryResponse.ok) throw new Error("Failed to fetch categories");

        const categories = await categoryResponse.json();

        // Fetch subcategories
        const subcategoryResponse = await fetch("/api/adminprofile/subcategory", { cache: "no-store" });
        if (!subcategoryResponse.ok) throw new Error("Failed to fetch subcategories");

        const subcategories = await subcategoryResponse.json();

        // Convert subcategory list into a map for quick lookup
        const subcategoryMap = subcategories.reduce((acc, sub) => {
          acc[sub._id] = {
            id: sub._id,
            name: sub.name,
            productsCount: sub.products.length || 0,
          };
          return acc;
        }, {});

        // Attach full subcategory details to categories
        const formattedIndustries = categories.map((category) => ({
          id: category._id,
          name: category.name,
          slug:category.categoryslug,
          icon: category.icon || "/default-icon.png",
          subcategories: category.subcategories
            .map((subId) => subcategoryMap[subId])
            .filter(Boolean), // Remove undefined values
        }));

        setIndustries(formattedIndustries);
      } catch (err) {
        console.error("Error fetching industries:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  return (
    <>
    <div className="container mt-5 mb-5">
  

<div className="text-center">
<h1 className="text-3xl font-bold text-gray-800">
      Top<span className="text-[#6D4AAF]">  B2B Industries in India</span>
          </h1>
      <p className="text-muted  mx-auto text-sm">
      India is a rapidly growing hub for B2B trade, with a wide array of industries driving its dynamic economy. At Dial Export Mart, we bring together the top B2B industries under one roof, helping businesses across sectors connect, collaborate, and expand in both domestic and global markets.
      </p>
</div>
    {/* CTA Section */}
    <div className="cta-box text-center mb-4">
      
      <h2>Want to Sell?</h2>
      <p className="fs-5">
        List your <strong>products</strong> and reach millions of <strong>buyers</strong> through Dial Export Mart!
        </p>
       <button  className="cta-btn">
       <Link className="text-purple" href={"/user/register"}> List your Company Free</Link>
        </button>
    </div>

    {/* Section Heading */}
    <div className="text-center mb-5">
     
      <p className="text-muted  mx-auto text-sm">
      Whether you're a buyer searching for reliable suppliers or a seller looking to scale operations, Dial Export Mart is your trusted B2B Marketplace in India for discovering the most in-demand industries in India.</p>
    </div>

    {/* Industry Grid */}
    <div className="row g-4">
      {loading ? (
        [...Array(6)].map((_, index) => (
          <div key={index} className="col-md-4">
            <Skeleton height={150} />
          </div>
        ))
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : industries.length > 0 ? (
        industries.map((industry) => (
          <div key={industry.id} className="col-md-6 col-lg-4">
            <div className="card industry-card p-4 border-0">
              <div className="d-flex align-items-center mb-3">
                <Image
                  src={industry.icon}
                  alt={industry.name}
                  width={50}
                  height={50}
                  className="industry-icon"
                />
                <h5 className="industry-title m-0">{industry.name}</h5>
              </div>
              <ul className="industry-sublist list-unstyled mb-3">
                {industry.subcategories.slice(0, 4).map((sub) => (
                  <li key={sub.id}>
                    {sub.name} ({sub.productsCount} products)
                  </li>
                ))}
              </ul>
              <Link
                href={`/seller/${encodeURIComponent(industry.slug)}`}
                className="industry-link"
              >
                View More →
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No industries available.</p>
      )}
    </div>
  </div>
    {/* Internal CSS */}
    <style jsx>{`
      .cta-box {
        background: linear-gradient(to right, #dc3545, #ff6f61);
        color: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }

      .cta-box h2 {
        font-weight: 700;
      }

      .cta-btn {
        background: white;
        color: #dc3545;
        font-weight: 600;
        border: none;
        padding: 12px 32px;
        border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
        .cta-btn:hover{
        font-weight: bold;
        }

      .industry-card {
        border-radius: 16px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        height: 100%;
        position: relative;
      }

      .industry-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }

      .industry-icon {
        border-radius: 50%;
        background: #f1f1f1;
        padding: 10px;
        margin-right: 15px;
      }

      .industry-title {
        font-weight: 600;
        color: #333;
      }

      .industry-link {
        font-weight: 600;
        color: #0d6efd;
        text-decoration: none;
      }

      .industry-link:hover {
        text-decoration: underline;
      }

      .industry-sublist {
        font-size: 14px;
        color: #555;
        padding-left: 18px;
      }
    `}</style>
    </>
  );
};

export default IndustryPage;
