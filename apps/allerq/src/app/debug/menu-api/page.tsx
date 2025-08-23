'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function MenuApiTester() {
  const [name, setName] = useState('Test Menu');
  const [description, setDescription] = useState('This is a test menu');
  const [tags, setTags] = useState('test, api');
  const [restaurantId, setRestaurantId] = useState('test-restaurant');
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestTime, setRequestTime] = useState<number | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRequestTime(null);
    
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const payload = {
      name,
      description,
      tags: tagArray,
      restaurantId: restaurantId || undefined,
    };

    console.log('Sending request with payload:', payload);
    
    try {
      const startTime = performance.now();
      
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const endTime = performance.now();
      setRequestTime(Math.round(endTime - startTime));
      
      if (!res.ok) {
        let errorMessage;
        
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
        } catch (e) {
          errorMessage = `HTTP error! status: ${res.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error testing menu API:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Menu API Tester</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Menu Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Menu Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter menu name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter menu description"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags (comma-separated)
              </label>
              <Input
                id="tags"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="restaurantId" className="text-sm font-medium">
                Restaurant ID (optional)
              </label>
              <Input
                id="restaurantId"
                value={restaurantId}
                onChange={e => setRestaurantId(e.target.value)}
                placeholder="Enter restaurant ID"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleTest} disabled={loading}>
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Menu Creation'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Testing API...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
              </div>
            ) : response ? (
              <div className="space-y-4">
                {requestTime && (
                  <div className="text-sm text-gray-500">
                    Request completed in {requestTime}ms
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[400px]">
                  <pre className="text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
                {response.menu && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
                    <h3 className="font-bold">Menu created successfully!</h3>
                    <p>Menu ID: {response.menu.id}</p>
                    <p>Name: {response.menu.name}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center p-6">
                Click "Test Menu Creation" to see the API response
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
