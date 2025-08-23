'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface ApiStatus {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
  responseTime?: number;
}

export default function ApiStatusPage() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([
    { endpoint: '/api/menus (GET)', status: 'pending' },
    { endpoint: '/api/menus (POST)', status: 'pending' }
  ]);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTested, setLastTested] = useState<string | null>(null);

  const checkEndpoints = async () => {
    setIsTesting(true);
    
    // Create a new copy of statuses to update
    const newStatuses = [...statuses.map(s => ({ ...s, status: 'pending' as const }))];
    setStatuses(newStatuses);

    // Check GET /api/menus
    try {
      const startTime = performance.now();
      const getRes = await fetch('/api/menus');
      const endTime = performance.now();
      
      if (getRes.ok) {
        const data = await getRes.json();
        newStatuses[0] = {
          endpoint: '/api/menus (GET)',
          status: 'success',
          message: `Found ${data.menus?.length || 0} menus`,
          responseTime: Math.round(endTime - startTime)
        };
      } else {
        newStatuses[0] = {
          endpoint: '/api/menus (GET)',
          status: 'error',
          message: `Error ${getRes.status}: ${getRes.statusText}`,
          responseTime: Math.round(endTime - startTime)
        };
      }
    } catch (error) {
      newStatuses[0] = {
        endpoint: '/api/menus (GET)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setStatuses([...newStatuses]);

    // Check POST /api/menus
    try {
      const startTime = performance.now();
      const postRes = await fetch('/api/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Test Menu ${new Date().toISOString()}`,
          description: 'Test menu created by API status checker',
          tags: ['test', 'diagnostic']
        })
      });
      const endTime = performance.now();
      
      const responseData = await postRes.json();
      
      if (postRes.ok) {
        newStatuses[1] = {
          endpoint: '/api/menus (POST)',
          status: 'success',
          message: `Created menu with ID: ${responseData.menu?.id || 'unknown'}`,
          responseTime: Math.round(endTime - startTime)
        };
      } else {
        newStatuses[1] = {
          endpoint: '/api/menus (POST)',
          status: 'error',
          message: `Error: ${responseData.error || `${postRes.status}: ${postRes.statusText}`}`,
          responseTime: Math.round(endTime - startTime)
        };
      }
    } catch (error) {
      newStatuses[1] = {
        endpoint: '/api/menus (POST)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setStatuses([...newStatuses]);
    
    setIsTesting(false);
    setLastTested(new Date().toLocaleString());
  };

  useEffect(() => {
    // Initial check when the component mounts
    checkEndpoints();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Status</h1>
        <Button 
          onClick={checkEndpoints}
          disabled={isTesting}
        >
          {isTesting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Endpoints'
          )}
        </Button>
      </div>
      
      {lastTested && (
        <p className="text-sm text-gray-500">Last checked: {lastTested}</p>
      )}
      
      <div className="grid gap-4">
        {statuses.map((status, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <span className="flex-1">{status.endpoint}</span>
                {status.status === 'success' && (
                  <span className="text-green-500 flex items-center">
                    <Icons.check className="mr-1 h-4 w-4" />
                    OK
                  </span>
                )}
                {status.status === 'error' && (
                  <span className="text-red-500 flex items-center">
                    <Icons.x className="mr-1 h-4 w-4" />
                    Failed
                  </span>
                )}
                {status.status === 'pending' && (
                  <span className="text-amber-500 flex items-center">
                    <Icons.spinner className="mr-1 h-4 w-4 animate-spin" />
                    Checking
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status.message && (
                <p className={status.status === 'error' ? 'text-red-600' : 'text-gray-600'}>
                  {status.message}
                </p>
              )}
              {status.responseTime !== undefined && (
                <p className="text-sm text-gray-500 mt-1">
                  Response time: {status.responseTime}ms
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
