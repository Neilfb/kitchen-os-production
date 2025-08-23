"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";

interface MenuQRCodeProps {
  url: string;
  restaurantName: string;
}

export default function MenuQRCode({ url, restaurantName }: MenuQRCodeProps) {
  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadEl = document.createElement("a");
    downloadEl.href = pngUrl;
    downloadEl.download = `${restaurantName}-menu-qr.png`;
    document.body.appendChild(downloadEl);
    downloadEl.click();
    document.body.removeChild(downloadEl);
  };

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <QRCodeCanvas
          value={url}
          size={200}
          level="H"
          includeMargin
        />
        <Button onClick={downloadQRCode}>
          <Icons.download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
