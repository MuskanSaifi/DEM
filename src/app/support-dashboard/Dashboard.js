import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import Swal from "sweetalert2";

const Dashboard = () => {
  const [users, setUsers] = useState(null);
  const [buyers, setBuyers] = useState(null);
  const [products, setProducts] = useState(null);
  const [payments, setPayments] = useState(null); // 👈 new state
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");


  useEffect(() => {
    fetchDashboardData();
    setGreetingMessage();

    // ✅ Update time every second
    const interval = setInterval(() => {
      updateCurrentTime();
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);


  const fetchDashboardData = async () => {
    try {
      const [usersRes, buyersRes, productsRes, paymentsRes] = await Promise.all([
        axios.get(`/api/adminprofile/users`),
        axios.get(`/api/adminprofile/buyers`),
        axios.get(`/api/adminprofile/products`),
        axios.get(`/api/adminprofile/payments`),
      ]);
  
      setUsers(usersRes.data?.success ? usersRes.data.totalUsers || 0 : 0);
      setBuyers(buyersRes.data?.success ? buyersRes.data.totalBuyers || 0 : 0);
      setProducts(productsRes.data?.success ? productsRes.data.totalProducts || 0 : 0);
      setPayments(paymentsRes.data?.success ? paymentsRes.data.totalPayingUsers || 0 : 0); // 👈 set total payments
      
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      Swal.fire("Error", "Failed to fetch dashboard data", "error");
      setUsers(0);
      setBuyers(0);
      setProducts(0);
      setPayments(0); // 👈 handle failure
    } finally {
      setLoading(false);
    }
  };
  


  const setGreetingMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning, Support Team! ☀️");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon, Support Team! 🌤️");
    } else {
      setGreeting("Good Evening, Support Team! 🌙");
    }
  };


  const updateCurrentTime = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to false for 24-hour format
    });
    setCurrentTime(formattedTime);
  };

  return (
    <>
      <div className="dashboard-content mt-5 bg-light">
        <div className="container-fluid">
          <div className="row common-shad m-1">
            <div className="col-md-6 mt-5 mb-5">
              <div className="welcome-admin common-shad">
                <h1 className="fs-2 admin fw-bold">{greeting}</h1>
                <div className="row">
                  <div className="col-md-7 text-sm">
                     <h4 className="text-light text-sm mb-2">  <b>Current Time: </b> <span className="text-light">{currentTime}</span></h4>
                  <p className="fw-bold mt-4 text-light mb-3">Welcome back, Admin! Keep leading with excellence. 🚀</p>
                  <p className="fw-light text-light mb-2">Every click you make improves the user experience. Stay ahead! 🎯</p>
                  {/* <p className="fw-light text-light">A well-managed system is a step toward a thriving business. Keep optimizing! 🔥</p> */}
                  <p className="fw-light text-light">Your decisions shape the success of this platform. Keep it up! 💪</p>
                  </div>
                  <div className="col-md-5"></div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3 mt-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="resdes-card res-color3 text-light">
                    <h6>Total Users</h6>
                    <p className="fs-1">{loading ? "Loading..." : users}</p>
                    <span>Total registered users</span>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="resdes-card res-color2 text-light">
                    <h6>Total Buyers</h6>
                    <p className="fs-1">{loading ? "Loading..." : buyers}</p>
                    <span>Total registered buyers</span>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="resdes-card res-color2 text-light">
                    <h6>Total Products</h6>
                    <p className="fs-1">{loading ? "Loading..." : products}</p>
                    <span>Total products available</span>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="resdes-card res-color3 text-light">
                    <h6>Total Payments</h6>
                    <p className="fs-1">{loading ? "Loading..." : payments}</p>
                    <span>Total payments made</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
