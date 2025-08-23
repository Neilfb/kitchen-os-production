import Link from "next/link";
import RestaurantList from "../../components/RestaurantList";

export default function RestaurantsIndex() {
  return (
    <main className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <Link
          href="/restaurants/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Restaurant
        </Link>
      </div>
      <RestaurantList />
    </main>
  );
}
