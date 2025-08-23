"use client";

// QrStudio: color picker, logo upload UI, orchestrates preview/download
import { useEffect, useState } from "react";
import QrPreview from "./QrPreview";
import QrDownloadButton from "./QrDownloadButton";
import QrColorPicker from "./QrColorPicker";
import QrLogoUploader from "./QrLogoUploader";
import { useQrCodes } from "../hooks/useQrCodes";

interface QrStudioProps {
  /**
   * Optional ID of the QR code to edit
   */
  qrCodeId?: string;
  /**
   * Optional restaurant ID to generate menu URL
   */
  restaurantId?: string;
}

interface FormData {
  /**
   * Name of the QR code for identification
   */
  name: string;
  /**
   * The URL that the QR code will link to
   */
  url: string;
  /**
   * Color of the QR code (hexadecimal)
   */
  color: string;
  /**
   * Optional logo to overlay on the QR code (as data URL)
   */
  logo: string | null;
}

export default function QrStudio({ qrCodeId, restaurantId }: QrStudioProps) {
  const { setQrData, fetchQrCode, createQrCode, updateQrCode } = useQrCodes();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: restaurantId ? `${process.env.NEXT_PUBLIC_BASE_URL}/r/${restaurantId}` : '',
    color: '#000000',
    logo: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (qrCodeId) {
      void fetchQrCode(qrCodeId).then((data) => {
        if (data) {
          setFormData({
            name: data.name,
            url: data.value,
            color: data.color || '#000000',
            logo: data.logo?.toString() || null,
          });
        }
      });
    }
  }, [qrCodeId, fetchQrCode]);

  useEffect(() => {
    setQrData({
      color: formData.color,
      logo: formData.logo,
      value: formData.url,
      name: formData.name,
    });
  }, [formData, setQrData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) {
      alert('Please enter a URL');
      return;
    }

    setSaving(true);
    try {
      const qrCodeData = {
        name: formData.name || 'Untitled QR Code',
        value: formData.url,
        color: formData.color,
        logo: formData.logo,
        restaurantId,
      };

      if (qrCodeId) {
        await updateQrCode(qrCodeId, qrCodeData);
      } else {
        await createQrCode(qrCodeData);
      }

      alert(qrCodeId ? 'QR code updated successfully' : 'QR code created successfully');
    } catch (err) {
      console.error('Failed to save QR code:', err);
      alert('Failed to save QR code. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              QR Code Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Restaurant Menu QR"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              The URL that this QR code will link to
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Color
            </label>
            <QrColorPicker
              color={formData.color}
              onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <QrLogoUploader
              logo={formData.logo}
              onChange={(logo) => setFormData((prev) => ({ ...prev, logo }))}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Preview</h3>
          <QrPreview qrData={{
            color: formData.color,
            logo: formData.logo,
            value: formData.url || 'https://example.com',
            name: formData.name,
          }} />
          <div className="flex flex-col gap-4">
            <QrDownloadButton qrData={{
              color: formData.color,
              logo: formData.logo,
              value: formData.url,
              name: formData.name,
            }} />
            <button
              type="submit"
              disabled={saving || !formData.url}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : qrCodeId ? 'Update QR Code' : 'Save QR Code'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
