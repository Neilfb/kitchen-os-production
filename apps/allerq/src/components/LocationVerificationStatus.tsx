"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, MapPin } from "lucide-react";

interface LocationVerificationStatusProps {
  verification?: {
    verificationSource: string;
    confidence: number;
    coordinates?: { lat: number; lng: number };
  } | null;
  className?: string;
}

export function LocationVerificationStatus({ 
  verification, 
  className = "" 
}: LocationVerificationStatusProps) {
  const [apiStatus, setApiStatus] = useState<{
    placesActive: boolean;
    geocodingActive: boolean;
  } | null>(null);

  useEffect(() => {
    // Check API status on mount
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/debug/environment');
        const data = await response.json();
        
        if (data.success) {
          setApiStatus({
            placesActive: data.environment.GOOGLE_PLACES_API_KEY.present,
            geocodingActive: data.environment.GOOGLE_GEOCODING_API_KEY.present
          });
        }
      } catch (error) {
        console.error('Failed to check API status:', error);
      }
    };

    checkApiStatus();
  }, []);

  const getLocationStatus = () => {
    if (!verification) {
      return {
        icon: <MapPin className="h-4 w-4 text-gray-400" />,
        badge: <Badge variant="outline">Not Verified</Badge>,
        message: "Enter address to verify location"
      };
    }

    if (verification.verificationSource === 'google_places' || verification.verificationSource === 'google_geocoding') {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        badge: <Badge className="bg-green-100 text-green-800">Location Verified ✓</Badge>,
        message: `Address verified with ${verification.confidence}% confidence`
      };
    }

    return {
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      badge: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Manual Verification</Badge>,
      message: "Address parsed manually - consider improving for billing accuracy"
    };
  };

  const getApiStatus = () => {
    if (!apiStatus) return null;

    if (apiStatus.placesActive && apiStatus.geocodingActive) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        badge: <Badge className="bg-green-100 text-green-800">Address Verified ✓</Badge>,
        message: "Google Places & Geocoding APIs active"
      };
    }

    if (apiStatus.placesActive || apiStatus.geocodingActive) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
        badge: <Badge className="bg-blue-100 text-blue-800">Partial Verification</Badge>,
        message: `${apiStatus.placesActive ? 'Places' : 'Geocoding'} API active`
      };
    }

    return {
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      badge: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Demo Mode</Badge>,
      message: "Using manual address parsing"
    };
  };

  const locationStatus = getLocationStatus();
  const apiStatusInfo = getApiStatus();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Location Verification Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {locationStatus.icon}
          <span className="text-sm font-medium">Location Status</span>
        </div>
        {locationStatus.badge}
      </div>
      
      {verification && (
        <p className="text-xs text-gray-600">{locationStatus.message}</p>
      )}

      {/* API Status (only show if relevant) */}
      {apiStatusInfo && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {apiStatusInfo.icon}
              <span className="text-sm font-medium">Address Verification</span>
            </div>
            {apiStatusInfo.badge}
          </div>
          <p className="text-xs text-gray-600">{apiStatusInfo.message}</p>
        </>
      )}
    </div>
  );
}
