"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { clientRestaurantService } from "@/lib/services/clientRestaurantService";
import AddressVerification from "@/components/AddressVerification";
import { LocationVerification } from "@/lib/location/googlePlaces";
import { useToast } from "@/hooks/use-toast";

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading: isLoading } = useFirebaseAuth();
  const isInitialized = !isLoading;
  const { toast } = useToast();
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantWebsite, setRestaurantWebsite] = useState("");
  const [restaurantLogo, setRestaurantLogo] = useState<File | null>(null);
  const [addressVerification, setAddressVerification] = useState<LocationVerification | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("Logo file size must be less than 10MB");
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }
      setRestaurantLogo(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication state
    if (!isInitialized) {
      setError("Please wait while we verify your authentication...");
      return;
    }

    if (!user) {
      setError("Please sign in to create a restaurant");
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a restaurant",
        variant: "destructive",
      });
      router.push('/signin');
      return;
    }

    if (!restaurantName.trim()) {
      setError("Restaurant name is required");
      return;
    }
    if (!restaurantAddress.trim()) {
      setError("Restaurant address is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Process logo upload if provided
      let logoUrl = '';
      if (restaurantLogo) {
        try {
          console.log('🖼️ [Welcome] Processing logo upload...');
          const { processLogoUpload } = await import('@/lib/fileUpload');
          logoUrl = await processLogoUpload(restaurantLogo, user.uid);
          console.log('✅ [Welcome] Logo uploaded successfully');
        } catch (uploadError) {
          console.error('❌ [Welcome] Logo upload failed:', uploadError);
          setError('Failed to upload logo. Restaurant will be created without logo.');
          // Continue with restaurant creation even if logo fails
        }
      }

      // Use standardized restaurant creation approach
      const restaurantData = {
        name: restaurantName,
        address: restaurantAddress,
        website: restaurantWebsite,
        logoUrl: logoUrl, // Include the uploaded logo URL
        location: addressVerification &&
                 addressVerification.coordinates &&
                 typeof addressVerification.coordinates.lat === 'number' &&
                 typeof addressVerification.coordinates.lng === 'number' ? {
          lat: addressVerification.coordinates.lat,
          lng: addressVerification.coordinates.lng,
          formatted: addressVerification.formattedAddress,
          placeId: addressVerification.placeId
        } : undefined,
      };

      console.log('🔍 [Welcome] Creating restaurant with authenticated user:', user.email, 'with logo:', !!logoUrl);
      const restaurant = await clientRestaurantService.createRestaurant(user.uid, restaurantData);

      if (restaurant?.id) {
        console.log('✅ [Welcome] Restaurant created successfully:', restaurant.id);
        toast({
          title: "Success",
          description: "Restaurant created successfully!",
        });

        // Use Next.js router for navigation to preserve authentication state
        // Navigate directly to dashboard to let users experience the platform first
        setTimeout(() => {
          console.log('✅ [Welcome] Navigating to dashboard to let user experience platform first');
          router.push(`/dashboard/restaurants/${restaurant.id}`);
        }, 500);
      } else {
        throw new Error("Failed to create restaurant");
      }
    } catch (err) {
      console.error("Error creating restaurant:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create restaurant. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while authentication is being restored
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated after initialization
  if (isInitialized && !user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AllerQ!
          </h1>
          <p className="text-gray-600">
            Hi {user?.name || user?.email}! Let's get your first restaurant set up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Name */}
          <div>
            <label htmlFor="restaurantName" className="block mb-2 font-medium">
              Restaurant Name *
            </label>
            <input
              id="restaurantName"
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Enter your restaurant name"
            />
          </div>

          {/* Restaurant Address with Verification */}
          <AddressVerification
            initialAddress={restaurantAddress}
            onAddressChange={setRestaurantAddress}
            onVerificationComplete={setAddressVerification}
            required={true}
            placeholder="Enter your restaurant address..."
          />

          {/* Restaurant Website */}
          <div>
            <label htmlFor="restaurantWebsite" className="block mb-2 font-medium">
              Restaurant Website
              <span className="text-gray-500 font-normal"> (Optional)</span>
            </label>
            <input
              id="restaurantWebsite"
              type="url"
              value={restaurantWebsite}
              onChange={(e) => setRestaurantWebsite(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="https://yourrestaurant.com"
            />
          </div>

          {/* Restaurant Logo */}
          <div>
            <label htmlFor="restaurantLogo" className="block mb-2 font-medium">
              Restaurant Logo
              <span className="text-gray-500 font-normal"> (Optional, you can add this later)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <input
                id="restaurantLogo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <label
                htmlFor="restaurantLogo"
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              >
                Click to upload from device
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Max size: 2MB, Recommended: 400x400px
              </p>
              {restaurantLogo && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {restaurantLogo.name} selected
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {isLoading ? 'Verifying Authentication...' : loading ? 'Creating Restaurant...' : 'Create Restaurant'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            You can always add more restaurants later from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
