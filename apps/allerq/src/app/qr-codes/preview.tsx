"use client";
// Live preview of generated QR code
import QrPreview from "@/components/QrPreview";
import { useCustomizeQr } from "@/hooks/useCustomizeQr";

export default function QrCodesPreviewPage() {
  const { qrData } = useCustomizeQr("preview");
  
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <QrPreview qrData={qrData || { color: "#000000", logo: null }} />
      </div>
    </main>
  );
}
