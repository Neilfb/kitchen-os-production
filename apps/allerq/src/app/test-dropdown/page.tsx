'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddressVerification from '@/components/AddressVerification';

export default function TestDropdownPage() {
  const [address, setAddress] = useState('');
  const [verification, setVerification] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Address Dropdown UX Test
          </h1>
          <p className="text-gray-600 mb-4">
            Test the improved address verification dropdown styling and UX
          </p>

          {/* Demo Mode Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Demo Mode Active</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Google Places API not configured. Address suggestions will use fallback mode.
            </p>
          </div>
        </div>

        {/* Test Card - Simulates Restaurant Setup Form */}
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-xl text-blue-900">
              🏪 Restaurant Setup Test
            </CardTitle>
            <p className="text-blue-700 text-sm">
              This simulates the restaurant creation form where the dropdown overlay issue occurred.
            </p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Restaurant Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter restaurant name..."
                defaultValue="Test Restaurant"
              />
            </div>

            {/* Address Verification Component */}
            <AddressVerification
              address={address}
              onAddressChange={setAddress}
              onVerificationComplete={setVerification}
              placeholder="Start typing an address to see dropdown suggestions..."
              required
            />

            {/* Website Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Website (Optional)
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourrestaurant.com"
              />
            </div>

            {/* Additional Form Content */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Background Content</h3>
              <p className="text-gray-600 text-sm mb-2">
                This background content should be visually separated from the dropdown when it appears.
                The previous issue was that dropdown suggestions would blend with this content, making
                it difficult to distinguish between the suggestions and the form fields.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium">Sample Field 1</p>
                  <p className="text-xs text-gray-500">Some content here</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium">Sample Field 2</p>
                  <p className="text-xs text-gray-500">More content here</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Create Restaurant
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">🧪 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How to Test the Dropdown:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Click in the "Restaurant Address" field above</li>
                <li>Start typing a longer address (e.g., "123 Main Street" or "40 High Street")</li>
                <li><strong>Demo Mode:</strong> Suggestions will appear for addresses starting with numbers</li>
                <li>Notice the improved visual separation and styling</li>
                <li>Click outside the dropdown or on the backdrop to close it</li>
                <li>Try the "Verify Address" button to test manual address parsing</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Fixed Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li><strong>Backdrop Overlay:</strong> Semi-transparent backdrop dims background content</li>
                <li><strong>Visual Separation:</strong> Strong border and shadow distinguish dropdown from form</li>
                <li><strong>Proper Z-Index:</strong> Dropdown appears above all other content (z-50)</li>
                <li><strong>Enhanced Contrast:</strong> Blue color scheme and clear typography</li>
                <li><strong>Smooth Animations:</strong> Fade-in backdrop and slide-in dropdown</li>
                <li><strong>Click-to-Close:</strong> Click backdrop or outside to close dropdown</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎨 Visual Improvements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Dropdown header with "Address Suggestions" label</li>
                <li>Blue hover states for better interactivity feedback</li>
                <li>MapPin icons with coordinated colors</li>
                <li>Proper spacing and typography hierarchy</li>
                <li>Rounded corners and modern styling</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {verification && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">📍 Verification Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(verification, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
