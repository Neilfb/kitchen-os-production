// src/components/AnalyticsTrackingExample.tsx
// Example component showing how to use analytics tracking

"use client";

import React, { useEffect } from 'react';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

interface AnalyticsTrackingExampleProps {
  restaurantId?: number;
  menuId?: number;
}

export default function AnalyticsTrackingExample({ 
  restaurantId = 1, 
  menuId = 1 
}: AnalyticsTrackingExampleProps) {
  const {
    trackPageView,
    trackMenuItemClick,
    trackQRScan,
    trackAllergenFilter,
    trackSearch,
    trackSessionStart,
    trackCustomEvent,
  } = useAnalyticsTracking();

  // Track page view when component mounts
  useEffect(() => {
    trackPageView(restaurantId, menuId, {
      page: 'analytics-example',
      timestamp: Date.now(),
    });
  }, [trackPageView, restaurantId, menuId]);

  const handleMenuItemClick = async () => {
    await trackMenuItemClick(restaurantId, menuId, 'item-123', {
      itemName: 'Margherita Pizza',
      category: 'Pizza',
      price: 12.99,
    });
    alert('Menu item click tracked!');
  };

  const handleQRScan = async () => {
    await trackQRScan(restaurantId, menuId, 'qr-456', {
      scanLocation: 'table-5',
      scanTime: new Date().toISOString(),
    });
    alert('QR scan tracked!');
  };

  const handleAllergenFilter = async () => {
    await trackAllergenFilter(restaurantId, menuId, ['gluten', 'dairy'], {
      filterAction: 'apply',
      resultCount: 15,
    });
    alert('Allergen filter tracked!');
  };

  const handleSearch = async () => {
    await trackSearch(restaurantId, menuId, 'pizza', {
      searchCategory: 'menu-items',
      resultCount: 8,
    });
    alert('Search tracked!');
  };

  const handleSessionStart = async () => {
    await trackSessionStart(restaurantId, menuId, {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
    });
    alert('Session start tracked!');
  };

  const handleCustomEvent = async () => {
    await trackCustomEvent('button_click', restaurantId, menuId, {
      buttonName: 'custom-analytics-test',
      clickTime: Date.now(),
    });
    alert('Custom event tracked!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Analytics Tracking Example</h2>
      <p className="text-gray-600 mb-6">
        This component demonstrates how to use the analytics tracking system.
        Restaurant ID: {restaurantId}, Menu ID: {menuId}
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={handleMenuItemClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Track Menu Item Click
        </button>
        
        <button
          onClick={handleQRScan}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Track QR Scan
        </button>
        
        <button
          onClick={handleAllergenFilter}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Track Allergen Filter
        </button>
        
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Track Search
        </button>
        
        <button
          onClick={handleSessionStart}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
        >
          Track Session Start
        </button>
        
        <button
          onClick={handleCustomEvent}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Track Custom Event
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Page view is automatically tracked when component mounts</li>
          <li>• Each button demonstrates a different type of analytics event</li>
          <li>• Events are sent to /api/analytics/track endpoint</li>
          <li>• In demo mode, events are logged to console</li>
          <li>• In production, events are sent to NoCodeBackend analytics table</li>
        </ul>
      </div>
    </div>
  );
}
