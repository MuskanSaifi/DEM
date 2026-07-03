"use client";

export default function DuplicateImportModal({ open, duplicates, onClose }) {
  if (!open || !duplicates?.length) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            Duplicate Data — Upload Nahi Hua
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Neeche diye gaye {duplicates.length} record(s) upload nahi hue kyunki
            ye pehle se database mein maujood hain (same mobile ya email).
          </p>
        </div>

        <div className="overflow-auto flex-1 px-6 py-4">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-amber-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Client Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Mobile
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Product
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {duplicates.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{row.clientName || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.mobile || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.email || "—"}</td>
                  <td className="px-3 py-2">{row.product || "—"}</td>
                  <td className="px-3 py-2 text-amber-700 text-xs">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
