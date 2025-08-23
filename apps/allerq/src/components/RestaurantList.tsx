import { useRestaurants, Restaurant } from "../hooks/useRestaurants";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function RestaurantList() {
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    async function loadRestaurants() {
      if (!abortController.signal.aborted) {
        try {
          await fetchRestaurants();
        } catch (err) {
          console.error("Error loading restaurants:", err);
        }
      }
    }

    loadRestaurants();

    return () => {
      abortController.abort();
    };
  }, [fetchRestaurants]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRestaurants();
    setIsRefreshing(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Restaurants</h2>
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition duration-200 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      {loading && !isRefreshing && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && restaurants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M3 7h18"></path>
          </svg>
          <p className="mt-3 text-gray-500">No restaurants found. Click &quot;Add Restaurant&quot; to get started.</p>
          <Link
            href="/restaurants/new"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Add Restaurant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant: Restaurant) => (
            <div 
              key={restaurant.id} 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-40 bg-gray-100 relative">
                {restaurant.logo ? (
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {restaurant.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{restaurant.name}</h3>
                {restaurant.address && <p className="text-gray-600 mb-3 text-sm">{restaurant.address}</p>}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <Link
                    href={`/restaurants/${restaurant.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/restaurants/${restaurant.id}/settings`}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 flex justify-center">
        <Link
          href="/restaurants/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>Add New Restaurant</span>
        </Link>
      </div>
    </div>
  );
}
