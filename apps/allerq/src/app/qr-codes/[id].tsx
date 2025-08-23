// QR customization studio page
import QrStudio from "../../components/QrStudio";
import { ServerRouteParams } from "@/lib/route-utils";

type Params = ServerRouteParams<{ id: string }>;

export default async function QrCodeStudioPage({ params }: { params: Params }) {
  const { id } = await params;
  
  return (
    <main className="max-w-2xl mx-auto py-8">
      <QrStudio qrCodeId={id} />
    </main>
  );
}
