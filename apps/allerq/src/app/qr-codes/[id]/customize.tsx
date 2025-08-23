"use client";
// QR Code customization UI page
import QrCustomizer from "../../../components/QrCustomizer";
import QrPreview from "../../../components/QrPreview";
import { useCustomizeQr } from "../../../hooks/useCustomizeQr";
import { use } from "react";

type Params = Promise<{ id: string }>;

export default function QrCustomizePage({ params }: { params: Params }) {
  const { id } = use(params);
  const { qrData, setQrData } = useCustomizeQr(id);
  
  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Customize QR Code</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
        <div className="flex-1">
          <QrCustomizer qrData={qrData} setQrData={(data) => setQrData({...data, value: qrData.value})} />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <QrPreview qrData={qrData} />
        </div>
      </div>
    </main>
  );
}
