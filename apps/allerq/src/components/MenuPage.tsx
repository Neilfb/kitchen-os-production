// Renders dishes with allergens/tags for a restaurant menu
import { useMenuItems } from "../hooks/useMenuItems";
import { usePublicMenu } from "../hooks/usePublicMenu";

interface MenuPageProps {
  menuId?: MenuParams["menuId"];
  restaurantId?: PublicRestaurantParams["restaurantId"];
}

import { MenuParams, PublicRestaurantParams } from "@/lib/route-types";

export default function MenuPage({ menuId, restaurantId }: MenuPageProps) {
  const { items: menuItems } = useMenuItems(menuId || "");
  const { menu } = usePublicMenu(restaurantId || "");
  const items = menuId ? menuItems : (menu?.items || []);

  return (
    <div className="grid gap-6">
      {items && items.length > 0 ? (
        items.map((item) => (
          <div key={item.id} className="bg-white rounded shadow p-4">
            <div className="font-bold text-lg">{item.name}</div>
            <div className="text-gray-600 mb-2">{item.description}</div>
            <div className="flex flex-wrap gap-2">
              {item.allergens?.map((a: string) => (
                <span
                  key={a}
                  className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs"
                >
                  {a}
                </span>
              ))}
              {item.tags?.map((t: string) => (
                <span
                  key={t}
                  className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500">No menu items found.</div>
      )}
    </div>
  );
}
