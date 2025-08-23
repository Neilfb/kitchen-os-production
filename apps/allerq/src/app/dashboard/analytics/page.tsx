'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@kitchen-os/auth';
import { Restaurant } from '@kitchen-os/database';
import { RestaurantService } from '@kitchen-os/database';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Button } from '@kitchen-os/ui';
import { BarChart3, Loader2, Building2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.customerId) {
      loadRestaurants();
    }
  }, [userProfile]);

  const loadRestaurants = async () => {
    if (!userProfile?.customerId) return;

    try {
      setLoading(true);
      const restaurantsData = await RestaurantService.getRestaurantsByCustomer(userProfile.customerId);
      setRestaurants(restaurantsData);
      
      // Auto-select first restaurant if only one exists
      if (restaurantsData.length === 1) {
        setSelectedRestaurant(restaurantsData[0].id);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

  if (loading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Track your menu performance and customer engagement">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-kitchen-os-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Track your menu performance and customer engagement"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
          <p className="text-gray-600 mb-6">
            You need to create a restaurant before you can view analytics.
          </p>
          <Button
            asChild
            className="kitchen-os-gradient text-white"
          >
            <a href="/dashboard/restaurants">
              <Building2 className="h-4 w-4 mr-2" />
              Create Your First Restaurant
            </a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Restaurant Selector */}
          {restaurants.length > 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="restaurant-select" className="text-sm font-medium text-gray-700">
                  Select Restaurant:
                </label>
                <select
                  id="restaurant-select"
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitchen-os-500"
                >
                  <option value="">Choose a restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          {selectedRestaurant && selectedRestaurantData ? (
            <AnalyticsDashboard
              restaurantId={selectedRestaurant}
              restaurantName={selectedRestaurantData.name}
            />
          ) : restaurants.length === 1 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data yet</h3>
              <p className="text-gray-600 mb-6">
                Start by creating QR codes and sharing your digital menus to see analytics data.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  asChild
                  variant="outline"
                >
                  <a href="/dashboard/qr-codes">
                    Generate QR Codes
                  </a>
                </Button>
                <Button
                  asChild
                  className="kitchen-os-gradient text-white"
                >
                  <a href="/dashboard/menus">
                    Create Menus
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a restaurant</h3>
              <p className="text-gray-600">
                Choose a restaurant from the dropdown above to view its analytics.
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
