// Displays menu items with allergen/dietary info and branding
import React from "react";
import { usePublicMenu } from "@/hooks/usePublicMenu";
import Image from "next/image";
import { Restaurant } from "@/lib/api/types";

interface PublicMenuProps {
  restaurantId: string;
  restaurant?: Restaurant;
}

export default function PublicMenu({ restaurantId }: PublicMenuProps) {
  const { menu, loading, error } = usePublicMenu(restaurantId);
  
  if (loading) return <div>Loading menu...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!menu) return <div>No menu found.</div>;
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{menu.restaurantName}</h1>
        {menu.branding && menu.branding.logoUrl && (
          <Image
            src={menu.branding.logoUrl}
            alt="Logo"
            className="h-16 mx-auto mb-2"
            width={64}
            height={64}
          />
        )}
        <div className="text-gray-500">{menu.description}</div>
      </div>
      <div className="grid gap-6">
        {menu.items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4"
          >
            <div className="flex-1">
              <div className="font-semibold text-lg">{item.name}</div>
              <div className="text-gray-600 text-sm mb-1">
                {item.description}
              </div>
              <div className="text-xs text-gray-400">{item.category}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {typeof item.price === "number" && (
                <div className="font-bold text-xl">
                  ${item.price.toFixed(2)}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {item.allergens?.map((a) => (
                  <span
                    key={a}
                    className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs"
                  >
                    {a}
                  </span>
                ))}
                {item.dietary?.map((d) => (
                  <span
                    key={d}
                    className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
