import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, Badge, Button } from "react-bootstrap";
import Link from "next/link";

const Dashboard = () => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [userdetail, setUserdetail] = useState(null);
  const [totalPayments, setTotalPayments] = useState(null);
  const [totalBuyers, setTotalBuyers] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
        const [profileRes, leadsRes, notificationsRes] = await Promise.all([
          axios.get(`/api/userprofile/profile/userprofile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/userprofile/leadandwnquiry/recieveenquiry/${userId}`),
          axios.get(`/api/userprofile/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { success: false, notifications: [], unreadCount: 0 } }))
        ]);

        const userData = profileRes.data.user;
        const enquiries = leadsRes.data.data;

        setUserdetail(userData);
        setProducts(profileRes.data.productsLength);
        setTotalPayments(userData.userPackage?.length || 0);
        setTotalBuyers(enquiries.length);
        setGreetingMessage(userData?.fullname);

        // Set notifications if API call was successful
        if (notificationsRes.data.success) {
          setNotifications(notificationsRes.data.notifications || []);
          setUnreadCount(notificationsRes.data.unreadCount || 0);
        }
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

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/userprofile/notifications`,
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/userprofile/notifications`,
        { markAllAsRead: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="dashboard-content mt-5">
      <div className="container-fluid">
        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <Card className="border-warning">
                <Card.Header className="d-flex justify-content-between align-items-center bg-warning text-dark">
                  <h5 className="mb-0">
                    ⚠️ Important Notifications
                    {unreadCount > 0 && (
                      <Badge bg="danger" className="ms-2">{unreadCount}</Badge>
                    )}
                  </h5>
                  {unreadCount > 0 && (
                    <Button variant="outline-dark" size="sm" onClick={markAllAsRead}>
                      Mark All as Read
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <div className="list-group">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification._id}
                        className={`list-group-item ${!notification.isRead ? "bg-warning bg-opacity-10 border-warning" : ""}`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-2 fw-bold">
                              {notification.type === "warning" && "⚠️ "}
                              {notification.title}
                            </h6>
                            <div className="mb-2 p-2 bg-light rounded" style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                              <strong className="text-dark">{notification.message}</strong>
                            </div>
                            {notification.productId && (
                              <Link
                                href={`/userdashboard?activeTab=My Product`}
                                className="btn btn-sm btn-primary mt-2"
                                onClick={() => markNotificationAsRead(notification._id)}
                              >
                                Update Product Now
                              </Link>
                            )}
                            <small className="text-muted d-block mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </small>
                          </div>
                          {!notification.isRead && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-muted"
                              onClick={() => markNotificationAsRead(notification._id)}
                              title="Mark as read"
                            >
                              ✓
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {notifications.length > 5 && (
                    <div className="text-center mt-3">
                      <Link href="/userdashboard?activeTab=My Product" className="btn btn-sm btn-outline-primary">
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

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
