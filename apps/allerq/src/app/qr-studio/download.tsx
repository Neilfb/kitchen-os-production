"use client";

import React from "react";
import QrDownloadButton from "../../components/QrDownloadButton";

export default function QrDownloadPage() {
  const defaultQrData = {
    color: "#000000",
    logo: null
  };

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Download QR Code</h1>
      <QrDownloadButton qrData={defaultQrData} />
    </main>
  );
}
