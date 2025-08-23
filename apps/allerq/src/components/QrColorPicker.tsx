// Color picker for QR customization
import React from "react";

export default function QrColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="font-medium">Color:</label>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border rounded"
      />
    </div>
  );
}
