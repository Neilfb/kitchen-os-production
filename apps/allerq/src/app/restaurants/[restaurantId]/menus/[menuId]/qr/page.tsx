import { Suspense } from "react";
import QRCodeClient from "./client";

interface Params {
  restaurantId: string;
  menuId: string;
}

export default function QRCodePage({
  params,
}: {
  params: Params;
}) {

  return (
    <div className="container mx-auto py-6 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <QRCodeClient 
          restaurantId={params.restaurantId} 
          menuId={params.menuId} 
        />
      </Suspense>
    </div>
  );
}
