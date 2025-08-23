"use client";

// Bulk upload file picker & upload flow
import { useRef, useState } from "react";

export default function BulkUpload({
  onUpload,
}: {
  onUpload?: (file: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      // TODO: Upload file to API and trigger processing
      if (onUpload) onUpload(file);
      await new Promise((res) => setTimeout(res, 2000)); // Simulate upload
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="mb-4"
        aria-label="Upload menu file"
      />
      {uploading && <div className="text-blue-600">Uploading...</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
