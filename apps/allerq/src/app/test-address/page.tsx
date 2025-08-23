'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAddressPage() {
  const [address, setAddress] = useState('40 Ardaveen Ave, Newry BT35 8UJ, UK');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAddress = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/location/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error testing address:', error);
      setResult({ error: 'Failed to test address' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Address Verification Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Address Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Address to Test:</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address to test..."
            />
          </div>
          <Button onClick={testAddress} disabled={loading}>
            {loading ? 'Testing...' : 'Test Address'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="text-red-600">
                <p><strong>Error:</strong> {result.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-600">Verified</p>
                    <p className="font-bold">{result.result?.verification?.verified ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-600">Confidence</p>
                    <p className="font-bold">{result.result?.verification?.confidence}%</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm text-purple-600">Completeness</p>
                    <p className="font-bold">{result.result?.verification?.completeness?.score}%</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-yellow-600">Status</p>
                    <p className="font-bold">{result.result?.verification?.completeness?.isComplete ? 'Complete' : 'Incomplete'}</p>
                  </div>
                </div>

                {/* Address Components */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Parsed Address Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Street Number</p>
                      <p className="font-medium">{result.result?.verification?.components?.streetNumber || 'Not found'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Street Name</p>
                      <p className="font-medium">{result.result?.verification?.components?.streetName || 'Not found'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium">{result.result?.verification?.components?.city || 'Not found'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">State/Province</p>
                      <p className="font-medium">{result.result?.verification?.components?.state || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Postal Code</p>
                      <p className="font-medium">{result.result?.verification?.components?.postalCode || 'Not found'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-medium">{result.result?.verification?.components?.country || 'Not found'}</p>
                    </div>
                  </div>
                </div>

                {/* Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded ${result.result?.analysis?.hasStreetNumber ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <p className="text-sm">Street Number</p>
                      <p className="font-bold">{result.result?.analysis?.hasStreetNumber ? '✓ Found' : '✗ Missing'}</p>
                    </div>
                    <div className={`p-3 rounded ${result.result?.analysis?.hasStreetName ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <p className="text-sm">Street Name</p>
                      <p className="font-bold">{result.result?.analysis?.hasStreetName ? '✓ Found' : '✗ Missing'}</p>
                    </div>
                    <div className={`p-3 rounded ${result.result?.analysis?.hasCity ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <p className="text-sm">City</p>
                      <p className="font-bold">{result.result?.analysis?.hasCity ? '✓ Found' : '✗ Missing'}</p>
                    </div>
                    <div className={`p-3 rounded ${result.result?.analysis?.hasPostalCode ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <p className="text-sm">Postal Code</p>
                      <p className="font-bold">{result.result?.analysis?.hasPostalCode ? '✓ Found' : '✗ Missing'}</p>
                    </div>
                    <div className={`p-3 rounded ${result.result?.analysis?.hasCountry ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <p className="text-sm">Country</p>
                      <p className="font-bold">{result.result?.analysis?.hasCountry ? '✓ Found' : '✗ Missing'}</p>
                    </div>
                    <div className={`p-3 rounded ${!result.result?.analysis?.requiresState || result.result?.analysis?.hasState ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                      <p className="text-sm">State Required</p>
                      <p className="font-bold">{result.result?.analysis?.requiresState ? (result.result?.analysis?.hasState ? '✓ Found' : '⚠ Missing') : '✓ Not Required'}</p>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {result.result?.verification?.completeness?.issues?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Issues Found</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {result.result.verification.completeness.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-red-600">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Raw Data */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Show Raw Response Data
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
