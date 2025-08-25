'use client';

import { useState, useEffect } from 'react';
import { Button } from '@kitchen-os/ui';
import { QrCode, Download, Palette } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  restaurantName?: string;
  menuName?: string;
  onCustomizationChange: (customization: any) => void;
}

export function QRCodeGenerator({ 
  url, 
  restaurantName, 
  menuName, 
  onCustomizationChange 
}: QRCodeGeneratorProps) {
  const [customization, setCustomization] = useState({
    size: 256,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    logoUrl: '',
    borderRadius: 0,
    margin: 4,
    errorCorrectionLevel: 'M',
    includeText: true,
    textColor: '#000000',
    textSize: 16,
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [url, customization]);

  const generateQRCode = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = customization.size;
      canvas.height = customization.size + (customization.includeText ? 40 : 0);

      // Background
      ctx.fillStyle = customization.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // QR Code placeholder (simple grid pattern)
      const gridSize = 21;
      const moduleSize = (customization.size - customization.margin * 2) / gridSize;
      
      ctx.fillStyle = customization.foregroundColor;
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if ((i + j) % 3 === 0 || (i === 0 || i === gridSize - 1 || j === 0 || j === gridSize - 1)) {
            const x = customization.margin + i * moduleSize;
            const y = customization.margin + j * moduleSize;
            
            if (customization.borderRadius > 0) {
              ctx.beginPath();
              ctx.roundRect(x, y, moduleSize, moduleSize, customization.borderRadius);
              ctx.fill();
            } else {
              ctx.fillRect(x, y, moduleSize, moduleSize);
            }
          }
        }
      }

      // Add text if enabled
      if (customization.includeText && (restaurantName || menuName)) {
        const text = menuName ? `${restaurantName} - ${menuName}` : restaurantName || 'Menu';
        ctx.fillStyle = customization.textColor;
        ctx.font = `${customization.textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, customization.size + 25);
      }

      setQrCodeDataUrl(canvas.toDataURL());
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleCustomizationChange = (key: string, value: any) => {
    const newCustomization = { ...customization, [key]: value };
    setCustomization(newCustomization);
  };

  const handleGenerate = () => {
    onCustomizationChange(customization);
  };

  const handleDownload = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="inline-block p-4 bg-gray-50 rounded-lg">
          {qrCodeDataUrl ? (
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code Preview" 
              className="mx-auto"
              style={{ maxWidth: '300px', height: 'auto' }}
            />
          ) : (
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
        {qrCodeDataUrl && (
          <Button
            variant="outline"
            onClick={handleDownload}
            className="mt-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Preview
          </Button>
        )}
      </div>

      {/* Customization Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Customization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size (px)
            </label>
            <input
              type="range"
              min="128"
              max="512"
              value={customization.size}
              onChange={(e) => handleCustomizationChange('size', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-500">{customization.size}px</span>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foreground Color
            </label>
            <input
              type="color"
              value={customization.foregroundColor}
              onChange={(e) => handleCustomizationChange('foregroundColor', e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <input
              type="color"
              value={customization.backgroundColor}
              onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={customization.borderRadius}
              onChange={(e) => handleCustomizationChange('borderRadius', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-500">{customization.borderRadius}px</span>
          </div>
        </div>

        {/* Text Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeText"
              checked={customization.includeText}
              onChange={(e) => handleCustomizationChange('includeText', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="includeText" className="text-sm font-medium text-gray-700">
              Include text below QR code
            </label>
          </div>

          {customization.includeText && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  value={customization.textColor}
                  onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Size
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={customization.textSize}
                  onChange={(e) => handleCustomizationChange('textSize', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{customization.textSize}px</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end space-x-3">
        <Button
          onClick={handleGenerate}
          className="kitchen-os-gradient text-white"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Generate QR Code
        </Button>
      </div>
    </div>
  );
}