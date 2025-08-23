"use client";

import { useEffect, useState } from "react";
import { generateQrCode } from "@/lib/qr-service";

export interface QrData {
  /**
   * The text/URL to encode in the QR code
   */
  value: string;
  /**
   * The color of the QR code (hexadecimal)
   */
  color?: string;
  /**
   * Optional logo to overlay on the QR code (as data URL)
   */
  logo?: string | ArrayBuffer | null;
  /**
   * Optional name for the QR code
   */
  name?: string;
}

export default function QrPreview({ qrData }: { qrData: QrData }) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateQr() {
      try {
        if (!qrData.value) {
          setQrImage(null);
          return;
        }

        const result = await generateQrCode({
          value: qrData.value,
          color: qrData.color,
          logo: qrData.logo,
          size: 400,
        });

        setQrImage(result.dataUrl);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate QR code";
        console.error("Failed to generate QR code:", errorMessage);
        setError(errorMessage);
        setQrImage(null);
      }
    }

    void generateQr();
  }, [qrData]);

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (!qrImage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg">
        Enter a URL to generate a QR code
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrImage}
        alt="QR code preview"
        className="max-w-full h-auto rounded-lg shadow-lg"
        width={400}
        height={400}
      />
      <span className="text-sm text-gray-500">Preview your QR code above</span>
    </div>
  );
}
