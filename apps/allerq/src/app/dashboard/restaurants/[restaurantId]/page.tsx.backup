/**
 * Restaurant Detail Page
 * 
 * Displays individual restaurant information and management options.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { clientRestaurantService, Restaurant } from "@/lib/services/clientRestaurantService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Menu, QrCode, Settings, Trash2 } from "lucide-react";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useFirebaseAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const restaurantId = params.restaurantId as string;

  useEffect(() => {
    async function fetchRestaurant() {
      if (!user || !restaurantId) {
        setLoading(false);
        return;
      }

      try {
        console.log('[RestaurantDetail] Fetching restaurant:', restaurantId);
        const fetchedRestaurant = await clientRestaurantService.getRestaurant(restaurantId, user.uid);
        
        if (!fetchedRestaurant) {
          setError("Restaurant not found or you don't have access to it.");
          return;
        }

        setRestaurant(fetchedRestaurant);
        console.log('[RestaurantDetail] Restaurant loaded:', fetchedRestaurant);
      } catch (err) {
        console.error('[RestaurantDetail] Error fetching restaurant:', err);
        setError(err instanceof Error ? err.message : "Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurant();
  }, [user, restaurantId]);

  const handleBack = () => {
    router.push("/dashboard/restaurants");
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit restaurant:", restaurantId);
  };

  const handleManageMenu = () => {
    router.push(`/restaurants/${restaurantId}/menus`);
  };

  const handleQRCodes = () => {
    // TODO: Implement QR code functionality
    console.log("Generate QR codes for:", restaurantId);
  };

  const handleSettings = () => {
    router.push(`/dashboard/restaurants/${restaurantId}/settings`);
  };

  const handleDelete = async () => {
    if (!user || !restaurant) return;

    const confirmed = confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await clientRestaurantService.deleteRestaurant(restaurantId, user.uid);
      router.push("/dashboard/restaurants");
    } catch (err) {
      console.error('[RestaurantDetail] Error deleting restaurant:', err);
      setError(err instanceof Error ? err.message : "Failed to delete restaurant");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please sign in to view restaurant details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The restaurant you're looking for doesn't exist or you don't have access to it."}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                {restaurant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleSettings} variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Restaurant Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{restaurant.name}</p>
            </div>
            
            {restaurant.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p>{restaurant.address}</p>
              </div>
            )}
            
            {restaurant.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p>{restaurant.phone}</p>
              </div>
            )}
            
            {restaurant.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>{restaurant.email}</p>
              </div>
            )}
            
            {restaurant.website && (
              <div>
                <label className="text-sm font-medium text-gray-500">Website</label>
                <p>
                  <a 
                    href={restaurant.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {restaurant.website}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleManageMenu} className="w-full justify-start">
              <Menu className="w-4 h-4 mr-2" />
              Manage Menu
            </Button>
            
            <Button onClick={handleQRCodes} variant="outline" className="w-full justify-start">
              <QrCode className="w-4 h-4 mr-2" />
              QR Codes
            </Button>
            
            <Button 
              onClick={handleDelete} 
              variant="destructive" 
              className="w-full justify-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Restaurant
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Location Information */}
      {restaurant.location && (
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Formatted Address</label>
                <p>{restaurant.location.formatted}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Coordinates</label>
                <p>{restaurant.location.lat}, {restaurant.location.lng}</p>
              </div>
              
              {restaurant.location.placeId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Google Place ID</label>
                  <p className="text-sm text-gray-600">{restaurant.location.placeId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
