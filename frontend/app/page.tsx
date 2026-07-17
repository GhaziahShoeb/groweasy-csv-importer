"use client";
import { useState } from "react";
import CSVUpload from "./components/CSVUpload";
import PreviewTable from "./components/PreviewTable";
import ResultTable from "./components/ResultTable";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://backend-beta-wine-77.vercel.app/api/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Import failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full p-6 min-h-screen bg-buttercup-50">
      <h1 className="text-2xl font-bold mb-4 text-buttercup-700">GrowEasy CSV Importer</h1>
      <CSVUpload
        onParsed={(r, h) => { setRows(r); setHeaders(h); setResult(null); }}
        onFile={(f) => setFile(f)}
      />
      {rows.length > 0 && (
        <>
          <PreviewTable rows={rows} headers={headers} />
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="mt-4 bg-buttercup-500 hover:bg-buttercup-600 text-gray-900 font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <span className="animate-spin h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full"></span>}
            {loading ? "Processing with AI..." : "Confirm Import"}
          </button>
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-buttercup-500 h-2 animate-pulse w-full"></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Processing {rows.length} rows with AI...</p>
            </div>
          )}
        </>
      )}
      {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
      <ResultTable result={result} />
    </main>
  );
}