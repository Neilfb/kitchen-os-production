// QR Customizer: color picker, logo upload
import { useRef } from "react";

export interface QrData {
  value: string;
  color?: string;
  logo?: string | ArrayBuffer | null;
}

export default function QrCustomizer({ qrData, setQrData }: { qrData: QrData; setQrData: (data: QrData) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrData({ ...qrData, color: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setQrData({ ...qrData, logo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="block mb-1">QR Color</span>
        <input
          type="color"
          value={qrData.color || "#000000"}
          onChange={handleColorChange}
          className="w-12 h-8 p-0 border-0"
        />
      </label>
      <label className="block">
        <span className="block mb-1">Logo (optional)</span>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
        />
      </label>
    </div>
  );
}
