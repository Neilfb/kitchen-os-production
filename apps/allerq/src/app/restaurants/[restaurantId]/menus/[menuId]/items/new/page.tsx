"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Allergen options based on EU regulations
const ALLERGENS = [
  'Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soybeans', 
  'Milk', 'Nuts', 'Celery', 'Mustard', 'Sesame', 'Sulphites', 
  'Lupin', 'Molluscs'
];

// Dietary preference options
const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Halal', 'Kosher', 'Low-Carb', 'Keto', 'Paleo'
];

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  allergens: string[];
  dietaryPreferences: string[];
  available: boolean;
}

export default function CreateMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  
  const restaurantId = params.restaurantId as string;
  const menuId = params.menuId as string;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    allergens: [],
    dietaryPreferences: [],
    available: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  const handleInputChange = (field: keyof MenuItemFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleDietaryToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to create menu items",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      toast({
        title: "Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category.trim() || 'Main Course',
          allergens: formData.allergens,
          dietaryPreferences: formData.dietaryPreferences,
          available: formData.available,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Menu item created successfully",
          variant: "default",
        });
        router.push(`/restaurants/${restaurantId}/menus/${menuId}/items`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create menu item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[CreateMenuItem] Error:", error);
      toast({
        title: "Error",
        description: "Failed to create menu item. Please try again.",
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
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          href={`/restaurants/${restaurantId}/menus/${menuId}/items`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu Items
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Menu Item</h1>
          <p className="text-gray-600">Create a new item for your menu</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Grilled Salmon"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (£) *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., 18.50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Main Course, Starter, Dessert"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => handleInputChange('available', checked as boolean)}
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">
                  Available for ordering
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the dish, ingredients, cooking method..."
                rows={3}
              />
            </div>

            {/* Allergens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allergens
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ALLERGENS.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergen-${allergen}`}
                      checked={formData.allergens.includes(allergen)}
                      onCheckedChange={() => handleAllergenToggle(allergen)}
                    />
                    <label htmlFor={`allergen-${allergen}`} className="text-sm text-gray-700">
                      {allergen}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dietary Preferences
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DIETARY_PREFERENCES.map((preference) => (
                  <div key={preference} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dietary-${preference}`}
                      checked={formData.dietaryPreferences.includes(preference)}
                      onCheckedChange={() => handleDietaryToggle(preference)}
                    />
                    <label htmlFor={`dietary-${preference}`} className="text-sm text-gray-700">
                      {preference}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/restaurants/${restaurantId}/menus/${menuId}/items`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Menu Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
