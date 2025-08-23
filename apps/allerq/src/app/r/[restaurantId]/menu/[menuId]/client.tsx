"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import {
  Filter,
  AlertTriangle,
  Leaf,
  Heart,
  Zap,
  MapPin,
  Phone,
  Globe,
  AlertCircle
} from "lucide-react";
import { EnhancedMenu, EnhancedMenuItem } from "@/lib/types/menu";

interface PublicMenuViewerProps {
  restaurantId: string;
  menuId: string;
}

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  website?: string;
  logo?: string;
}

export default function PublicMenuViewer({ restaurantId, menuId }: PublicMenuViewerProps) {
  const [menu, setMenu] = useState<EnhancedMenu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<EnhancedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMenuData();
    trackMenuView();
  }, [restaurantId, menuId]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch restaurant info (public endpoint)
      const restaurantResponse = await fetch(`/api/restaurants/${restaurantId}/public`);
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        setRestaurant(restaurantData.restaurant);
      }

      // Fetch menu info (public endpoint)
      const menuResponse = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/public`);
      if (!menuResponse.ok) {
        throw new Error('Menu not found or not published');
      }
      const menuData = await menuResponse.json();
      setMenu(menuData.menu);

      // Fetch menu items (public endpoint)
      const itemsResponse = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items/public`);
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);
      }

    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const trackMenuView = async () => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          menu_id: menuId,
          event_type: 'menu_view',
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
        }),
      });
    } catch (err) {
      console.error('Failed to track menu view:', err);
    }
  };

  const filteredItems = items.filter(item => {
    // Search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Allergen filter (exclude items with selected allergens)
    if (selectedAllergens.length > 0) {
      const itemAllergens = item.allergens || [];
      const hasSelectedAllergen = selectedAllergens.some(allergen => 
        itemAllergens.includes(allergen)
      );
      if (hasSelectedAllergen) {
        return false;
      }
    }

    // Dietary filter (include only items with selected dietary attributes)
    if (selectedDietary.length > 0) {
      const itemDietary = item.dietary || [];
      const hasSelectedDietary = selectedDietary.some(dietary => 
        itemDietary.includes(dietary)
      );
      if (!hasSelectedDietary) {
        return false;
      }
    }

    return true;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, EnhancedMenuItem[]>);

  const getAllergenBadgeColor = (allergen: string) => {
    const colors: Record<string, string> = {
      'gluten': 'bg-red-100 text-red-800',
      'dairy': 'bg-orange-100 text-orange-800',
      'nuts': 'bg-yellow-100 text-yellow-800',
      'shellfish': 'bg-blue-100 text-blue-800',
      'eggs': 'bg-purple-100 text-purple-800',
      'soy': 'bg-green-100 text-green-800',
    };
    return colors[allergen] || 'bg-gray-100 text-gray-800';
  };

  const getDietaryIcon = (dietary: string) => {
    switch (dietary) {
      case 'vegan': return <Leaf className="h-3 w-3" />;
      case 'vegetarian': return <Heart className="h-3 w-3" />;
      case 'keto': return <Zap className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Not Available</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">
          This menu may not be published yet or the link may be incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Restaurant Header */}
      {restaurant && (
        <div className="text-center mb-8">
          {restaurant.logo && (
            <img 
              src={restaurant.logo} 
              alt={restaurant.name}
              className="h-16 w-16 mx-auto mb-4 rounded-full object-cover"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          {restaurant.address && (
            <p className="text-gray-600 flex items-center justify-center mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {restaurant.address}
            </p>
          )}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            {restaurant.contact && (
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {restaurant.contact}
              </span>
            )}
            {restaurant.website && (
              <a 
                href={restaurant.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-600"
              >
                <Globe className="h-4 w-4 mr-1" />
                Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* Menu Header */}
      {menu && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{menu.name}</h2>
          {menu.description && (
            <p className="text-gray-600">{menu.description}</p>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Exclude Allergens</h4>
                  <div className="flex flex-wrap gap-2">
                    {['gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy'].map(allergen => (
                      <Button
                        key={allergen}
                        variant={selectedAllergens.includes(allergen) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedAllergens(prev => 
                            prev.includes(allergen) 
                              ? prev.filter(a => a !== allergen)
                              : [...prev, allergen]
                          );
                        }}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {allergen}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Dietary Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {['vegan', 'vegetarian', 'keto', 'halal'].map(dietary => (
                      <Button
                        key={dietary}
                        variant={selectedDietary.includes(dietary) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedDietary(prev => 
                            prev.includes(dietary) 
                              ? prev.filter(d => d !== dietary)
                              : [...prev, dietary]
                          );
                        }}
                      >
                        {getDietaryIcon(dietary)}
                        <span className="ml-1">{dietary}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Menu Items */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No menu items found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                {category}
              </h3>
              <div className="grid gap-4">
                {categoryItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                        {item.price && (
                          <span className="font-semibold text-lg text-green-600">
                            £{item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 mb-3">{item.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {/* Dietary badges */}
                        {item.dietary?.map(dietary => (
                          <Badge key={dietary} className="bg-green-100 text-green-800">
                            {getDietaryIcon(dietary)}
                            <span className="ml-1">{dietary}</span>
                          </Badge>
                        ))}

                        {/* Allergen warnings */}
                        {item.allergens?.map(allergen => (
                          <Badge key={allergen} className={getAllergenBadgeColor(allergen)}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t text-sm text-gray-500">
        <p>Powered by AllerQ - Smart Menu Management</p>
      </div>
    </div>
  );
}
