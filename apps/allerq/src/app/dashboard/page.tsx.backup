"use client";

import { useState, useEffect, Suspense } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { safeMap, debugArrayState, useArrayDebug } from "@/utils/safeArray";
import RoleTestComponent from "@/components/RoleTestComponent";

function DashboardContent() {
  const { user, logout, loading: isLoading } = useFirebaseAuth();
  const { restaurants, loading, error } = useRestaurants();

  // Debug restaurants array state and extract array if needed
  debugArrayState('restaurants-raw', restaurants);

  // Handle case where restaurants might be a response object instead of array
  let restaurantsArray = restaurants;
  if (restaurants && typeof restaurants === 'object' && !Array.isArray(restaurants)) {
    console.log('[Dashboard] Restaurants is object, extracting array:', restaurants);
    restaurantsArray = restaurants.data || restaurants.restaurants || [];
  }

  const safeRestaurants = useArrayDebug('restaurants', restaurantsArray);

  const isSuperadmin = false; // TODO: Implement superadmin logic for Firebase
  const isInitialized = !isLoading;
  const searchParams = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<{
    name: string;
    status: string;
    isUpgraded: boolean;
  }>({ name: 'Free Plan', status: 'Limited features', isUpgraded: false });

  useEffect(() => {
    // Check for subscription status in URL params
    const subscription = searchParams.get('subscription');
    if (subscription === 'success') {
      setSubscriptionMessage('success');
      setCurrentPlan({
        name: 'Standard Plan',
        status: 'All features unlocked',
        isUpgraded: true
      });
    } else if (subscription === 'skipped') {
      setSubscriptionMessage('skipped');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state while authentication is being restored or data is loading
  if (isLoading || !isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading || !isInitialized ? "Verifying your authentication..." : "Loading your dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated after initialization
  if (isInitialized && !user) {
    window.location.href = '/auth/login';
    return null;
  }

  // Show error state if there's an error loading restaurants
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">AllerQ Dashboard</h1>
              {isSuperadmin && (
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Superadmin
                </span>
              )}
            </div>
            
            {/* Burger Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user?.name || user?.email}
                  </div>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <Link href="/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Billing & Subscriptions
                  </Link>
                  <Link href="/people" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    People
                  </Link>
                  {isSuperadmin && (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <div className="px-4 py-2 text-xs text-purple-600 font-medium uppercase tracking-wide">
                        Superadmin
                      </div>
                      <Link href="/super-admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        System Management
                      </Link>
                      <Link href="/super-admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        User Management
                      </Link>
                      <Link href="/super-admin/restaurants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        All Restaurants
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Messages */}
        {subscriptionMessage && (
          <div className={`mb-6 p-4 rounded-md ${
            subscriptionMessage === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex">
              <svg className={`h-5 w-5 mr-3 mt-0.5 ${
                subscriptionMessage === 'success' ? 'text-green-400' : 'text-blue-400'
              }`} fill="currentColor" viewBox="0 0 20 20">
                {subscriptionMessage === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                )}
              </svg>
              <div>
                <h3 className={`text-sm font-medium ${
                  subscriptionMessage === 'success' ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {subscriptionMessage === 'success'
                    ? 'Subscription activated successfully!'
                    : 'You can upgrade anytime'
                  }
                </h3>
                <p className={`text-sm mt-1 ${
                  subscriptionMessage === 'success' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {subscriptionMessage === 'success'
                    ? 'You now have access to all AllerQ features including AI allergen tagging and unlimited QR scans.'
                    : 'You\'re using AllerQ with limited features. Upgrade to unlock AI allergen tagging, unlimited QR scans, and analytics.'
                  }
                </p>
                {subscriptionMessage === 'skipped' && (
                  <Link
                    href="/subscription-setup"
                    className="text-sm text-blue-600 hover:text-blue-500 underline mt-2 inline-block"
                  >
                    Choose a plan now →
                  </Link>
                )}
              </div>
              <button
                onClick={() => setSubscriptionMessage(null)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Manage your restaurants and menus from your dashboard
          </p>
        </div>



        {/* Subscription Status Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                  <p className={`font-medium ${currentPlan.isUpgraded ? 'text-green-600' : 'text-blue-600'}`}>
                    {currentPlan.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentPlan.status} {!currentPlan.isUpgraded && '• Upgrade to unlock AI allergen tagging'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/billing"
                  className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-md hover:bg-blue-50 font-medium transition-colors"
                >
                  Manage Plan
                </Link>
                <Link
                  href="/subscription-setup"
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentPlan.isUpgraded
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {currentPlan.isUpgraded ? 'Change Plan' : 'Upgrade Now'}
                </Link>
              </div>
            </div>
          </div>
        </div>



        {/* Restaurants Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Restaurants</h3>
            <Link
              href="/restaurants/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Add Restaurant
            </Link>
          </div>

          {safeRestaurants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first restaurant</p>
              <Link
                href="/restaurants/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Add Your First Restaurant
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeMap(safeRestaurants, (restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  {/* Header with Logo */}
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {restaurant.logoUrl ? (
                        <img
                          src={restaurant.logoUrl}
                          alt={`${restaurant.name} logo`}
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Restaurant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {restaurant.name}
                        </h4>
                        {/* Status Badge - Simplified for Firebase */}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {restaurant.address}
                      </p>
                      {restaurant.website && (
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline inline-flex items-center"
                        >
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/restaurants/${restaurant.id}/edit`}
                      className="bg-gray-100 text-gray-700 text-center py-2 px-3 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                      Edit Restaurant
                    </Link>
                    <Link
                      href={`/restaurants/${restaurant.id}/menus`}
                      className="bg-blue-600 text-white text-center py-2 px-3 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Manage Menus
                    </Link>
                    <Link
                      href={`/restaurants/${restaurant.id}/qr-codes`}
                      className="bg-green-600 text-white text-center py-2 px-3 rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      QR Codes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


          <Link
            href="/qr-studio"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">QR Studio</h3>
            <p className="text-gray-600">Generate custom QR codes</p>
          </Link>

          <Link
            href="/analytics"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">View your restaurant insights</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
