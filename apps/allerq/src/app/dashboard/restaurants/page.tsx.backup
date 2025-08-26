"use client";

import { useState } from "react";
import { SimpleRestaurantDashboard } from "@/components/SimpleRestaurantDashboard";
import { CreateRestaurantDialog } from "@/components/CreateRestaurantDialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";

export default function RestaurantsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleRestaurantCreated = async (restaurantId: string) => {
    console.log('🔍 [Dashboard] Restaurant created, preparing navigation to:', restaurantId);
    setIsNavigating(true);

    // Add a small delay to ensure data persistence and auth state stability
    setTimeout(() => {
      console.log('✅ [Dashboard] Navigating to restaurant:', restaurantId);
      router.push(`/dashboard/restaurants/${restaurantId}`);
      setIsNavigating(false);
    }, 750);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Restaurant Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Icons.add className="mr-2 h-4 w-4" />
          Add Restaurant
        </Button>
      </div>
      
      <SimpleRestaurantDashboard />
      
      <CreateRestaurantDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          if (!isNavigating) {
            setShowCreateDialog(open);
          }
        }}
        onSuccess={handleRestaurantCreated}
      />

      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Icons.spinner className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Redirecting to restaurant...</p>
          </div>
        </div>
      )}
    </div>
  );
}
