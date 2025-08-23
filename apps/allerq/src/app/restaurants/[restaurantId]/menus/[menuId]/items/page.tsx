import { Suspense } from "react";
import { MenuItemsHeader } from "@/components/menu/MenuItemsHeader";
import MenuItemsClientWrapper from "@/components/menu/MenuItemsClientWrapper";

interface Params {
  restaurantId: string;
  menuId: string;
}

export default function MenuItemsPage({
  params,
}: {
  params: Params;
}) {
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <MenuItemsHeader
        restaurantId={params.restaurantId}
        menuId={params.menuId}
      />

      {/* Menu Items List */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <MenuItemsClientWrapper
          restaurantId={params.restaurantId}
          menuId={params.menuId}
        />
      </Suspense>
    </div>
  );
}
