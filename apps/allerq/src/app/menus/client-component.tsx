'use client';

import { useMenus, Menu } from "../../hooks/useMenus";
import Link from "next/link";
import { PublicRestaurantParams } from "@/lib/route-types";

interface MenuListProps {
  restaurantId?: PublicRestaurantParams["restaurantId"];
  publicView?: boolean;
}

export default function MenuListClient({ restaurantId, publicView }: MenuListProps) {
  const { menus, loading, error } = useMenus();
  const filteredMenus = restaurantId 
    ? menus.filter(m => m.restaurantId === restaurantId)
    : menus;

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y divide-gray-200">
        {filteredMenus.length === 0 ? (
          <li className="py-4 text-gray-500">No menus found.</li>
        ) : (
          filteredMenus.map((m: Menu) => (
            <li key={m.id} className="py-4 flex justify-between items-center">
              <span>{m.name}</span>
              <Link
                href={{
                  pathname: publicView && restaurantId 
                    ? `/r/${restaurantId}/menu/${m.id}`
                    : `/menus/${m.id}`
                }}
                className="text-blue-600 hover:underline"
              >
                View
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
