"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Default true
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState("both");

  // ========================= Fetch all banners =========================
  const fetchBanners = async () => {
    try {
      const res = await axios.get("/api/adminprofile/banner");
      if (res.data.success) {
        setBanners(res.data.banners);
      }
    } catch (error) {
      toast.error("Failed to load banners");
      console.error(error);
    } finally {
      setLoading(false); // ✅ Always stop loading
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ========================= Upload new banner =========================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please select an image");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("link", link);
    formData.append("platform", platform);
    try {
      setLoading(true);
      const res = await axios.post("/api/adminprofile/banner", formData);
      if (res.data.success) {
        toast.success("Banner added successfully");
        setBanners((prev) => [res.data.banner, ...prev]);
        setTitle("");
        setLink("");
        setImage(null);
        setPlatform("both");
      }
    } catch (err) {
      toast.error("Failed to upload banner");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========================= Delete banner =========================
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await axios.delete(`/api/adminprofile/banner?id=${id}`);
      if (res.data.success) {
        toast.success("🗑️ Banner deleted");
        setBanners((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  // ========================= Toggle active/inactive =========================
  const toggleActive = async (id, isActive) => {
    try {
      const res = await axios.patch("/api/adminprofile/banner", {
        id,
        isActive: !isActive,
      });
      if (res.data.success) {
        setBanners((prev) =>
          prev.map((b) => (b._id === id ? { ...b, isActive: !isActive } : b))
        );
        toast.success(`Banner ${!isActive ? "activated" : "deactivated"}`);
      }
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  // ========================= Render =========================
  return (
    <div className="p-6 max-w-5xl mx-auto">
     <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
  <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-lg text-lg">🎨</span>
    Manage Banners
  </h1>
  <p className="text-gray-600 text-sm leading-relaxed">
    Welcome Admin! Here you can easily manage and control your platform banners.  
    You can <b>upload</b> new banners, select whether they appear on the <b>Website</b> or <b>App</b>,  
    and toggle their <b>Active</b> or <b>Inactive</b> status.  
    When a banner is <span className="text-green-600 font-medium">Active</span>, it will be visible on the platform —  
    and when <span className="text-red-600 font-medium">Inactive</span>, it will be hidden automatically.
  </p>
</div>


      {/* ========================= Upload Form ========================= */}
      <form
        onSubmit={handleUpload}
        className="border p-4 rounded-xl shadow-sm mb-8 bg-white"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Banner Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter banner title"
              className="border w-full p-2 rounded mt-1"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Banner Link</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Redirect link (optional)"
              className="border w-full p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="border w-full p-2 rounded mt-1"
            >
              <option value="both">Both</option>
              <option value="web">Web Only</option>
              <option value="app">App Only</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="border w-full p-2 rounded mt-1"
              required
            />
          </div>
        </div>

        {image && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-52 object-cover rounded-lg border"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 mt-4 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please Wait..." : "Add Banner"}
        </button>
      </form>

      {/* ========================= Banner List ========================= */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-center text-gray-600">⏳ Loading banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-gray-600 text-center">No banner yet created for show.</p>
        ) : (
          banners.map((b) => (
            <div
              key={b._id}
              className="border p-4 rounded-xl shadow-sm bg-white flex flex-col sm:flex-row gap-4 items-center justify-between"
            >
              <img
                src={b.imageUrl}
                alt={b.title}
                className="w-44 h-28 object-cover rounded-lg border"
              />

              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">{b.title}</h2>
                {b.link && (
                  <a
                    href={b.link}
                    target="_blank"
                    className="text-blue-500 text-sm break-all"
                  >
                    {b.link}
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Platform:{" "}
                  <span className="font-medium capitalize">{b.platform}</span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(b.createdAt).toLocaleString()}
                </p>
              </div>

             <div className="flex items-center gap-4">
  {/* Toggle Switch */}
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={b.isActive}
      onChange={() => toggleActive(b._id, b.isActive)}
    />
    <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer
        peer-checked:after:translate-x-full peer-checked:after:border-white
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border-gray-300 after:border after:rounded-full
        after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500">
    </div>
  </label>

  {/* Delete Button */}
  <button
    onClick={() => handleDelete(b._id)}
    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
  >
    Delete
  </button>
            </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Banner;
