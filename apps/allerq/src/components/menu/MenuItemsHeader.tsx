"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Brain } from "lucide-react";

interface MenuItemsHeaderProps {
  restaurantId: string;
  menuId: string;
}

export function MenuItemsHeader({ restaurantId, menuId }: MenuItemsHeaderProps) {
  const handleBulkProcess = () => {
    window.location.href = `/restaurants/${restaurantId}/menus/${menuId}/ai-bulk-process`;
  };

  const handleAddItem = () => {
    window.location.href = `/restaurants/${restaurantId}/menus/${menuId}/items/new`;
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Link
          href={`/restaurants/${restaurantId}/menus`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menus
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Items</h1>
          <p className="text-gray-600">Manage items for this menu with AI-powered allergen detection</p>
        </div>
      </div>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={handleBulkProcess}
        >
          <Brain className="h-4 w-4 mr-2" />
          AI Bulk Process
        </Button>
        <Button
          onClick={handleAddItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
