"use client";

import { useState, useEffect } from "react";
import { useMenuItems, useAllMenuItems } from "@/hooks/useMenuItems";
import { useMenus } from "@/hooks/useMenus";
import MenuItemEditor from "@/components/MenuItemEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Params {
  menuId: string;
}

export default function MenuItemsPage({
  params,
}: {
  params: Params;
}) {
  const { menuItems, loading, error, createMenuItem, updateMenuItem, deleteMenuItem, fetchMenuItems } = useAllMenuItems();
  const { menus, fetchMenus } = useMenus();
  const { toast } = useToast();

  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentMenu, setCurrentMenu] = useState(null);

  useEffect(() => {
    fetchMenuItems();
    fetchMenus();
  }, [fetchMenuItems, fetchMenus]);

  useEffect(() => {
    const menu = menus.find(m => m.id === params.menuId);
    setCurrentMenu(menu);
  }, [menus, params.menuId]);

  const filteredItems = menuItems.filter(item => item.menuId === params.menuId);

  const handleCreateItem = async (data) => {
    try {
      await createMenuItem({
        ...data,
        menuId: params.menuId,
      });
      toast({
        title: "Success",
        description: "Menu item created successfully",
        variant: "success",
      });
      setShowEditor(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create menu item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (data) => {
    if (!editingItem) return;
    
    try {
      await updateMenuItem(editingItem.id, data);
      toast({
        title: "Success",
        description: "Menu item updated successfully",
        variant: "success",
      });
      setShowEditor(false);
      setEditingItem(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    
    try {
      await deleteMenuItem(item.id);
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const openEditor = (item = null) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/menus"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menus
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentMenu?.name || "Menu"} Items
            </h1>
            <p className="text-gray-600">Manage items in this menu</p>
          </div>
        </div>
        <Button
          onClick={() => openEditor()}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No items in this menu yet</p>
          <Button onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditor(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                )}
                {item.price && (
                  <p className="font-semibold text-lg mb-3">£{item.price.toFixed(2)}</p>
                )}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Allergens:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.map((allergen) => (
                        <span
                          key={allergen}
                          className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.dietary && item.dietary.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Dietary:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.dietary.map((diet) => (
                        <span
                          key={diet}
                          className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Menu Item Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <MenuItemEditor
              onClose={closeEditor}
              onSave={editingItem ? handleUpdateItem : handleCreateItem}
              item={editingItem}
              menuId={params.menuId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
