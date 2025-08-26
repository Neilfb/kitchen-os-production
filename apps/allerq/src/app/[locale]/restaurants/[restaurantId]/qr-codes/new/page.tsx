'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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

interface Menu {
  id: string;
  name: string;
  description?: string;
  category: string;
  restaurantId: string;
}

export default function CreateQRCodePage() {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = params.restaurantId as string;
  const menuId = searchParams.get('menuId');

  useEffect(() => {
    // Check for user in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadData();
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const loadData = async () => {
    try {
      const customToken = localStorage.getItem('customToken');
      
      // Load restaurant
      const restaurantResponse = await fetch(`/api/restaurants/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json',
        },
      });

      const restaurantData = await restaurantResponse.json();
      if (!restaurantResponse.ok) {
        throw new Error(restaurantData.error || 'Failed to load restaurant');
      }
      setRestaurant(restaurantData.data);

      // Load menu if menuId provided
      if (menuId) {
        const menuResponse = await fetch(`/api/menus/${menuId}`, {
          headers: {
            'Authorization': `Bearer ${customToken}`,
            'Content-Type': 'application/json',
          },
        });

        const menuData = await menuResponse.json();
        if (!menuResponse.ok) {
          throw new Error(menuData.error || 'Failed to load menu');
        }
        setMenu(menuData.data);
        
        // Pre-fill form with menu name
        setFormData(prev => ({
          ...prev,
          name: `QR Code for ${menuData.data.name}`,
          description: `Scan to view ${menuData.data.name} with allergen information`
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          menuId: menuId || undefined,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create QR code');
      }

      setQrCode(data.data.qrCodeUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMenu = () => {
    if (qrCode) {
      // Open the QR code URL in a new tab to show the customer experience
      const qrUrl = qrCode.replace('/qr/', '/menu/');
      window.open(qrUrl, '_blank');
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
              <h1 className="text-3xl font-bold text-gray-900">Generate QR Code</h1>
              <p className="text-gray-600 mt-1">for {restaurant.name}</p>
              {menu && <p className="text-sm text-gray-500">Menu: {menu.name}</p>}
            </div>
            <Link href={`/en/restaurants/${restaurantId}`} className="text-gray-600 hover:text-gray-900">
              ← Back to Restaurant
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!qrCode ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Code Details</h2>
                  <p className="text-gray-600">Create a QR code that customers can scan to view allergen information.</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Table 1 Menu, Allergen-Free Options"
                    />
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
                      placeholder="What customers will see when they scan this QR code"
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
                      {loading ? 'Generating...' : 'Generate QR Code'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-8 text-center">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Code Generated!</h2>
                  <p className="text-gray-600">Your QR code is ready for customers to scan.</p>
                </div>

                <div className="mb-8">
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img src={qrCode} alt="Generated QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleViewMenu}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700"
                  >
                    👀 Preview Customer Experience
                  </button>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      🖨️ Print QR Code
                    </button>
                    <Link
                      href={`/en/restaurants/${restaurantId}/subscription`}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 text-center"
                    >
                      💳 View Subscription Options
                    </Link>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Success! 🎉</h3>
                  <p className="text-sm text-blue-700">
                    Your QR code is ready! Place it on tables, menus, or anywhere customers can easily scan it to view allergen-safe options.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
