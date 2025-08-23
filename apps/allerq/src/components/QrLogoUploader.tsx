// Logo uploader for QR customization
import React from "react";
import Image from "next/image";

export default function QrLogoUploader({
  logo,
  onChange,
}: {
  logo: string | null;
  onChange: (logo: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">Logo:</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return onChange(null);
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result as string);
          reader.readAsDataURL(file);
        }}
      />
      {logo && <Image src={logo} alt="Logo preview" className="h-12 mt-2" width={48} height={48} />}
    </div>
  );
}
