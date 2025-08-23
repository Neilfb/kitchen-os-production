import { useMenus, Menu } from "@/hooks/useMenus";
import React from "react";
import MenuPublish from "@/components/MenuPublish";

interface MenuDetailsProps {
  menuId?: string;
  menu?: Menu;
}

export default function MenuDetails({ menuId, menu: propMenu }: MenuDetailsProps) {
  const { menus, publishMenu } = useMenus();
  const menuFromId = menuId ? menus.find((m) => m.id === menuId) : null;
  const menu = propMenu || menuFromId;

  if (!menu) {
    return <div>Menu not found</div>;
  }

  const handlePublish = async () => {
    if (menu.id) {
      return await publishMenu(menu.id);
    }
    return false;
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-4">{menu.name}</h1>
          
          {menu.description && (
            <div className="mb-4 text-gray-600">
              {menu.description}
            </div>
          )}
          
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {menu.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Menu Items</h2>
            <div className="text-gray-600">
              {menu.items?.length || 0} items in this menu
            </div>
          </div>
        </div>
        
        <div>
          <MenuPublish menu={menu} onPublish={handlePublish} />
        </div>
      </div>
    </div>
  );
}
