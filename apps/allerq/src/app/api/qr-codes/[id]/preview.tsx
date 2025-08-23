// Server component to render and return QR code image
import React from "react";
import { resolveParams } from "@/lib/route-params";

type PageParams = {
  id: string;
};

export default async function QrCodePreview({ 
  params 
}: { 
  params: Promise<PageParams> | PageParams;
}) {
  const resolvedParams = await resolveParams(params);
  
  // TODO: Render QR code image for given id
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <span>QR code preview for {resolvedParams.id}</span>
    </div>
  );
}
