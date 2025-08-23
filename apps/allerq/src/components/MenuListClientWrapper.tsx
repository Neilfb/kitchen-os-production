'use client';

import MenuList from "./MenuList";
import { EnhancedMenuList } from "./menu/EnhancedMenuList";

/**
 * Client component wrapper for MenuList
 * This isolates the client-side hooks from server components
 */
export default function MenuListClientWrapper({ restaurantId, publicView }: {
  restaurantId?: string;
  publicView?: boolean;
}) {
  // Use enhanced menu list for restaurant-specific menu management
  if (restaurantId && !publicView) {
    return <EnhancedMenuList restaurantId={restaurantId} />;
  }

  // Use original menu list for public view or general menu listing
  return <MenuList restaurantId={restaurantId} publicView={publicView} />;
}
