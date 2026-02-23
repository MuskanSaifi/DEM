"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function BulkImportLeads({ onImport, employees }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [error, setError] = useState("");

  const downloadTemplate = () => {
    const csvContent =
      "CLIENT NAME,COMPANY NAME,MOBILE,Email,STATE,PRODUCT\n" +
      "John Doe,ABC Company,9876543210,john@example.com,Maharashtra,Textile Products\n" +
      "Jane Smith,XYZ Ltd,9876543211,jane@example.com,Delhi,Electronics";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    // Handle quoted fields and commas within quotes
    const parseLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map((h) =>
      h.replace(/^"|"$/g, "").trim()
    );
    const rows = lines.slice(1).map((line) => {
      const values = parseLine(line).map((v) => v.replace(/^"|"$/g, ""));
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });
      return obj;
    });

    return rows.filter((r) => Object.values(r).some((v) => v && v.trim()));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (
      !selectedFile.name.endsWith(".csv") &&
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      setError("Please upload CSV or Excel file");
      return;
    }

    setFile(selectedFile);
    setError("");

    // Parse CSV
    if (selectedFile.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setError("No valid data found in CSV file");
          return;
        }
        setPreview(rows);
      };
      reader.readAsText(selectedFile);
    } else {
      // Parse Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            defval: "", // Default value for empty cells
            raw: false // Convert numbers to strings
          });
          
          if (jsonData.length === 0) {
            setError("No valid data found in Excel file");
            return;
          }
          
          setPreview(jsonData);
        } catch (err) {
          setError("Failed to parse Excel file: " + err.message);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !preview || preview.length === 0) {
      setError("Please select a valid file with data");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use preview data for both CSV and Excel (both are parsed now)
      await onImport(preview, assignedTo, markAsPaid);
    } catch (err) {
      setError("Import failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Bulk Import Leads</h3>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">
            Upload CSV/Excel File
          </label>
          <button
            onClick={downloadTemplate}
            className="text-sm text-blue-600 hover:underline"
          >
            📥 Download Template
          </button>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <span className="text-4xl mb-2">📄</span>
            <span className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500 mt-1">
              CSV, Excel (.xlsx, .xls)
            </span>
          </label>
        </div>
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: <span className="font-medium">{file.name}</span>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Required columns: <strong>CLIENT NAME</strong>, <strong>MOBILE</strong>,{" "}
          <strong>PRODUCT</strong> (case-insensitive)
        </p>
        <p className="text-xs text-gray-500">
          Optional: COMPANY NAME, Email, STATE
        </p>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={markAsPaid}
            onChange={(e) => setMarkAsPaid(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Mark all imported leads as Paid</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">If checked, payment status of all imported leads will be set to Paid.</p>
      </div>

      {employees && employees.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Assign to Employee (Optional)
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullname}
              </option>
            ))}
          </select>
        </div>
      )}

      {preview && preview.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">
            Preview ({preview.length} rows)
          </p>
          <div className="max-h-60 overflow-y-auto border rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {Object.keys(preview[0] || {}).map((key) => (
                    <th key={key} className="px-2 py-1 text-left">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-t">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-2 py-1">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-xs text-gray-500 p-2">
                Showing first 10 of {preview.length} rows
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleImport}
          disabled={loading || !file || !preview || preview.length === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
        >
          {loading ? "Importing..." : `Import ${preview?.length || 0} Leads`}
        </button>
        <button
          onClick={() => {
            setFile(null);
            setPreview(null);
            setError("");
            setAssignedTo("");
            setMarkAsPaid(false);
          }}
          className="px-6 py-2 bg-gray-200 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
