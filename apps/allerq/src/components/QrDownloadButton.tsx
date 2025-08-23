import { useState } from "react";
import { generateQrCode } from "@/lib/qr-service";

export interface QrData {
  color?: string;
  logo?: string | ArrayBuffer | null;
  value?: string;
  name?: string;
}

// QR Download Button: download/embed controls
export default function QrDownloadButton({ qrData }: { qrData: QrData }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!qrData.value) {
      alert("Please enter a URL first");
      return;
    }

    try {
      setDownloading(true);

      const result = await generateQrCode({
        ...qrData,
        value: qrData.value,
        size: 1024, // Larger size for downloads
      });

      // Create temporary link element
      const link = document.createElement("a");
      link.href = result.dataUrl;
      link.download = `${qrData.name || 'qr-code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download QR code:', err);
      alert('Failed to download QR code. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading || !qrData.value}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    >
      {downloading ? "Downloading..." : "Download QR Code"}
    </button>
  );
}
