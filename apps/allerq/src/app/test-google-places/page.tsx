"use client";

import { useState } from "react";
import AddressVerification from "@/components/AddressVerification";
import { LocationVerification } from "@/lib/location/googlePlaces";

export default function TestGooglePlacesPage() {
  const [address, setAddress] = useState("");
  const [verification, setVerification] = useState<LocationVerification | null>(null);
  const [testResults, setTestResults] = useState<{
    apiKeyPresent: boolean;
    demoMode: boolean;
    confidenceScore: number;
    verificationSource: string;
    suggestions: any[];
  } | null>(null);

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
  };

  const handleVerificationComplete = (result: LocationVerification) => {
    setVerification(result);
    setTestResults({
      apiKeyPresent: result.verificationSource === 'google_places',
      demoMode: result.verificationSource === 'manual',
      confidenceScore: result.confidence,
      verificationSource: result.verificationSource,
      suggestions: [] // Will be populated by manual testing
    });
  };

  const testApiDirectly = async () => {
    try {
      const response = await fetch('/api/location/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: '123 Main Street, London' })
      });
      
      const data = await response.json();
      console.log('Direct API test result:', data);
      
      if (data.verification) {
        setVerification(data.verification);
        setTestResults({
          apiKeyPresent: data.verification.verificationSource === 'google_places',
          demoMode: data.verification.verificationSource === 'manual',
          confidenceScore: data.verification.confidence,
          verificationSource: data.verification.verificationSource,
          suggestions: []
        });
      }
    } catch (error) {
      console.error('Direct API test failed:', error);
    }
  };

  const testSearchSuggestions = async () => {
    try {
      const response = await fetch('/api/location/verify?q=123 Main Street');
      const data = await response.json();
      console.log('Search suggestions test:', data);
      
      if (data.places) {
        setTestResults(prev => prev ? {
          ...prev,
          suggestions: data.places
        } : null);
      }
    } catch (error) {
      console.error('Search suggestions test failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Google Places API Integration Test
          </h1>
          
          {/* Environment Check */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Environment Status
            </h2>
            <p className="text-blue-800">
              Testing production environment: <strong>https://aller-q-forge.vercel.app</strong>
            </p>
            <p className="text-blue-800">
              Expected: Google Places API should be active (not demo mode)
            </p>
          </div>

          {/* Test Controls */}
          <div className="mb-6 space-y-4">
            <button
              onClick={testApiDirectly}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-4"
            >
              Test API Directly
            </button>
            <button
              onClick={testSearchSuggestions}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Test Search Suggestions
            </button>
          </div>

          {/* Address Verification Component */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Interactive Address Verification Test
            </h2>
            <AddressVerification
              initialAddress={address}
              onAddressChange={handleAddressChange}
              onVerificationComplete={handleVerificationComplete}
              placeholder="Type an address to test (e.g., '123 Main Street, London')"
              required={false}
            />
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Test Results
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-md ${testResults.apiKeyPresent ? 'bg-green-100' : 'bg-red-100'}`}>
                  <h3 className="font-medium">API Key Status</h3>
                  <p className={testResults.apiKeyPresent ? 'text-green-800' : 'text-red-800'}>
                    {testResults.apiKeyPresent ? '✅ Google Places API Active' : '❌ Using Fallback Mode'}
                  </p>
                </div>
                
                <div className={`p-3 rounded-md ${!testResults.demoMode ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <h3 className="font-medium">Demo Mode</h3>
                  <p className={!testResults.demoMode ? 'text-green-800' : 'text-yellow-800'}>
                    {!testResults.demoMode ? '✅ Production Mode' : '⚠️ Demo Mode Active'}
                  </p>
                </div>
                
                <div className={`p-3 rounded-md ${testResults.confidenceScore >= 70 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <h3 className="font-medium">Confidence Score</h3>
                  <p className={testResults.confidenceScore >= 70 ? 'text-green-800' : 'text-yellow-800'}>
                    {testResults.confidenceScore}% 
                    {testResults.confidenceScore >= 70 ? ' ✅ Good' : ' ⚠️ Low'}
                  </p>
                </div>
                
                <div className="p-3 rounded-md bg-blue-100">
                  <h3 className="font-medium">Verification Source</h3>
                  <p className="text-blue-800">
                    {testResults.verificationSource === 'google_places' ? '🌐 Google Places API' : '📝 Manual Parsing'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Verification Results */}
          {verification && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Verification Results
              </h2>
              
              <div className="space-y-2 text-sm">
                <p><strong>Original Address:</strong> {verification.address}</p>
                <p><strong>Formatted Address:</strong> {verification.formattedAddress}</p>
                <p><strong>Verified:</strong> {verification.verified ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Confidence:</strong> {verification.confidence}%</p>
                <p><strong>Source:</strong> {verification.verificationSource}</p>
                <p><strong>Coordinates:</strong> {verification.coordinates.lat}, {verification.coordinates.lng}</p>
                {verification.placeId && (
                  <p><strong>Place ID:</strong> {verification.placeId}</p>
                )}
                
                <div className="mt-4">
                  <h4 className="font-medium">Address Components:</h4>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(verification.addressComponents, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium">Completeness Analysis:</h4>
                  <p>Score: {verification.completeness.score}%</p>
                  <p>Complete: {verification.completeness.isComplete ? '✅ Yes' : '❌ No'}</p>
                  {verification.completeness.issues.length > 0 && (
                    <div>
                      <p>Issues:</p>
                      <ul className="list-disc list-inside">
                        {verification.completeness.issues.map((issue, index) => (
                          <li key={index} className="text-red-600">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Manual Testing Instructions
            </h2>
            <ol className="list-decimal list-inside text-yellow-800 space-y-1">
              <li>Type a real address in the field above (e.g., "123 Main Street, London")</li>
              <li>Check if autocomplete suggestions appear as you type</li>
              <li>Verify suggestions look like real places (not generic fallback data)</li>
              <li>Select a suggestion and check the confidence score (should be 70-90%)</li>
              <li>Verify the verification source shows "google_places" not "manual"</li>
              <li>Check browser console for any API errors</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
