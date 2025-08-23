"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAddressVerification } from '@/hooks/useAddressVerification';
import { LocationVerification, PlaceDetails } from '@/lib/location/googlePlaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, MapPin, Loader2 } from 'lucide-react';

interface AddressVerificationProps {
  initialAddress?: string;
  onVerificationComplete?: (verification: LocationVerification) => void;
  onAddressChange?: (address: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function AddressVerification({
  initialAddress = '',
  onVerificationComplete,
  onAddressChange,
  required = false,
  placeholder = 'Enter restaurant address...',
  className = '',
}: AddressVerificationProps) {
  const [address, setAddress] = useState(initialAddress);
  const [verification, setVerification] = useState<LocationVerification | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceDetails[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  
  const { verifyAddress, searchPlaces, loading, error } = useAddressVerification();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle address input changes
  const handleAddressChange = (value: string) => {
    setAddress(value);
    setVerification(null);
    setHasVerified(false);
    onAddressChange?.(value);

    // Search for suggestions if address is long enough
    if (value.length >= 3) {
      searchForSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Search for address suggestions
  const searchForSuggestions = async (query: string) => {
    try {
      console.log(`[AddressVerification] Searching for suggestions: ${query}`);
      const places = await searchPlaces(query);
      console.log(`[AddressVerification] Found ${places.length} suggestions`);
      setSuggestions(places);
      setShowSuggestions(places.length > 0);
    } catch (err) {
      console.error('[AddressVerification] Error searching for suggestions:', err);
      // Don't show error to user for autocomplete failures, just hide suggestions
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (place: PlaceDetails) => {
    setAddress(place.formatted_address);
    setShowSuggestions(false);
    onAddressChange?.(place.formatted_address);
    
    // Auto-verify the selected address
    handleVerifyAddress(place.formatted_address);
  };

  // Verify the current address
  const handleVerifyAddress = async (addressToVerify?: string) => {
    const targetAddress = addressToVerify || address;
    
    if (!targetAddress.trim()) {
      return;
    }

    try {
      const result = await verifyAddress(targetAddress);
      if (result) {
        setVerification(result);
        setHasVerified(true);
        onVerificationComplete?.(result);
      }
    } catch (err) {
      console.error('Error verifying address:', err);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get verification status icon and color
  const getVerificationStatus = () => {
    if (!hasVerified) {
      return { icon: null, color: '', text: '' };
    }

    if (!verification) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        color: 'text-red-600',
        text: 'Verification failed'
      };
    }

    if (verification.verified) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-green-600',
        text: `Verified (${verification.confidence}% confidence)`
      };
    }

    return {
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-yellow-600',
      text: `Needs review (${verification.confidence}% confidence)`
    };
  };

  const status = getVerificationStatus();

  return (
    <div className={`relative ${className}`}>
      {/* Address Input */}
      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Restaurant Address {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <Input
            ref={inputRef}
            id="address"
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={`pr-10 ${status.color ? `border-${status.color.split('-')[1]}-300` : ''}`}
          />
          
          {/* Status Icon */}
          {status.icon && (
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${status.color}`}>
              {status.icon}
            </div>
          )}
        </div>

        {/* Verification Status */}
        {hasVerified && (
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 text-sm ${status.color}`}>
              {status.icon}
              <span>{status.text}</span>
            </div>

            {/* Address Completeness Issues */}
            {verification && verification.completeness && !verification.completeness.isComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      Address Needs Improvement for Billing Accuracy
                    </h4>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <p>Completeness Score: {verification.completeness.score}%</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {verification.completeness.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                      <p className="mt-2 font-medium">
                        💡 Please provide a complete street address with building number for accurate location-based billing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message for Complete Addresses */}
            {verification && verification.completeness && verification.completeness.isComplete && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    ✅ Complete address verified for accurate billing
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* API Configuration Notice - Check via verification result instead of env var */}
        {verification && verification.verificationSource === 'manual' && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-3 w-3" />
              <span>
                <strong>Demo Mode:</strong> Google Places API not configured. Address verification will use manual parsing.
              </span>
            </div>
          </div>
        )}

        {/* Verify Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleVerifyAddress()}
          disabled={!address.trim() || loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Verify Address
            </>
          )}
        </Button>
      </div>

      {/* Address Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-5 z-40 animate-in fade-in duration-200"
            onClick={() => setShowSuggestions(false)}
          />

          {/* Suggestions dropdown */}
          <Card
            className="absolute z-50 w-full top-full mt-1 max-h-60 overflow-y-auto shadow-xl border-2 border-blue-200 bg-white rounded-lg animate-in slide-in-from-top-2 duration-200"
            ref={suggestionsRef}
            style={{
              top: inputRef.current ? inputRef.current.offsetTop + inputRef.current.offsetHeight + 4 : 'calc(100% + 4px)'
            }}
          >
            <CardContent className="p-0">
              {/* Dropdown Header */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Address Suggestions
                  </span>
                </div>
              </div>

              {/* Suggestions List */}
              {suggestions.map((place, index) => (
                <button
                  key={place.place_id || index}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-colors duration-150 group"
                  onClick={() => handleSuggestionSelect(place)}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0 group-hover:text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-900">
                        {place.name || 'Address'}
                      </div>
                      <div className="text-sm text-gray-600 truncate group-hover:text-blue-700">
                        {place.formatted_address}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Verification Details */}
      {verification && hasVerified && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Formatted Address:</span>
                <div className="text-gray-900">{verification.formattedAddress}</div>
              </div>
              
              {verification.coordinates.lat !== 0 && verification.coordinates.lng !== 0 && (
                <div>
                  <span className="text-gray-500">Coordinates:</span>
                  <div className="text-gray-900">
                    {verification.coordinates.lat.toFixed(6)}, {verification.coordinates.lng.toFixed(6)}
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-gray-500">Verification Source:</span>
                <div className="text-gray-900 capitalize">
                  {verification.verificationSource.replace('_', ' ')}
                </div>
              </div>
              
              <div>
                <span className="text-gray-500">Confidence Score:</span>
                <div className="text-gray-900">{verification.confidence}%</div>
              </div>

              <div>
                <span className="text-gray-500">Address Completeness:</span>
                <div className={`text-gray-900 ${verification.completeness.isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                  {verification.completeness.score}% {verification.completeness.isComplete ? '(Complete)' : '(Needs Improvement)'}
                </div>
              </div>

              {verification.completeness.issues.length > 0 && (
                <div>
                  <span className="text-gray-500">Issues to Address:</span>
                  <ul className="text-gray-900 text-sm list-disc list-inside mt-1">
                    {verification.completeness.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
