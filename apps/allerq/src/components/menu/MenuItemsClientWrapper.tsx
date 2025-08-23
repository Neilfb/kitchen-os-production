'use client';

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { MenuItemEditor } from "@/components/menu/MenuItemEditor";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Brain,
  Tag
} from "lucide-react";
import { EnhancedMenuItem, REGIONAL_ALLERGENS, DIETARY_OPTIONS } from "@/lib/types/menu";
import MenuCategoriesManager from "@/components/menu/MenuCategoriesManager";
import { MenuCategory } from "@/lib/services/firebaseMenuService";

interface MenuItemsClientWrapperProps {
  restaurantId: string;
  menuId: string;
}

export default function MenuItemsClientWrapper({
  restaurantId,
  menuId
}: MenuItemsClientWrapperProps) {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [items, setItems] = useState<EnhancedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EnhancedMenuItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [region, setRegion] = useState<'EU' | 'US' | 'CA' | 'ASIA'>('EU');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchMenuItems();
    } else if (!authLoading && !user) {
      setError('Please sign in to view menu items');
      setLoading(false);
    }
  }, [restaurantId, menuId, user, authLoading]);

  const fetchMenuItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      console.log('[MenuItemsWrapper] Fetching menu items with Firebase token');

      // Fetch menu items from API
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Menu or restaurant not found - this is expected for new menus
          setItems([]);
          setRegion('EU'); // Default region
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setItems(data.items || []);
        setRegion(data.region || 'EU');
      } else {
        throw new Error(data.error || 'Failed to fetch menu items');
      }

    } catch (err) {
      console.error('Error fetching menu items:', err);
      // For now, gracefully handle API errors by showing empty state
      // This allows the interface to work even without full API implementation
      setItems([]);
      setRegion('EU');
      console.log('Using fallback empty state due to API error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item: EnhancedMenuItem) => {
    if (!user) {
      alert('Please sign in to save menu items');
      return;
    }

    try {
      const token = await user.getIdToken();

      if (editingItem) {
        // Update existing item (TODO: Implement PUT endpoint)
        console.log('Updating item:', item);
        setItems(prev => prev.map(i => i.id === item.id ? item : i));
      } else {
        // Create new item
        const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setItems(prev => [...prev, data.item]);
          } else {
            alert('Failed to create item: ' + (data.error || 'Unknown error'));
            return;
          }
        } else {
          alert('Failed to create item: HTTP ' + response.status);
          return;
        }
      }

      setEditingItem(null);
      setShowEditor(false);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleEditItem = (item: EnhancedMenuItem) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const handleToggleVisibility = (itemId: string) => {
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, isVisible: !i.isVisible } : i
    ));
  };

  const handleCategoriesChange = (updatedCategories: MenuCategory[]) => {
    setCategories(updatedCategories);
  };

  const handleToggleAvailability = (itemId: string) => {
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
    ));
  };

  const getAllergenName = (allergenId: string) => {
    const allergen = REGIONAL_ALLERGENS[region]?.mandatoryAllergens.find(a => a.id === allergenId);
    return allergen?.name || allergenId;
  };

  const getDietaryName = (dietaryId: string) => {
    const dietary = DIETARY_OPTIONS.find(d => d.id === dietaryId);
    return dietary?.name || dietaryId;
  };

  const getComplianceStatus = (item: EnhancedMenuItem) => {
    if (item.regionCompliant === false) {
      return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600', text: 'Needs Review' };
    }
    if (item.allergens.length > 0 || item.dietary.length > 0) {
      return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600', text: 'Tagged' };
    }
    return { icon: <Tag className="h-4 w-4" />, color: 'text-gray-600', text: 'Untagged' };
  };

  if (showEditor) {
    return (
      <MenuItemEditor
        restaurantId={restaurantId}
        menuId={menuId}
        item={editingItem || undefined}
        onSave={handleSaveItem}
        onCancel={() => {
          setEditingItem(null);
          setShowEditor(false);
        }}
        region={region}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-gray-600">Loading menu items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Menu Items</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchMenuItems} variant="outline">
          <Icons.refresh className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tagged Items</p>
                <p className="text-2xl font-bold">
                  {items.filter(i => i.allergens.length > 0 || i.dietary.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">AI Processed</p>
                <p className="text-2xl font-bold">
                  {items.filter(i => i.aiTagging?.source === 'ai').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Need Review</p>
                <p className="text-2xl font-bold">
                  {items.filter(i => i.regionCompliant === false).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowCategories(!showCategories)}
          >
            <Tag className="h-4 w-4 mr-2" />
            {showCategories ? 'Hide Categories' : 'Manage Categories'}
          </Button>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Categories Manager */}
      {showCategories && (
        <MenuCategoriesManager
          restaurantId={restaurantId}
          menuId={menuId}
          onCategoriesChange={handleCategoriesChange}
        />
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Menu Items Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building your menu by adding items. Use AI-powered allergen detection 
            to automatically tag items based on {region} regulations.
          </p>
          <Button onClick={() => setShowEditor(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const compliance = getComplianceStatus(item);
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          {!item.isVisible && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                          {!item.isAvailable && (
                            <Badge variant="secondary" className="bg-red-100 text-red-600">
                              Unavailable
                            </Badge>
                          )}
                          <Badge variant="outline" className={compliance.color}>
                            {compliance.icon}
                            <span className="ml-1">{compliance.text}</span>
                          </Badge>
                        </div>
                      </div>
                      {item.description && (
                        <CardDescription className="mt-1">
                          {item.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.price && (
                        <span className="text-lg font-semibold">
                          {item.currency === 'GBP' ? '£' : item.currency === 'USD' ? '$' : '€'}
                          {item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Tags */}
                  {(item.allergens.length > 0 || item.dietary.length > 0) && (
                    <div className="space-y-2">
                      {item.allergens.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Allergens:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="bg-red-100 text-red-800 text-xs"
                              >
                                {getAllergenName(tag.value)}
                                {tag.source === 'ai' && tag.confidence && (
                                  <span className="ml-1 opacity-75">({tag.confidence}%)</span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.dietary.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Dietary:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.dietary.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                {getDietaryName(tag.value)}
                                {tag.source === 'ai' && tag.confidence && (
                                  <span className="ml-1 opacity-75">({tag.confidence}%)</span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVisibility(item.id)}
                      >
                        {item.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAvailability(item.id)}
                        className={!item.isAvailable ? 'bg-red-50 text-red-700' : ''}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}


    </div>
  );
}
