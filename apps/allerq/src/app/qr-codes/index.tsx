"use client";
// List & select QR code entries
import QrCustomizer from "../../components/QrCustomizer";
import QrPreview from "../../components/QrPreview";
import { useCustomizeQr } from "../../hooks/useCustomizeQr";
import { useState } from "react";

export default function QrCodesStudioPage() {
  const [selectedQrId] = useState("new"); // Default to "new" for creating a new QR code
  const { qrData, setQrData } = useCustomizeQr(selectedQrId);

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">QR Code Studio</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div className="flex-1">
          <QrCustomizer qrData={qrData} setQrData={(data) => setQrData({...data, value: qrData.value})} />
        </div>
        <div className="flex-1">
          <QrPreview qrData={qrData} />
        </div>
      </div>
    </main>
  );
}
