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
import { ArrowLeft, Save } from "lucide-react";
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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  allergens: string[];
  dietaryPreferences: string[];
  available: boolean;
}

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  allergens: string[];
  dietaryPreferences: string[];
  available: boolean;
}

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  
  const restaurantId = params.restaurantId as string;
  const menuId = params.menuId as string;
  const itemId = params.itemId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<MenuItem | null>(null);
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

  // Fetch menu item data
  useEffect(() => {
    if (!authLoading && user) {
      fetchMenuItem();
    }
  }, [user, authLoading, itemId]);

  const fetchMenuItem = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "Menu item not found",
            variant: "destructive",
          });
          router.push(`/restaurants/${restaurantId}/menus/${menuId}/items`);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.item) {
        const menuItem = data.item;
        setItem(menuItem);
        setFormData({
          name: menuItem.name || "",
          description: menuItem.description || "",
          price: menuItem.price?.toString() || "",
          category: menuItem.category || "",
          allergens: menuItem.allergens || [],
          dietaryPreferences: menuItem.dietaryPreferences || [],
          available: menuItem.available !== false,
        });
      } else {
        throw new Error(data.error || "Failed to fetch menu item");
      }
    } catch (error) {
      console.error("[EditMenuItem] Error:", error);
      toast({
        title: "Error",
        description: "Failed to load menu item",
        variant: "destructive",
      });
      router.push(`/restaurants/${restaurantId}/menus/${menuId}/items`);
    } finally {
      setLoading(false);
    }
  };

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
        description: "Please sign in to update menu items",
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

    setSaving(true);

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items/${itemId}`, {
        method: 'PATCH',
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
          description: "Menu item updated successfully",
          variant: "default",
        });
        router.push(`/restaurants/${restaurantId}/menus/${menuId}/items`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update menu item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[EditMenuItem] Error:", error);
      toast({
        title: "Error",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Item Not Found</h3>
          <p className="text-gray-600 mb-4">The menu item you're looking for doesn't exist.</p>
          <Link href={`/restaurants/${restaurantId}/menus/${menuId}/items`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu Items
            </Button>
          </Link>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Menu Item</h1>
          <p className="text-gray-600">Update details for "{item.name}"</p>
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

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/restaurants/${restaurantId}/menus/${menuId}/items`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
