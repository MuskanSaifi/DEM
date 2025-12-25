import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import Swal from "sweetalert2";
import { FaUsers, FaUserTie, FaShoppingBag, FaMoneyBillWave } from "react-icons/fa";

const Dashboard = () => {
  const [users, setUsers] = useState(null);
  const [buyers, setBuyers] = useState(null);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    fetchDashboardData();
    setGreetingMessage();
    const interval = setInterval(() => updateCurrentTime(), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, buyersRes, productsRes] = await Promise.all([
        axios.get(`/api/adminprofile/users/count`), // ✅ Use dedicated count API
        axios.get(`/api/adminprofile/buyers`),
        axios.get(`/api/adminprofile/products`),
      ]);

      setUsers(usersRes.data?.success ? usersRes.data.totalUsers || 0 : 0);
      setBuyers(buyersRes.data?.success ? buyersRes.data.totalBuyers || 0 : 0);
      setProducts(
        productsRes.data?.success ? productsRes.data.totalProducts || 0 : 0
      );
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      Swal.fire("Error", "Failed to fetch dashboard data", "error");
      setUsers(0);
      setBuyers(0);
      setProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning, Admin ☀️");
    else if (hour < 18) setGreeting("Good Afternoon, Admin 🌤️");
    else setGreeting("Good Evening, Admin 🌙");
  };

  const updateCurrentTime = () => {
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  };

  return (
    <div className="dashboard-content mt-4 bg-light">
      <div className="container-fluid">
        <div className="row g-4 p-3">
          {/* Greeting Section */}
          <div className="col-md-6">
            <div className="welcome-admin modern-card shadow-lg">
              <h1 className="fw-bold text-light">{greeting}</h1>
              <h5 className="mt-2 text-light">
                ⏰ Current Time: <span className="fw-semibold">{currentTime}</span>
              </h5>
              <p className="text-light mt-4 fw-light">
                Welcome back, Admin! Keep leading with excellence. Every decision
                you make shapes the platform’s success 🚀
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="col-md-6">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="resdes-card gradient-blue text-light animate-card">
                  <FaUsers className="dash-icon" />
                  <h6>Total Sellers</h6>
                  <p className="fs-1">{loading ? "..." : users}</p>
                  <span>Registered Sellers</span>
                </div>
              </div>

              <div className="col-md-6">
                <div className="resdes-card gradient-green text-light animate-card">
                  <FaUserTie className="dash-icon" />
                  <h6>Total Buyers</h6>
                  <p className="fs-1">{loading ? "..." : buyers}</p>
                  <span>Registered Buyers</span>
                </div>
              </div>

              <div className="col-md-6">
                <div className="resdes-card gradient-orange text-light animate-card">
                  <FaShoppingBag className="dash-icon" />
                  <h6>Total Products</h6>
                  <p className="fs-1">{loading ? "..." : products}</p>
                  <span>Available Products</span>
                </div>
              </div>

              <div className="col-md-6">
                <div className="resdes-card gradient-pink text-light animate-card">
                  <FaMoneyBillWave className="dash-icon" />
                  <h6>Total Payments</h6>
                  <p className="fs-1">0</p>
                  <span>Payments Made</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Dashboard;
