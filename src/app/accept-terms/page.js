// components/TermsPage.js
"use client";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux"; // <-- Import useSelector

export default function TermsPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.user); // <-- Get the token from Redux

  const handleAccept = async () => {
    // If no token, we can't proceed
    if (!token) {
      alert("⚠️ Please login first");
      router.push("/user/login");
      return;
    }

    try {
      const res = await fetch("/api/user/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <-- Add this line
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Terms accepted");
        router.push("/userdashboard"); // Redirect to the dashboard
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Terms of Use</h2>
      <p className="text-gray-700 mb-6">
        Users must not post objectionable, abusive, illegal, or harmful content.
        Such content will be removed and users may be banned.
      </p>
      <button
        onClick={handleAccept}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        I Accept
      </button>
    </div>
  );
}