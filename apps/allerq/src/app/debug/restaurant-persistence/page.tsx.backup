"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { useRestaurants } from "@/hooks/useRestaurants";
import { getUserIdFromStorage } from "@/lib/auth";

interface DebugInfo {
  timestamp: string;
  authentication: {
    hasToken: boolean;
    tokenPrefix: string;
    userId: string;
    userIdType: string;
  };
  restaurants: {
    totalInStore: number;
    userSpecific: number;
    allRestaurants: Array<{
      id: string;
      name: string;
      user_id?: string;
      created_at?: string;
    }>;
    userRestaurants: Array<{
      id: string;
      name: string;
      user_id?: string;
      created_at?: string;
    }>;
  };
  userIdConsistency: {
    currentUserId: string;
    restaurantUserIds: string[];
    hasMatchingRestaurants: boolean;
  };
}

export default function RestaurantPersistenceDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testRestaurantName, setTestRestaurantName] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  
  const { restaurants, fetchRestaurants, saveRestaurant } = useRestaurants();

  const checkPersistence = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch('/api/debug/restaurant-persistence', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch debug info');
      }
      
      const data = await response.json();
      setDebugInfo(data.debug);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testRestaurantCreation = async () => {
    if (!testRestaurantName.trim()) {
      setError("Please enter a restaurant name");
      return;
    }

    setLoading(true);
    setError("");
    setTestResult(null);

    try {
      // Create restaurant using the hook
      const restaurant = await saveRestaurant({
        name: testRestaurantName,
        address: "123 Test Street, Test City",
      });

      if (restaurant) {
        // Test persistence by making a direct API call
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch('/api/debug/restaurant-persistence', {
          method: 'POST',
          headers
        });
        
        const testData = await response.json();
        setTestResult(testData.test);
        
        // Refresh debug info
        await checkPersistence();
        
        setTestRestaurantName("");
      } else {
        setError("Failed to create restaurant");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPersistence();
  }, []);

  const currentUserId = getUserIdFromStorage();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Restaurant Persistence Debug</h1>
          <Button onClick={checkPersistence} disabled={loading}>
            <Icons.refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">User ID (Client):</span> {currentUserId || 'None'}
              </div>
              <div>
                <span className="font-medium">Restaurants in Hook:</span> {restaurants.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Restaurant Creation */}
        <Card>
          <CardHeader>
            <CardTitle>Test Restaurant Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Test restaurant name"
                value={testRestaurantName}
                onChange={(e) => setTestRestaurantName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={testRestaurantCreation} disabled={loading || !testRestaurantName.trim()}>
                {loading ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Test Restaurant
              </Button>
            </div>
            
            {testResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test Results:</h4>
                <div className="space-y-2 text-sm">
                  <div>Created Restaurant: {testResult.created?.name} ({testResult.created?.id})</div>
                  <div>User ID: {testResult.userId}</div>
                  <div>Retrieved Count: {testResult.retrievedCount}</div>
                  <div>Found Created Restaurant: {testResult.foundCreatedRestaurant ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        {debugInfo && (
          <>
            {/* Authentication Status */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Has Token:</span>
                    <Badge variant={debugInfo.authentication.hasToken ? "default" : "destructive"}>
                      {debugInfo.authentication.hasToken ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> {debugInfo.authentication.userId}
                  </div>
                  <div>
                    <span className="font-medium">Token Prefix:</span> {debugInfo.authentication.tokenPrefix}
                  </div>
                  <div>
                    <span className="font-medium">User ID Type:</span> {debugInfo.authentication.userIdType}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restaurant Data */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Data Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{debugInfo.restaurants.totalInStore}</div>
                    <div className="text-sm text-gray-600">Total in Store</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{debugInfo.restaurants.userSpecific}</div>
                    <div className="text-sm text-gray-600">User Specific</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {debugInfo.userIdConsistency.hasMatchingRestaurants ? '✅' : '❌'}
                    </div>
                    <div className="text-sm text-gray-600">Has Matching</div>
                  </div>
                </div>

                {/* User ID Consistency */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">User ID Consistency Check:</h4>
                  <div className="space-y-1 text-sm">
                    <div>Current User ID: <code>{debugInfo.userIdConsistency.currentUserId}</code></div>
                    <div>Restaurant User IDs: {debugInfo.userIdConsistency.restaurantUserIds.map(id => 
                      <code key={id} className="mr-2">{id}</code>
                    )}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle>All Restaurants in Store</CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.restaurants.allRestaurants.length === 0 ? (
                  <p className="text-gray-500">No restaurants found</p>
                ) : (
                  <div className="space-y-2">
                    {debugInfo.restaurants.allRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-600">ID: {restaurant.id}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">User: {restaurant.user_id || 'None'}</div>
                          <div className="text-xs text-gray-500">
                            {restaurant.created_at ? new Date(restaurant.created_at).toLocaleString() : 'No date'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="text-xs text-gray-500 text-center">
          Last updated: {debugInfo?.timestamp ? new Date(debugInfo.timestamp).toLocaleString() : 'Never'}
        </div>
      </div>
    </div>
  );
}
