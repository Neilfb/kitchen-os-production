'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  ownerId: string;
}

export default function CreateMenuPage() {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main',
  });
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  useEffect(() => {
    // Check for user in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadRestaurant();
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const loadRestaurant = async () => {
    try {
      const customToken = localStorage.getItem('customToken');
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load restaurant');
      }

      setRestaurant(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurant');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const customToken = localStorage.getItem('customToken');
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create menu');
      }

      // Success! Redirect to QR code generation
      router.push(`/en/restaurants/${restaurantId}/qr-codes/new?menuId=${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create menu');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Menu</h1>
              <p className="text-gray-600 mt-1">for {restaurant.name}</p>
            </div>
            <Link href={`/en/restaurants/${restaurantId}`} className="text-gray-600 hover:text-gray-900">
              ← Back to Restaurant
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Menu Information</h2>
                <p className="text-gray-600">Create a menu for your restaurant with allergen-safe options.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Dinner Menu, Lunch Specials, Allergen-Free Options"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="main">Main Menu</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="drinks">Drinks</option>
                    <option value="desserts">Desserts</option>
                    <option value="allergen-free">Allergen-Free</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this menu (optional)"
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <Link
                    href={`/en/restaurants/${restaurantId}`}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Menu'}
                  </button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-900 mb-2">Next Steps</h3>
                <p className="text-sm text-green-700">
                  After creating your menu, you'll be able to generate QR codes that customers can scan to view allergen-safe options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
