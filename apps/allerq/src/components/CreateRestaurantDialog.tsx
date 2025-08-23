"use client";

import { useState } from "react";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import AddressVerification from "@/components/AddressVerification";
import { LocationVerificationStatus } from "@/components/LocationVerificationStatus";
import { LocationVerification } from "@/lib/location/googlePlaces";
import { normalizeWebsiteUrl } from "@/lib/utils/urlUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface CreateRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (restaurantId: string) => void;
}

export function CreateRestaurantDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateRestaurantDialogProps) {
  const { saveRestaurant } = useRestaurants();
  const { user, loading: isLoading } = useFirebaseAuth();
  const isInitialized = !isLoading;
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    website: "",
  });
  const [addressVerification, setAddressVerification] = useState<LocationVerification | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setLogoFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      return;
    }

    if (!formData.name.trim()) {
      setError("Restaurant name is required");
      return;
    }

    setError("");
    setIsCreating(true);
    try {
      // For now, convert logo to base64 for storage
      // TODO: Implement proper file upload service
      let logoUrl = '';
      if (logoFile) {
        try {
          // Convert file to base64 data URL
          const reader = new FileReader();
          logoUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(logoFile);
          });
          console.log('🖼️ Logo converted to base64 successfully');
        } catch (uploadError) {
          console.error('Logo conversion failed:', uploadError);
          setError('Failed to process logo. Please try again.');
          return;
        }
      }

      // Include address verification data if available
      const restaurantData = {
        name: formData.name,
        address: formData.address,
        website: formData.website,
        phone: formData.contact,
        logoUrl: logoUrl,
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

      console.log('🔍 Creating restaurant with authenticated user:', user.email);
      const restaurant = await saveRestaurant(restaurantData);

      if (restaurant?.id) {
        console.log('✅ Restaurant created successfully:', restaurant.id);
        toast({
          title: "Success",
          description: "Restaurant created successfully!",
        });
        onSuccess?.(restaurant.id);
        onOpenChange(false);
        // Reset form
        setFormData({ name: "", address: "", contact: "", website: "" });
        setAddressVerification(null);
        setLogoFile(null);
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
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create New Restaurant
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Restaurant Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter restaurant name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Restaurant Address with Verification */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Restaurant Address
            </Label>
            <AddressVerification
              initialAddress={formData.address}
              onAddressChange={(address) => setFormData(prev => ({ ...prev, address }))}
              onVerificationComplete={setAddressVerification}
              required={false}
              placeholder="Enter restaurant address..."
            />
          </div>

          {/* Location Verification Status */}
          {addressVerification && (
            <LocationVerificationStatus
              verification={addressVerification}
              className="bg-blue-50 p-4 rounded-lg border border-blue-200"
            />
          )}

          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
              Contact Number
            </Label>
            <Input
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium text-gray-700">
              Website
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="yourrestaurant.com (https:// will be added automatically)"
              onBlur={(e) => {
                if (e.target.value) {
                  const normalizedUrl = normalizeWebsiteUrl(e.target.value);
                  setFormData(prev => ({ ...prev, website: normalizedUrl }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo" className="text-sm font-medium text-gray-700">
              Restaurant Logo
            </Label>
            <div className="flex items-center space-x-4">
              {logoFile && (
                <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo preview"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 10MB, Recommended: 400x400px
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <DialogFooter className="pt-4 border-t border-gray-200 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isLoading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isCreating || isLoading) && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLoading ? "Verifying Authentication..." : isCreating ? "Creating..." : "Create Restaurant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
