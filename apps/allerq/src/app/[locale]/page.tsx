"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Main landing page that directs users to the key features of the app
export default function Home() {
  const t = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const tHome = useTranslations('home');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation bar */}
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <Image
            src="/file.svg"
            alt="Kitchen OS AllerQ Logo"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold text-blue-800">Kitchen OS - AllerQ</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <button
            onClick={() => window.location.href = "/restaurants"}
            className="text-gray-600 hover:text-blue-800">
            {tNav('dashboard')}
          </button>
          <button
            onClick={() => window.location.href = "/auth/login"}
            className="px-4 py-2 text-white bg-blue-800 rounded-md hover:bg-blue-700">
            {tAuth('signIn')}
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <div className="container px-6 py-16 mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-800 md:text-5xl lg:text-6xl">
          {tHome('title')}
        </h1>
        <p className="mt-6 text-xl text-gray-600 md:text-2xl">
          {tHome('subtitle')}
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          <Link href="/restaurants"
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <Image src="/file.svg" alt="Restaurants" width={48} height={48} />
            <h2 className="text-xl font-semibold mt-4">{tHome('features.restaurants.title')}</h2>
            <p className="text-gray-600 text-sm mt-2">{tHome('features.restaurants.description')}</p>
          </Link>

          <Link href="/menus"
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <Image src="/file.svg" alt="Menus" width={48} height={48} />
            <h2 className="text-xl font-semibold mt-4">{tHome('features.menus.title')}</h2>
            <p className="text-gray-600 text-sm mt-2">{tHome('features.menus.description')}</p>
          </Link>

          <Link href="/qr-studio"
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <Image src="/file.svg" alt="QR Studio" width={48} height={48} />
            <h2 className="text-xl font-semibold mt-4">{tHome('features.qrStudio.title')}</h2>
            <p className="text-gray-600 text-sm mt-2">{tHome('features.qrStudio.description')}</p>
          </Link>
        </div>

        {/* Call to action */}
        <div className="mt-16">
          <button
            onClick={() => window.location.href = "/auth/signup"}
            className="px-6 py-3 text-white bg-blue-800 rounded-md hover:bg-blue-700 text-lg font-medium">
            {tHome('getStarted')}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 mt-24 text-center bg-gray-100">
        <p className="text-gray-600">{tHome('footer')} - Kitchen OS Platform v2.3</p>
      </footer>
    </div>
  );
}
