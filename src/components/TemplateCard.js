// src/components/TemplateCard.js
export default function TemplateCard({ template }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
      <img
        src={template.thumbnail.url}
        alt={template.title}
        className="h-48 w-full object-cover"
      />

      <div className="p-5">
        <h3 className="font-semibold text-lg">{template.title}</h3>
        <p className="text-sm text-gray-500">
          {template.templateId} • {template.industry}
        </p>

        <div className="flex gap-2 my-3">
          {template.colors.map((c) => (
            <span
              key={c.hex}
              className="w-4 h-4 rounded-full border"
              style={{ background: c.hex }}
            />
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <a
            href={template.previewImages[0]?.url}
            target="_blank"
            className="flex-1 text-center bg-gray-100 py-2 rounded hover:bg-gray-200"
          >
            Preview
          </a>

          <button className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
