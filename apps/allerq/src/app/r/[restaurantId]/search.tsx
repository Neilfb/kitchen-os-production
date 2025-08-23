// Dish & allergen search UI for public menu
import MenuPage from "@/components/MenuPage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DishSearch from "@/components/DishSearch";

type Params = Promise<{ restaurantId: string }>;

export default async function PublicMenuSearch({ params }: { params: Params }) {
  const { restaurantId } = await params;
  
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">Menu Search</h1>
        <LanguageSwitcher />
      </div>
      <DishSearch restaurantId={restaurantId} />
      <div className="mt-6">
        <MenuPage restaurantId={restaurantId} />
      </div>
    </main>
  );
}
