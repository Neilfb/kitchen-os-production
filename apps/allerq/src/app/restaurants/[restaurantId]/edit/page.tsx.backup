"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { ArrowLeft, Save } from "lucide-react";
import AddressVerification from "@/components/AddressVerification";
import { LocationVerificationStatus } from "@/components/LocationVerificationStatus";
import { LocationVerification } from "@/lib/location/googlePlaces";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { clientRestaurantService, Restaurant } from "@/lib/services/clientRestaurantService";

interface EditRestaurantPageProps {
  params: Promise<{ restaurantId: string }>;
}

export default function EditRestaurantPage({ params }: EditRestaurantPageProps) {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    website: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [addressVerification, setAddressVerification] = useState<LocationVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setRestaurantId(resolvedParams.restaurantId);
    });
  }, [params]);

  // Fetch restaurant data
  useEffect(() => {
    if (!restaurantId || !user) return;

    const fetchRestaurant = async () => {
      try {
        const fetchedRestaurant = await clientRestaurantService.getRestaurant(restaurantId, user.uid);

        if (!fetchedRestaurant) {
          setError("Restaurant not found or you don't have access to it.");
          return;
        }

        setRestaurant(fetchedRestaurant);
        setFormData({
          name: fetchedRestaurant.name || "",
          address: fetchedRestaurant.address || "",
          contact: fetchedRestaurant.phone || "",
          website: fetchedRestaurant.website || "",
        });
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Logo file size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }
      setLogoFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Restaurant name is required");
      return;
    }

    if (!user) {
      setError('Please sign in again');
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updateData: Partial<Restaurant> = {
        name: formData.name,
        address: formData.address,
        phone: formData.contact,
        website: formData.website,
      };

      if (logoFile) {
        // Process logo upload
        const { processLogoUpload } = await import('@/lib/fileUpload');
        const logoUrl = await processLogoUpload(logoFile, user.uid);
        updateData.logoUrl = logoUrl;
      }

      if (addressVerification) {
        updateData.location = {
          lat: addressVerification.coordinates.lat,
          lng: addressVerification.coordinates.lng,
          formatted: addressVerification.address,
          placeId: addressVerification.placeId,
        };
      }

      const updatedRestaurant = await clientRestaurantService.updateRestaurant(
        restaurantId,
        user.uid,
        updateData
      );

      if (updatedRestaurant) {
        router.push('/dashboard');
      } else {
        setError('Failed to update restaurant');
      }
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError('Failed to update restaurant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Restaurant</h1>
            <p className="text-gray-600">Update restaurant information and settings</p>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter restaurant name"
                />
              </div>

            {/* Address with Verification */}
            <AddressVerification
              initialAddress={formData.address}
              onAddressChange={(address) => setFormData(prev => ({ ...prev, address }))}
              onVerificationComplete={setAddressVerification}
              required={false}
              placeholder="Enter restaurant address..."
            />

            {/* Location Verification Status */}
            <LocationVerificationStatus
              verification={addressVerification}
              className="bg-gray-50 p-3 rounded-lg border"
            />

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Enter contact number"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourrestaurant.com"
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Restaurant Logo</Label>
              <div className="flex items-center space-x-4">
                {restaurant.logoUrl && (
                  <img
                    src={restaurant.logoUrl}
                    alt="Current logo"
                    className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: 2MB, Recommended: 400x400px
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <Link href="/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
    </div>
  );
}
