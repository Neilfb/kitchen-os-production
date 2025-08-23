'use client';

import { useRef, useState } from "react";

export default function MenuUploadClient() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/menus/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      setSuccess(true);
    } catch (err) {
      setError("Failed to upload menu file");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Menu File</h1>
      
      <div className="border-dashed border-2 border-gray-300 p-8 text-center mb-6 rounded">
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.xlsx"
        />
        
        <button
          onClick={() => fileInput.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Select File"}
        </button>
        
        <p className="text-sm text-gray-500">
          Supports PDF, DOCX and Excel files
        </p>
      </div>
      
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && (
        <div className="text-green-600 mb-4">
          File uploaded successfully! Processing menu data...
        </div>
      )}
    </div>
  );
}
