"use client";
import { useState, useCallback } from "react";

export interface QrCode {
  /**
   * Unique identifier of the QR code
   */
  id: string;
  /**
   * Name of the QR code for identification
   */
  name: string;
  /**
   * The URL that the QR code links to
   */
  value: string;
  /**
   * Color of the QR code (hexadecimal)
   */
  color?: string;
  /**
   * Optional logo to overlay on the QR code (as data URL)
   */
  logo?: string | ArrayBuffer | null;
  /**
   * Optional restaurant ID if associated with a restaurant
   */
  restaurantId?: string;
}

export function useQrCodes() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [qrData, setQrData] = useState<Partial<QrCode>>({ color: "#000000" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchQrCode = useCallback(
    async (id: string): Promise<QrCode | null> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/qr-codes/${id}`);
        if (!res.ok) throw new Error("Failed to fetch QR code");
        const data = await res.json();
        return data.qrCode || null;
      } catch {
        setError("Failed to fetch QR code.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchQrCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qr-codes");
      if (!res.ok) throw new Error("Failed to fetch QR codes");
      const data = await res.json();
      setQrCodes(data.qrCodes || []);
    } catch {
      setError("Failed to fetch QR codes.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createQrCode = useCallback(
    async (input: Partial<QrCode>): Promise<QrCode | null> => {
      setLoading(true);
      try {
        const res = await fetch("/api/qr-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to create QR code");
        const data = await res.json();
        await fetchQrCodes();
        return data;
      } catch {
        setError("Failed to create QR code.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchQrCodes],
  );

  const updateQrCode = useCallback(
    async (id: string, input: Partial<QrCode>): Promise<QrCode | null> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/qr-codes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to update QR code");
        const data = await res.json();
        await fetchQrCodes();
        return data;
      } catch {
        setError("Failed to update QR code.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchQrCodes],
  );

  return {
    qrCodes,
    qrData,
    setQrData,
    loading,
    error,
    fetchQrCodes,
    fetchQrCode,
    createQrCode,
    updateQrCode,
    setQrCodes,
  };
}
