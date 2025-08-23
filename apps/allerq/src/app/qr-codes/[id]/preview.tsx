"use client";
// Live QR code customization preview page
import QrLivePreview from "@/components/QrLivePreview";
import { useCustomizeQr } from "@/hooks/useCustomizeQr";
import { use } from "react";

type Params = Promise<{ id: string }>;

export default function QrPreviewPage({ params }: { params: Params }) {
  const { id } = use(params);
  const { qrData } = useCustomizeQr(id);

  return (
    <div className="p-4">
      <QrLivePreview
        color={qrData?.color || "#000000"}
        logo={qrData?.logo?.toString() || null}
        value={`${process.env.NEXT_PUBLIC_BASE_URL}/r/${id}`} // The actual value to encode in the QR code
      />
    </div>
  );
}
