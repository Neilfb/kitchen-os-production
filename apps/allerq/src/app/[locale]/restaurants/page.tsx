'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

export default function RestaurantsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadRestaurants();
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const loadRestaurants = async () => {
    try {
      const customToken = localStorage.getItem('customToken');
      const response = await fetch('/api/restaurants', {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load restaurants');
      }

      setRestaurants(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = () => {
    router.push('/restaurants/new');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Restaurants</h1>
            <div className="flex items-center space-x-4">
              <Link href="/en/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <button
                onClick={handleCreateRestaurant}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Restaurant
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {restaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500 text-2xl">🏪</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first restaurant.</p>
              <button
                onClick={handleCreateRestaurant}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
              >
                Add Your First Restaurant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="h-40 bg-gray-100 relative">
                    {restaurant.logoUrl ? (
                      <img
                        src={restaurant.logoUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold">
                        {restaurant.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{restaurant.name}</h3>
                    {restaurant.address && (
                      <p className="text-gray-600 mb-3 text-sm">{restaurant.address}</p>
                    )}
                    {restaurant.phone && (
                      <p className="text-gray-600 mb-3 text-sm">📞 {restaurant.phone}</p>
                    )}
                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <Link
                        href={`/restaurants/${restaurant.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/restaurants/${restaurant.id}/edit`}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
