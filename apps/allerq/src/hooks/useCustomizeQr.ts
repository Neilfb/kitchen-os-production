// Hook for customizing a single QR code
import { useState, useEffect } from "react";

export interface QrData {
  value: string;
  color?: string;
  logo?: string | ArrayBuffer | null;
}

export function useCustomizeQr(qrId: string) {
  const [qrData, setQrData] = useState<QrData>({ 
    value: `https://allerq.com/r/${qrId}`, // Default value based on qrId
    color: "#000000" 
  });
  useEffect(() => {
    const abortController = new AbortController();
    
    async function fetchQrData() {
      try {
        const res = await fetch(`/api/qr-codes/${qrId}`, {
          signal: abortController.signal
        });
        if (!res.ok) throw new Error("Failed to fetch QR code");
        const data = await res.json();
        if (!abortController.signal.aborted) {
          // Ensure there's always a value property
          setQrData({ 
            ...data.qrCode,
            value: data.qrCode.value || `https://allerq.com/r/${qrId}`
          });
        }
      } catch (err) {
        if (!abortController.signal.aborted && err instanceof Error) {
          console.error("Error fetching QR code:", err);
        }
      }
    }

    if (qrId) {
      fetchQrData();
    }

    return () => {
      abortController.abort();
    };
  }, [qrId]);
  return { qrData, setQrData };
}
