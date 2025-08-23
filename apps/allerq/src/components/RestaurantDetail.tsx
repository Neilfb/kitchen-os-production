"use client";

import { useState, useEffect } from "react";
import { useRestaurants, Restaurant } from "@/hooks/useRestaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamManagement } from "@/components/TeamManagement";
import { Icons } from "@/components/icons";
import QrStudio from "@/components/QrStudio";
import Link from "next/link";

interface RestaurantDetailProps {
  restaurantId: string;
}

export function RestaurantDetail({ restaurantId }: RestaurantDetailProps) {
  const { getRestaurant } = useRestaurants();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRestaurant() {
      setLoading(true);
      try {
        const data = await getRestaurant(restaurantId);
        setRestaurant(data);
      } catch (err) {
        console.error("Failed to load restaurant", err);
        setError("Could not load restaurant details");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [restaurantId, getRestaurant]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500 text-center">
            <Icons.warning className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p>Restaurant not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          {restaurant.address && <p className="text-gray-500">{restaurant.address}</p>}
        </div>
        <Button asChild>
          <Link href={`/dashboard/restaurants/${restaurantId}/settings`}>
            <Icons.settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="qr">QR Codes</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Menus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-gray-500 text-sm">Active menus</p>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={{pathname: `/dashboard/restaurants/${restaurantId}/menus`}}>
                    <Icons.arrowRight className="mr-2 h-4 w-4" />
                    Manage Menus
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-gray-500 text-sm">QR codes generated</p>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={{pathname: `/dashboard/restaurants/${restaurantId}/qr-codes`}}>
                    <Icons.qrCode className="mr-2 h-4 w-4" />
                    Manage QR Codes
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1</div>
                <p className="text-gray-500 text-sm">Team members</p>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`#team`}>
                    <Icons.users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="menus">
          <Card>
            <CardHeader>
              <CardTitle>Menu Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Icons.fileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Create your first menu</h3>
                <p className="text-gray-500 mb-4">
                  Start by creating a menu for your restaurant. You can upload an existing menu or create one from scratch.
                </p>
                <Button asChild>
                  <Link href={{pathname: `/dashboard/restaurants/${restaurantId}/menus/create`}}>
                    <Icons.add className="mr-2 h-4 w-4" />
                    Create Menu
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <QrStudio restaurantId={restaurantId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
