// Live preview for QR customization
import React from "react";
import Image from "next/image";

export default function QrLivePreview({
  color,
  logo,
  value,
}: {
  color: string;
  logo: string | null;
  value: string;
}) {
  // Placeholder: Replace with actual QR code rendering logic
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-40 h-40 bg-gray-200 flex items-center justify-center rounded"
        style={{ backgroundColor: color }}
      >
        {logo ? (
          <Image src={logo} alt="Logo" className="w-16 h-16 object-contain" width={64} height={64} />
        ) : (
          <span className="text-gray-500">QR</span>
        )}
      </div>
      <span className="text-xs text-gray-500">{value}</span>
    </div>
  );
}
