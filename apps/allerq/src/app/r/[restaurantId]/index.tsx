// Dynamic route entry for restaurant public page
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MenuPage from "@/components/MenuPage";
import { use } from 'react';

type Params = Promise<{ restaurantId: string }>;

export default function RestaurantPublicEntry({ params }: { params: Params }) {
  // For client components that are not async, we need to use the React 'use' hook
  // to unwrap the Promise synchronously
  const { restaurantId } = use(params);
  
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">Menu</h1>
        <LanguageSwitcher />
      </div>
      <MenuPage restaurantId={restaurantId} />
    </main>
  );
}
