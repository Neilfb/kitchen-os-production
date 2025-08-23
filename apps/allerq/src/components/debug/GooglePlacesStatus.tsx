"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface EnvironmentStatus {
  NODE_ENV: string;
  VERCEL: boolean;
  VERCEL_ENV: string;
  GOOGLE_PLACES_API_KEY: {
    present: boolean;
    length: number;
    prefix: string;
  };
  GOOGLE_GEOCODING_API_KEY: {
    present: boolean;
    length: number;
    prefix: string;
  };
  demoMode: boolean;
  googlePlacesDemo: boolean;
  timestamp: string;
}

export function GooglePlacesStatus() {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkEnvironment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/debug/environment');
      const data = await response.json();

      if (data.success) {
        setStatus(data.environment);
      } else {
        setError(data.error || 'Failed to check environment');
      }
    } catch (err) {
      console.error('Environment check failed:', err);
      setError('Failed to check environment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (isActive: boolean, label: string) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">{label} Active</Badge>;
    }
    return <Badge variant="destructive">{label} Inactive</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Checking Google Places API Status...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Icons.spinner className="h-4 w-4 animate-spin" />
            <span>Loading environment status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Environment Check Failed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={checkEnvironment} variant="outline">
            <Icons.refresh className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Google Places API Status</span>
          {status.googlePlacesDemo ? (
            <Badge variant="destructive">Demo Mode</Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800">Production Mode</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Environment:</span> {status.NODE_ENV}
          </div>
          <div>
            <span className="font-medium">Platform:</span> {status.VERCEL ? `Vercel (${status.VERCEL_ENV})` : 'Local'}
          </div>
        </div>

        {/* API Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.GOOGLE_PLACES_API_KEY.present)}
              <span className="font-medium">Google Places API</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(status.GOOGLE_PLACES_API_KEY.present, 'Places')}
              {status.GOOGLE_PLACES_API_KEY.present && (
                <span className="text-xs text-gray-600">
                  Key: {status.GOOGLE_PLACES_API_KEY.prefix}... ({status.GOOGLE_PLACES_API_KEY.length} chars)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.GOOGLE_GEOCODING_API_KEY.present)}
              <span className="font-medium">Google Geocoding API</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(status.GOOGLE_GEOCODING_API_KEY.present, 'Geocoding')}
              {status.GOOGLE_GEOCODING_API_KEY.present && (
                <span className="text-xs text-gray-600">
                  Key: {status.GOOGLE_GEOCODING_API_KEY.prefix}... ({status.GOOGLE_GEOCODING_API_KEY.length} chars)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Demo Mode Warning */}
        {status.googlePlacesDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Google Places API in Demo Mode</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              The Google Places API key is not configured. Address verification will use fallback mode with limited functionality.
            </p>
          </div>
        )}

        {/* Success Message */}
        {!status.googlePlacesDemo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Google Places API Active</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              All Google APIs are properly configured and ready for production use.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Last checked: {new Date(status.timestamp).toLocaleString()}
        </div>

        <Button onClick={checkEnvironment} variant="outline" className="w-full">
          <Icons.refresh className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
}
