"use client";
import { useEffect, useState } from "react";

export default function ManageTemplates() {
  const [templates, setTemplates] = useState([]);

  // form states
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [type, setType] = useState("web");
  const [colors, setColors] = useState([{ name: "", hex: "" }]);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  const [loading, setLoading] = useState(false);

   const INDUSTRIES = [
  "Interior",
  "Fashion",
  "Electronics",
  "Furniture",
  "Real Estate",
  "Education",
  "Healthcare",
  "Manufacturing",
  "Services",
];


  // fetch templates
  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/templates");
    const data = await res.json();
    setTemplates(data.templates || []);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // delete template
const deleteTemplate = async (id) => {
  const ok = confirm("Are you sure you want to delete this template?");
  if (!ok) return;

  await fetch(`/api/admin/templates/${id}`, {
    method: "DELETE",
  });

  // refresh list
  fetchTemplates();
};


  // add color row
  const addColor = () => {
    setColors([...colors, { name: "", hex: "" }]);
  };

  // update color
  const updateColor = (index, field, value) => {
    const updated = [...colors];
    updated[index][field] = value;
    setColors(updated);
  };

  // submit
  const submitHandler = async () => {
    // ✅ validation
    if (!title || !industry || !style || !type)
      return alert("Please fill all fields");
    if (!thumbnail) return alert("Thumbnail required");
    if (colors.some((c) => !c.name || !c.hex))
      return alert("Fill all color fields");

    setLoading(true);

    const fd = new FormData();
    fd.append("templateId", `D${Date.now()}`);
    fd.append("title", title);
    fd.append("industry", industry);
    fd.append("style", style);
    fd.append("type", type);
    fd.append("thumbnail", thumbnail);

    previewImages.forEach((img) => fd.append("previewImages", img));
    fd.append("colors", JSON.stringify(colors));

    await fetch("/api/admin/templates", {
      method: "POST",
      body: fd,
    });

    // reset
    setTitle("");
    setIndustry("");
    setStyle("");
    setType("web");
    setColors([{ name: "", hex: "" }]);
    setThumbnail(null);
    setPreviewImages([]);

    await fetchTemplates();
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-10">
      {/* ADD TEMPLATE */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Add Template</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            placeholder="Template Title"
            className="border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            placeholder="Style (Modern, Classic)"
            className="border p-2 rounded"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">Select Industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="web">Web Template</option>
            <option value="mobile">Mobile Template</option>
          </select>
        </div>

        {/* COLORS */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Colors</h3>
          {colors.map((c, i) => (
            <div key={i} className="flex gap-3 mb-2">
              <input
                placeholder="Color Name"
                className="border p-2 rounded"
                value={c.name}
                onChange={(e) => updateColor(i, "name", e.target.value)}
              />
              <input
                type="color"
                className="border p-1 rounded w-20"
                value={c.hex}
                onChange={(e) => updateColor(i, "hex", e.target.value)}
              />
            </div>
          ))}
          <button
            onClick={addColor}
            className="text-blue-600 text-sm mt-1"
          >
            + Add Color
          </button>
        </div>

        {/* FILES */}
        <div className="mt-6 flex gap-4">
          <input type="file" onChange={(e) => setThumbnail(e.target.files[0])} />
          <input
            type="file"
            multiple
            onChange={(e) => setPreviewImages([...e.target.files])}
          />
        </div>

        <button
          onClick={submitHandler}
          disabled={loading}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Uploading..." : "Create Template"}
        </button>
      </div>

      {/* LIST */}
      <div>
        <h2 className="text-xl font-semibold mb-2 mt-5">All Templates</h2>

  <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
  <table className="min-w-full border-collapse">
    <thead className="bg-gray-50">
      <tr className="text-left text-sm text-gray-600">
        <th className="p-3">Thumbnail</th>
        <th className="p-3">Title</th>
        <th className="p-3">Template ID</th>
        <th className="p-3">Industry</th>
        <th className="p-3">Style</th>
        <th className="p-3">Type</th>
        <th className="p-3">Colors</th>
        <th className="p-3">Created</th>
        <th className="p-3">Actions</th>
      </tr>
    </thead>

    <tbody>
      {templates.map((t) => (
        <tr
          key={t._id}
          className="border-t text-sm hover:bg-gray-50 transition"
        >
          {/* Thumbnail */}
          <td className="p-3">
            <img
              src={t.thumbnail.url}
              className="h-12 w-20 object-cover rounded"
            />
          </td>

          {/* Title */}
          <td className="p-3 font-medium">{t.title}</td>

          {/* Template ID */}
          <td className="p-3 text-gray-600">{t.templateId}</td>

          {/* Industry */}
          <td className="p-3">{t.industry}</td>

          {/* Style */}
          <td className="p-3 capitalize">{t.style}</td>

          {/* Type */}
          <td className="p-3 capitalize">{t.type}</td>

          {/* Colors */}
          <td className="p-3">
            <div className="flex gap-1">
              {t.colors.map((c) => (
                <span
                  key={c.hex}
                  title={`${c.name} (${c.hex})`}
                  className="w-4 h-4 rounded-full border"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </td>

          {/* Created */}
          <td className="p-3 text-gray-500">
            {new Date(t.createdAt).toLocaleDateString()}
          </td>

          {/* Actions */}
          <td className="p-3">
            <div className="flex gap-3">
              <button
                onClick={() =>
                  window.open(t.previewImages[0]?.url, "_blank")
                }
                className="text-blue-600 hover:underline"
              >
                Preview
              </button>

              <button
                onClick={() => deleteTemplate(t._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {templates.length === 0 && (
    <p className="text-center text-gray-500 py-6">
      No templates found
    </p>
  )}
</div>


      </div>
    </div>
  );
}
