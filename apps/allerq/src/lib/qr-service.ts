import QRCode from 'qrcode';
import { QrData } from '@/hooks/useCustomizeQr';

export interface QrGenerateOptions extends QrData {
  /**
   * The text/URL to encode in the QR code
   */
  value: string;
  /**
   * The width/height of the QR code in pixels
   */
  size?: number;
  /**
   * The color of the QR code (hexadecimal)
   */
  color?: string;
  /**
   * Optional logo to overlay on the QR code (as data URL)
   */
  logo?: string | ArrayBuffer | null;
}

export interface QrGenerateResult {
  /**
   * The generated QR code as a data URL
   */
  dataUrl: string;
}

/**
 * Generates a QR code with the given options
 */
export async function generateQrCode(options: QrGenerateOptions): Promise<QrGenerateResult> {
  const { value, color = '#000000', size = 400, logo } = options;

  // Generate the QR code
  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'H' as QRCode.QRCodeErrorCorrectionLevel, // High - allows for more damage to the code while remaining readable
    margin: 2,
    color: {
      dark: color,
      light: '#ffffff00', // Transparent background
    },
    width: size,
  };

  // Generate QR code
  const qrDataUrl = await QRCode.toDataURL(value, qrOptions);

  // If no logo, return the QR code as is
  if (!logo) {
    return { dataUrl: qrDataUrl };
  }

  // Create a canvas to compose the QR code with the logo
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Draw the QR code
  const qrImage = new Image();
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });
  ctx.drawImage(qrImage, 0, 0);

  // Draw the logo
  const logoImage = new Image();
  await new Promise((resolve, reject) => {
    logoImage.onload = resolve;
    logoImage.onerror = reject;
    logoImage.src = logo.toString();
  });

  // Calculate logo size and position (center, 25% of QR code size)
  const logoSize = Math.floor(size * 0.25);
  const logoX = Math.floor((size - logoSize) / 2);
  const logoY = Math.floor((size - logoSize) / 2);

  // Create a circular clip path for the logo
  ctx.save();
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw white background for logo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(logoX, logoY, logoSize, logoSize);

  // Draw the logo
  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  return { dataUrl: canvas.toDataURL('image/png') };
}
