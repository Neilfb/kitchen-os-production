export interface QrData {
  color?: string;
  logo?: string | ArrayBuffer | null;
}

interface QrDownloadProps {
  qrData: QrData;
}

export default function QrDownload({ qrData: _qrData }: QrDownloadProps) {
  const handleDownload = () => {
    // TODO: Download QR code as image with given _qrData
    alert("Download not implemented");
  };
  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
    >
      Download QR Code
    </button>
  );
}
