// Layout and orchestration for QR Studio
import QrCustomizer, { QrData } from "@/components/QrCustomizer";
import QrPreview from "@/components/QrPreview";
import QrDownloadButton from "@/components/QrDownloadButton";
import { useQrCodes } from "@/hooks/useQrCodes";

export default function QrStudioPage() {
  const { qrData, setQrData } = useQrCodes();
  
  // Ensure QR data is properly formatted for the QrPreview component
  const formattedQrData = {
    ...qrData,
    value: qrData?.value || 'https://allerq.com' // Provide a default value
  };
  
  // Create a properly typed version of QrData for QrCustomizer
  const customizableQrData: QrData = {
    value: qrData?.value || 'https://allerq.com',
    color: qrData?.color,
    logo: qrData?.logo
  };
  
  return (
    <section className="flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <QrCustomizer qrData={customizableQrData} setQrData={setQrData} />
      </div>
      <div className="flex-1 flex flex-col items-center">
        <QrPreview qrData={formattedQrData} />
        <QrDownloadButton qrData={formattedQrData} />
      </div>
    </section>
  );
}
