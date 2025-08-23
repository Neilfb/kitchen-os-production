"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { clientRestaurantService } from "@/lib/services/clientRestaurantService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { processFileUpload } from "@/lib/fileUpload";
import { createWebsiteBlurHandler } from "@/lib/utils/urlUtils";

export default function CreateRestaurantPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    description: "",
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/signin");
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await processFileUpload(file);
      setLogoFile(file);
      setLogoPreview(result.base64);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process logo file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to create a restaurant",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Restaurant name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Error",
        description: "Restaurant address is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const restaurantData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        logoUrl: logoPreview || "",
        ownerId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("[CreateRestaurant] Creating restaurant with data:", restaurantData);

      const restaurant = await clientRestaurantService.createRestaurant(restaurantData);

      if (restaurant) {
        toast({
          title: "Success",
          description: "Restaurant created successfully",
          variant: "default",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("[CreateRestaurant] Error:", error);
      toast({
        title: "Error",
        description: "Failed to create restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          href="/dashboard"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Restaurant</h1>
          <p className="text-gray-600">Add a new restaurant to your account</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., The Golden Spoon"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g., 123 Main Street, London, UK"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g., +44 20 1234 5678"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                onBlur={createWebsiteBlurHandler((value) => setFormData(prev => ({ ...prev, website: value })))}
                placeholder="e.g., www.goldenspoon.com (https:// will be added automatically)"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your restaurant..."
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Logo
              </label>
              <div className="flex items-center space-x-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Restaurant"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
