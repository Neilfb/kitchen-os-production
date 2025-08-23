// QR customization UI (color, logo, preview)
import React from "react";
import QrStudio from "../../components/QrStudio";

export default function QrStudioPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">QR Code Studio</h1>
      <QrStudio />
    </main>
  );
}
