"use client";

import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { 
  Plus, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Edit, 
  Save,
  Wand2,
  Tag,
  Shield
} from "lucide-react";
import { EnhancedMenuItem, MenuItemTag, REGIONAL_ALLERGENS, DIETARY_OPTIONS } from "@/lib/types/menu";
import { MenuCategory } from "@/lib/services/firebaseMenuService";

interface MenuItemEditorProps {
  restaurantId: string;
  menuId: string;
  item?: EnhancedMenuItem;
  onSave?: (item: EnhancedMenuItem) => void;
  onCancel?: () => void;
  region?: 'EU' | 'US' | 'CA' | 'ASIA';
}

export function MenuItemEditor({
  restaurantId,
  menuId,
  item,
  onSave,
  onCancel,
  region = 'EU'
}: MenuItemEditorProps) {
  const { user } = useFirebaseAuth();
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    currency: item?.currency || 'GBP',
    categoryId: item?.categoryId || 'no-category',
    isVisible: item?.isVisible ?? true,
    isAvailable: item?.isAvailable ?? true,
  });

  const [allergenTags, setAllergenTags] = useState<MenuItemTag[]>(
    item?.allergens || []
  );
  const [dietaryTags, setDietaryTags] = useState<MenuItemTag[]>(
    item?.dietary || []
  );

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  const regionalAllergens = REGIONAL_ALLERGENS[region]?.mandatoryAllergens || [];

  // Fetch categories for the menu
  const fetchCategories = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAllergenTag = (allergenId: string, source: 'ai' | 'manual' = 'manual') => {
    const allergen = regionalAllergens.find(a => a.id === allergenId);
    if (!allergen) return;

    const existingTag = allergenTags.find(tag => tag.value === allergenId);
    if (existingTag) return;

    const newTag: MenuItemTag = {
      type: 'allergen',
      value: allergenId,
      source,
      addedAt: new Date().toISOString(),
      confidence: source === 'ai' ? 85 : 100,
    };

    setAllergenTags(prev => [...prev, newTag]);
  };

  const removeAllergenTag = (allergenId: string) => {
    setAllergenTags(prev => prev.filter(tag => tag.value !== allergenId));
  };

  const addDietaryTag = (dietaryId: string, source: 'ai' | 'manual' = 'manual') => {
    const dietary = DIETARY_OPTIONS.find(d => d.id === dietaryId);
    if (!dietary) return;

    const existingTag = dietaryTags.find(tag => tag.value === dietaryId);
    if (existingTag) return;

    const newTag: MenuItemTag = {
      type: 'dietary',
      value: dietaryId,
      source,
      addedAt: new Date().toISOString(),
      confidence: source === 'ai' ? 85 : 100,
    };

    setDietaryTags(prev => [...prev, newTag]);
  };

  const removeDietaryTag = (dietaryId: string) => {
    setDietaryTags(prev => prev.filter(tag => tag.value !== dietaryId));
  };

  const processWithAI = async () => {
    if (!formData.name.trim()) {
      alert('Please enter an item name first');
      return;
    }

    setIsProcessingAI(true);
    try {
      if (!user) {
        alert('Please sign in again');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/ai-process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            name: formData.name,
            description: formData.description,
          }],
        }),
      });

      const data = await response.json();

      if (data.success && data.processedItems.length > 0) {
        setAiSuggestions(data.processedItems[0]);
        setShowAiSuggestions(true);
      } else {
        alert('AI processing failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI processing error:', error);
      alert('Failed to process with AI');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;

    // Apply allergen suggestions
    aiSuggestions.allergenTags?.forEach((tag: MenuItemTag) => {
      addAllergenTag(tag.value, 'ai');
    });

    // Apply dietary suggestions
    aiSuggestions.dietaryTags?.forEach((tag: MenuItemTag) => {
      addDietaryTag(tag.value, 'ai');
    });

    setShowAiSuggestions(false);
    setAiSuggestions(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Item name is required');
      return;
    }

    if (!user) {
      alert('Please sign in again');
      return;
    }

    try {
      const token = await user.getIdToken();

      // Prepare item data
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.categoryId === 'no-category' ? '' : formData.categoryId,
        allergens: allergenTags,
        dietary: dietaryTags,
        isVisible: formData.isVisible,
        order: item?.order || 0,
        processWithAI: false, // AI processing is done separately via the AI button
      };

      let response;
      if (item?.id) {
        // Update existing item
        response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items/${item.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });
      } else {
        // Create new item
        response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save menu item');
      }

      const result = await response.json();

      if (result.success) {
        // Create enhanced menu item for callback
        const savedItem: EnhancedMenuItem = {
          id: result.item.id,
          menuId,
          name: result.item.name,
          description: result.item.description,
          price: result.item.price,
          currency: formData.currency,
          categoryId: result.item.category,
          allergens: result.item.allergens || [],
          dietary: result.item.dietary || [],
          order: result.item.order || 0,
          isVisible: result.item.isVisible,
          isAvailable: result.item.isAvailable || true,
          createdAt: result.item.createdAt,
          updatedAt: result.item.updatedAt,
          regionCompliant: validateRegionalCompliance(),
        };

        onSave?.(savedItem);
      } else {
        alert('Failed to save menu item: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const validateRegionalCompliance = (): boolean => {
    // Basic validation - in a real app, this would be more sophisticated
    const itemText = `${formData.name} ${formData.description}`.toLowerCase();
    
    // Check for common allergen keywords that should be tagged
    const commonAllergens = [
      { keywords: ['milk', 'cheese', 'cream', 'butter'], allergen: 'milk' },
      { keywords: ['egg'], allergen: 'eggs' },
      { keywords: ['wheat', 'flour', 'bread'], allergen: 'gluten' },
      { keywords: ['nut', 'almond', 'walnut'], allergen: 'nuts' },
      { keywords: ['peanut'], allergen: 'peanuts' },
    ];

    for (const check of commonAllergens) {
      const hasKeyword = check.keywords.some(keyword => itemText.includes(keyword));
      const hasTag = allergenTags.some(tag => tag.value.includes(check.allergen));
      
      if (hasKeyword && !hasTag) {
        return false; // Potential compliance issue
      }
    }

    return true;
  };

  const getTagBadgeColor = (tag: MenuItemTag) => {
    if (tag.source === 'ai') {
      return tag.confidence && tag.confidence < 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
    }
    return 'bg-green-100 text-green-800';
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [user, restaurantId, menuId]);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Item Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Margherita Pizza"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="flex space-x-2">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">£</SelectItem>
                    <SelectItem value="USD">$</SelectItem>
                    <SelectItem value="EUR">€</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the dish, ingredients, preparation method..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Category</Label>
              <span className="text-xs text-gray-500">Helps organize your menu</span>
            </div>
            <Select value={formData.categoryId || "no-category"} onValueChange={(value) => handleInputChange('categoryId', value === "no-category" ? "" : value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a category to organize this item" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Organization</p>
                  <SelectItem value="no-category" className="text-gray-700">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                      No Category
                    </div>
                  </SelectItem>
                </div>
                {categories.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs text-gray-600 mb-1">Available Categories</p>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-gray-900">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                )}
                {categories.length === 0 && (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    <p>No categories created yet</p>
                    <p className="text-xs mt-1">Use "Manage Categories" to create some</p>
                  </div>
                )}
              </SelectContent>
            </Select>
            {formData.categoryId && formData.categoryId !== "no-category" && (
              <p className="text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                This item will appear under "{categories.find(c => c.id === formData.categoryId)?.name}" in your menu
              </p>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible"
                checked={formData.isVisible}
                onCheckedChange={(checked) => handleInputChange('isVisible', checked)}
              />
              <Label htmlFor="visible">Visible on menu</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
              />
              <Label htmlFor="available">Currently available</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Allergen Detection</span>
            </div>
            <Button
              onClick={processWithAI}
              disabled={isProcessingAI || !formData.name.trim()}
              variant="outline"
              size="sm"
            >
              {isProcessingAI ? (
                <>
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Let AI analyze your item description and suggest allergen and dietary tags based on {region} regulations.
          </CardDescription>
        </CardHeader>
        {showAiSuggestions && aiSuggestions && (
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">AI Suggestions</h4>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={applyAiSuggestions}>
                    Apply All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAiSuggestions(false)}>
                    Dismiss
                  </Button>
                </div>
              </div>
              
              {aiSuggestions.allergenTags?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-blue-800 mb-2">Suggested Allergens:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.allergenTags.map((tag: MenuItemTag, index: number) => (
                      <Badge key={index} className="bg-red-100 text-red-800">
                        {tag.value} ({tag.confidence}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {aiSuggestions.dietaryTags?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-2">Suggested Dietary Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.dietaryTags.map((tag: MenuItemTag, index: number) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        {tag.value} ({tag.confidence}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Item
        </Button>
      </div>
    </div>
  );
}
