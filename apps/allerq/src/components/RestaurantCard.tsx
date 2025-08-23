"use client";

import { useState } from "react";
import { Restaurant } from "@/lib/services/serverRestaurantService";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onRefresh: () => void;
  isSelected?: boolean;
  onSelect?: (restaurant: Restaurant) => void;
}

export function RestaurantCard({
  restaurant,
  onRefresh,
  isSelected = false,
  onSelect,
}: RestaurantCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete restaurant");
      onRefresh();
      toast({
        variant: "success",
        title: "Success",
        description: `Successfully deleted restaurant "${restaurant.name}"`,
      });
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete restaurant. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={isSelected ? "border-primary border-2" : ""}>
      <CardHeader className="space-y-2">
        {/* Restaurant Logo */}
        {restaurant.logoUrl && (
          <div className="flex justify-center mb-4">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={restaurant.logoUrl}
                alt={`${restaurant.name} logo`}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(restaurant)}
                id={`select-restaurant-${restaurant.id}`}
                aria-label={`Select ${restaurant.name}`}
              />
            )}
            <CardTitle className="text-xl">{restaurant.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icons.moreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() =>
                  (window.location.href = `/restaurants/${restaurant.id}/edit`)
                }
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                <span>Edit Restaurant</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  (window.location.href = `/dashboard/restaurants/${restaurant.id}?tab=team`)
                }
              >
                <Icons.users className="mr-2 h-4 w-4" />
                <span>Manage Team</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleDelete}
                className="text-red-600"
                disabled={isLoading}
              >
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && <Icons.trash className="mr-2 h-4 w-4" />}
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {restaurant.address && (
          <p className="text-sm text-gray-500">
            <Icons.mapPin className="mr-1 h-4 w-4 inline" />
            {restaurant.address}
          </p>
        )}
        {restaurant.phone && (
          <p className="text-sm text-gray-500">
            <Icons.phone className="mr-1 h-4 w-4 inline" />
            {restaurant.phone}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            (window.location.href = `/dashboard/restaurants/${restaurant.id}?tab=menus`)
          }
        >
          <Icons.menu className="mr-2 h-4 w-4" />
          View Menu
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            (window.location.href = `/dashboard/restaurants/${restaurant.id}?tab=qr`)
          }
        >
          <Icons.qrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </CardFooter>
    </Card>
  );
}
