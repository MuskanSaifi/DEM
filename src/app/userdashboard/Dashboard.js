import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import Swal from "sweetalert2";

const Dashboard = () => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [userdetail, setUserdetail] = useState(null);
  const [totalPayments, setTotalPayments] = useState(null);
  const [totalBuyers, setTotalBuyers] = useState(null);

  const users = 0;

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        const [profileRes, leadsRes] = await Promise.all([
          axios.get(`/api/userprofile/profile/userprofile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/userprofile/leadandwnquiry/recieveenquiry/${userId}`)
        ]);

        const userData = profileRes.data.user;
        const enquiries = leadsRes.data.data;

        setUserdetail(userData);
        setProducts(profileRes.data.productsLength);
        setTotalPayments(userData.userPackage?.length || 0);
        setTotalBuyers(enquiries.length);
        setGreetingMessage(userData?.fullname);
      } catch (error) {
        console.error("Error in dashboard fetch:", error);
        setTotalBuyers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCurrentTime();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const setGreetingMessage = (name = "User") => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting(`Good Morning, ${name}! ☀️`);
    } else if (currentHour < 18) {
      setGreeting(`Good Afternoon, ${name}! 🌤️`);
    } else {
      setGreeting(`Good Evening, ${name}! 🌙`);
    }
  };

  const updateCurrentTime = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    setCurrentTime(formattedTime);
  };

  return (
    <div className="dashboard-content mt-5">
      <div className="container-fluid">
        <div className="row common-shad m-1">
          <div className="col-md-6 mb-3 mt-4">
            <div className="welcome-admin common-shad">
              <h1 className="fs-2 admin fw-bold">{greeting}</h1>
              <div className="row">
                <div className="col-md-6 text-sm">
                  <h4 className="text-light text-sm mb-2">
                    <b>Current Time:</b> <span className="text-light">{currentTime}</span>
                  </h4>
                  <p className="fw-bold mt-4 text-light mb-3">
                    Welcome back! Explore your dashboard. 🚀
                  </p>
                  <p className="fw-light text-light mb-2">
                    Stay updated with your products, orders, and transactions. 📊
                  </p>
                  <p className="fw-light text-light">
                    Keep track of your progress and manage your business efficiently. 💼
                  </p>
                </div>
                <div className="col-md-6"></div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3 mt-4">
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="resdes-card res-color3 text-light">
                  <h6>Total Users</h6>
                  <p className="fs-1">{users}</p>
                  <span>Total registered users</span>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="resdes-card res-color2 text-light">
                  <h6>Total Buyers</h6>
                  <p className="fs-1">
                    {totalBuyers === null ? "Loading..." : totalBuyers}
                  </p>
                  <span>Total leads received</span>
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
                  <p className="fs-1">
                    {totalPayments === null ? "Loading..." : totalPayments}
                  </p>
                  <span>Total payments made</span>
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
