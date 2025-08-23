// Menu viewer page for public restaurant menu
import MenuPage from "@/components/MenuPage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { DynamicRouteParams, PublicRestaurantParams } from "@/lib/route-types";

export default function PublicMenuViewer({
  params,
}: DynamicRouteParams<PublicRestaurantParams>) {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Menu</h1>
        <LanguageSwitcher />
      </div>
      <MenuPage restaurantId={params.restaurantId} />
    </main>
  );
}
