import { Suspense } from "react";
import MenuListClientWrapper from "@/components/MenuListClientWrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

interface Params {
  restaurantId: string;
}

export default function RestaurantMenusPage({
  params,
}: {
  params: Params;
}) {
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600">Manage menus for this restaurant</p>
          </div>
        </div>
        {/* REMOVED: Duplicate Create Menu button - now handled by EnhancedMenuList component */}
      </div>

      {/* Menu List */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <MenuListClientWrapper restaurantId={params.restaurantId} />
      </Suspense>
    </div>
  );
}
