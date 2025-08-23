"use client";
import { useState } from "react";
import { useRestaurants, Restaurant } from "@/hooks/useRestaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export function SimpleRestaurantDashboard() {
  const { restaurants, loading, error, deleteRestaurant } = useRestaurants();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  console.log('[SimpleRestaurantDashboard] Restaurants state:', {
    type: typeof restaurants,
    isArray: Array.isArray(restaurants),
    length: restaurants.length,
    restaurants: restaurants
  });

  // Filter restaurants based on search term
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    if (!confirm(`Are you sure you want to delete "${restaurant.name}"?`)) {
      return;
    }

    try {
      await deleteRestaurant(restaurant.id);
      toast({
        title: "Restaurant Deleted",
        description: `${restaurant.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete restaurant. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading restaurants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <Icons.refresh className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <Icons.store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {restaurants.length === 0 ? "No restaurants yet" : "No restaurants found"}
          </h3>
          <p className="text-gray-500 mb-4">
            {restaurants.length === 0 
              ? "Create your first restaurant to get started."
              : "Try adjusting your search terms."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-1">
                      {restaurant.name}
                    </CardTitle>
                    {restaurant.address && (
                      <p className="text-sm text-gray-600 mb-2">
                        {restaurant.address}
                      </p>
                    )}
                  </div>
                  {restaurant.logoUrl && (
                    <img
                      src={restaurant.logoUrl}
                      alt={`${restaurant.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover ml-3"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.website && (
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Icons.globe className="inline h-3 w-3 mr-1" />
                      Website
                    </a>
                  )}
                  {restaurant.phone && (
                    <span className="text-gray-600 text-sm">
                      <Icons.phone className="inline h-3 w-3 mr-1" />
                      {restaurant.phone}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/restaurants/${restaurant.id}/edit`}>
                      <Icons.edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/restaurants/${restaurant.id}/menus`}>
                      <Icons.menu className="mr-1 h-3 w-3" />
                      Menu
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRestaurant(restaurant)}
                    className="px-3"
                  >
                    <Icons.trash className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        {filteredRestaurants.length !== restaurants.length && (
          <p>
            Showing {filteredRestaurants.length} of {restaurants.length} restaurants
          </p>
        )}
        {filteredRestaurants.length === restaurants.length && restaurants.length > 0 && (
          <p>
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
    </div>
  );
}
