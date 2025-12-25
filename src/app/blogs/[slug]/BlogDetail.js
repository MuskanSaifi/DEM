// components/BlogDetail.js
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { format } from "date-fns";
import Link from "next/link";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa';
import Swal from "sweetalert2";
import axios from 'axios'; // Import axios for the subscription API call
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'; // Import Skeleton components
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton CSS

import "./blogs.css";

const BlogDetail = ({ blog }) => {
  const formattedDate = blog?.createdAt
    ? format(new Date(blog.createdAt), "MMMM dd, yyyy") // Corrected 'MMMM dd, yyyy' for full year
    : "N/A";

  const [recentBlogs, setRecentBlogs] = useState([]);
  const [email, setEmail] = useState("");
  const [loadingRecentBlogs, setLoadingRecentBlogs] = useState(true); // New loading state for recent blogs

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      setLoadingRecentBlogs(true); // Set loading to true before fetching
      try {
        const response = await fetch("/api/blogs");
        const data = await response.json();

        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const filtered = sortedData.filter((b) => b._id !== blog._id).slice(0, 5);
        setRecentBlogs(filtered);
      } catch (error) {
        console.error("Failed to fetch recent blogs", error);
        // Optionally show an error message to the user or set an error state
      } finally {
        setLoadingRecentBlogs(false); // Set loading to false after fetch (success or error)
      }
    };

    fetchRecentBlogs();
  }, [blog._id]);

const handleSubscribe = async (e) => {
  e.preventDefault(); // ✅ Prevent page reload

  try {
    const response = await axios.post("/api/subscribers", { email });
    if (response.status === 201) {
      Swal.fire({
        icon: "success",
        title: "Subscribed!",
        text: "You’ve successfully subscribed to our newsletter.",
      });
      setEmail(""); // Optional: clear email input after success
    }
  } catch (error) {
    if (error.response?.status === 409) {
      Swal.fire({
        icon: "info",
        title: "Already Subscribed",
        text: "This email is already subscribed to our newsletter.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again later.",
      });
    }
  }
};

  return (
    <Container className="mt-5 mb-5">
      <Row>
        {/* Blog Detail */}
        <Col lg={8} md={12}>
          {blog?.image && (
            <Image
              src={blog.image || "/placeholder.png"}
              alt={blog.title}
              width={840}
              height={420}
              priority
              quality={100}
              className="rounded shadow-sm mb-3 w-100 object-cover"
            />
          )}
          <p className="text-muted text-center mb-2">
            <small>Published on {formattedDate}</small>
          </p>
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </Col>

        {/* Sidebar: Recent Blogs, Subscribe, Social Media */}
        <Col lg={4} md={12} className="mt-5 mt-lg-0">
<div
  className="sticky-top"
  style={{ top: '20px', zIndex: 1 }}
>
            {/* Recent Blogs Section */}
            <h5 className="mb-3 border-bottom pb-2 sidebar-heading">Recent Blogs</h5>
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5"> {/* Customize skeleton colors */}
              {loadingRecentBlogs ? (
                // Show skeletons while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index} className="mb-3 shadow-sm border-0 recent-blog-card">
                    <div className="d-flex align-items-center p-2"> {/* Added padding to skeleton card */}
                      <Skeleton width={100} height={80} className="rounded-start" style={{ marginRight: '15px' }} />
                      <div className="flex-grow-1">
                        <Skeleton count={1} width="80%" height={20} className="mb-2" />
                        <Skeleton count={1} width="40%" height={15} />
                      </div>
                    </div>
                  </Card>
                ))
              ) : recentBlogs.length > 0 ? (
                // Show actual blogs once loaded
                recentBlogs.map((item) => (
                  <Card key={item._id} className="mb-3 shadow-sm border-0 recent-blog-card">
                    <Link href={`/blogs/${item.slug}`} className="text-decoration-none text-dark d-flex align-items-center">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={100}
                          height={80}
                          className="rounded-start object-cover recent-blog-thumbnail"
                          quality={75}
                        />
                      ) : (
                        // Fallback for missing image in recent blogs, can be a simple div or another placeholder
                        <div style={{ width: 100, height: 80, backgroundColor: '#ccc', borderRadius: 4, marginRight: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                            No Image
                        </div>
                      )}
                      <div className="ps-3 flex-grow-1">
                        <strong className="d-block recent-blog-title-text">
                          {item.title.length > 60 ? `${item.title.slice(0, 60)}...` : item.title}
                        </strong>
                        <p className="text-muted small mb-0">
                          {item.createdAt ? format(new Date(item.createdAt), "MMM dd, yyyy") : "N/A"}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))
              ) : (
                // No recent blogs found after loading
                <p className="text-muted">No recent blogs available.</p>
              )}
            </SkeletonTheme>

            {/* Subscribe Section */}
            <div className="sidebar-section mt-4 p-3 bg-light rounded shadow-sm">
              <h5 className="mb-3 border-bottom pb-2 sidebar-heading">Subscribe for Updates</h5>
              <p className="text-muted small">Get the latest blog posts directly in your inbox.</p>
              <Form onSubmit={handleSubscribe}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Subscribe
                </Button>
              </Form>
            </div>

            {/* Social Media Follow Section */}
            <div className="sidebar-section mt-4 p-3 bg-light rounded shadow-sm">
              <h5 className="mb-3 border-bottom pb-2 sidebar-heading">Follow Us</h5>
              <div className="d-flex justify-content-around social-icons-wrapper">
                <Link href="https://www.instagram.com/dialexportmart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="social-icon-link">
                  <FaInstagram size={30} color="#E1306C" />
                </Link>
                <Link href="https://www.facebook.com/dialexportmart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="social-icon-link">
                  <FaFacebookF size={30} color="#1877F2" />
                </Link>
                <Link href="https://www.linkedin.com/company/dialexportmart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn" className="social-icon-link">
                  <FaLinkedinIn size={30} color="#0A66C2" />
                </Link>
                <Link href="https://x.com/DialExportMart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter" className="social-icon-link">
                  <FaTwitter size={30} color="#1DA1F2" />
                </Link>
                <Link href="https://www.youtube.com/@DialExportMart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on YouTube" className="social-icon-link"> {/* Corrected YouTube URL */}
                  <FaYoutube size={30} color="#FF0000" />
                </Link>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogDetail;