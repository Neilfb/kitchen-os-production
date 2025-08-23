'use client';

import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Test page to verify multilingual functionality
 * This page should be removed after testing is complete
 */
export default function I18nTestPage() {
  const t = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const tHome = useTranslations('home');
  const tRestaurants = useTranslations('restaurants');
  const tMenus = useTranslations('menus');
  const tAllergens = useTranslations('allergens');
  const tDietary = useTranslations('dietary');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Multilingual Test Page
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href={`/${locale}/dashboard`}>
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Current Locale Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Current Locale</h2>
          <p className="text-blue-800">
            <strong>Locale:</strong> {locale} ({locale === 'en' ? 'English' : 'Español'})
          </p>
        </div>

        {/* Translation Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Common Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Common Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {t('loading')}</p>
              <p><strong>Save:</strong> {t('save')}</p>
              <p><strong>Cancel:</strong> {t('cancel')}</p>
              <p><strong>Delete:</strong> {t('delete')}</p>
              <p><strong>Edit:</strong> {t('edit')}</p>
              <p><strong>Create:</strong> {t('create')}</p>
              <p><strong>Search:</strong> {t('search')}</p>
              <p><strong>Error:</strong> {t('error')}</p>
              <p><strong>Success:</strong> {t('success')}</p>
            </div>
          </div>

          {/* Navigation Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Navigation Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Dashboard:</strong> {tNav('dashboard')}</p>
              <p><strong>Restaurants:</strong> {tNav('restaurants')}</p>
              <p><strong>Menus:</strong> {tNav('menus')}</p>
              <p><strong>QR Codes:</strong> {tNav('qrCodes')}</p>
              <p><strong>Analytics:</strong> {tNav('analytics')}</p>
              <p><strong>Settings:</strong> {tNav('settings')}</p>
              <p><strong>Logout:</strong> {tNav('logout')}</p>
            </div>
          </div>

          {/* Authentication Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Authentication Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Sign In:</strong> {tAuth('signIn')}</p>
              <p><strong>Sign Up:</strong> {tAuth('signUp')}</p>
              <p><strong>Email:</strong> {tAuth('email')}</p>
              <p><strong>Password:</strong> {tAuth('password')}</p>
              <p><strong>Forgot Password:</strong> {tAuth('forgotPassword')}</p>
              <p><strong>Create Account:</strong> {tAuth('createAccount')}</p>
            </div>
          </div>

          {/* Restaurant Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Restaurant Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Create New:</strong> {tRestaurants('createNew')}</p>
              <p><strong>Restaurant Name:</strong> {tRestaurants('restaurantName')}</p>
              <p><strong>Address:</strong> {tRestaurants('address')}</p>
              <p><strong>Phone:</strong> {tRestaurants('phone')}</p>
              <p><strong>Cuisine:</strong> {tRestaurants('cuisine')}</p>
              <p><strong>View Menus:</strong> {tRestaurants('viewMenus')}</p>
            </div>
          </div>

          {/* Menu Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Menu Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Menu Name:</strong> {tMenus('menuName')}</p>
              <p><strong>Add Item:</strong> {tMenus('addItem')}</p>
              <p><strong>Item Price:</strong> {tMenus('itemPrice')}</p>
              <p><strong>Allergens:</strong> {tMenus('allergens')}</p>
              <p><strong>Publish Menu:</strong> {tMenus('publishMenu')}</p>
              <p><strong>View Public Menu:</strong> {tMenus('viewPublicMenu')}</p>
            </div>
          </div>

          {/* Allergen Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Allergen Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Gluten:</strong> {tAllergens('gluten')}</p>
              <p><strong>Dairy:</strong> {tAllergens('dairy')}</p>
              <p><strong>Nuts:</strong> {tAllergens('nuts')}</p>
              <p><strong>Fish:</strong> {tAllergens('fish')}</p>
              <p><strong>Contains:</strong> {tAllergens('contains')}</p>
              <p><strong>Warning:</strong> {tAllergens('warning')}</p>
            </div>
          </div>

          {/* Dietary Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Dietary Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Vegetarian:</strong> {tDietary('vegetarian')}</p>
              <p><strong>Vegan:</strong> {tDietary('vegan')}</p>
              <p><strong>Gluten Free:</strong> {tDietary('glutenFree')}</p>
              <p><strong>Halal:</strong> {tDietary('halal')}</p>
              <p><strong>Kosher:</strong> {tDietary('kosher')}</p>
              <p><strong>Organic:</strong> {tDietary('organic')}</p>
            </div>
          </div>

          {/* Home Page Translations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Home Page Translations</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Title:</strong> {tHome('title')}</p>
              <p><strong>Subtitle:</strong> {tHome('subtitle')}</p>
              <p><strong>Get Started:</strong> {tHome('getStarted')}</p>
              <p><strong>Restaurants Feature:</strong> {tHome('features.restaurants.title')}</p>
              <p><strong>Menus Feature:</strong> {tHome('features.menus.title')}</p>
              <p><strong>QR Studio Feature:</strong> {tHome('features.qrStudio.title')}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Test Instructions</h3>
          <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
            <li>Use the language switcher above to change between English and Spanish</li>
            <li>Verify that all translations change correctly</li>
            <li>Check that the URL updates with the locale (e.g., /en/test-i18n or /es/test-i18n)</li>
            <li>Navigate to other pages and verify the language persists</li>
            <li>Test the browser back/forward buttons to ensure locale routing works</li>
          </ul>
        </div>

        {/* Remove this page notice */}
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            <strong>Note:</strong> This test page should be removed after multilingual functionality is verified.
          </p>
        </div>
      </div>
    </div>
  );
}
