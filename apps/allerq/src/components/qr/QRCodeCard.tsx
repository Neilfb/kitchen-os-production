'use client';

import { useState } from 'react';
import { Button } from '@kitchen-os/ui';
import { Edit, Trash2, BarChart3, Download, Copy } from 'lucide-react';

interface QRCode {
  id: string;
  restaurantId: string;
  menuId?: string;
  url: string;
  customization: any;
  createdAt: any;
  updatedAt: any;
}

interface QRCodeCardProps {
  qrCode: QRCode;
  onEdit: (qrCode: QRCode) => void;
  onDelete: (qrCode: QRCode) => void;
  onViewAnalytics: (qrCode: QRCode) => void;
}

export function QRCodeCard({ qrCode, onEdit, onDelete, onViewAnalytics }: QRCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrCode.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode.url;
    link.download = `qr-code-${qrCode.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            QR Code #{qrCode.id.slice(-6)}
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(qrCode)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewAnalytics(qrCode)}
              className="h-8 w-8"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(qrCode)}
              className="h-8 w-8 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">URL</label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                value={qrCode.url}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyUrl}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">URL copied to clipboard!</p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Created: {new Date(qrCode.createdAt).toLocaleDateString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}