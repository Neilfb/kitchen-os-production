import { Suspense } from "react";
import PublicMenuViewer from "./client";

interface Params {
  restaurantId: string;
  menuId: string;
}

export default function PublicMenuPage({
  params,
}: {
  params: Params;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <PublicMenuViewer 
          restaurantId={params.restaurantId} 
          menuId={params.menuId} 
        />
      </Suspense>
    </div>
  );
}
