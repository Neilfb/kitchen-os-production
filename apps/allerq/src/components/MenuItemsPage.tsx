"use client";

import { useEffect, useState } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import MenuItemEditor from "@/components/MenuItemEditor";
import CategoryManager from "@/components/CategoryManager";
import MenuItemReorder from "@/components/MenuItemReorder";
import MenuItemPreview from "@/components/MenuItemPreview";
import MenuFileUploader from "@/components/MenuFileUploader";
import MenuQRCode from "@/components/MenuQRCode";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import MenuCard from "@/components/MenuCard";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, MenuItemInput } from "@/hooks/useMenuItems";

interface MenuItemsPageProps {
  menuId: string;
  restaurantId: string;
  menuName: string;
  isPublished?: boolean;
}

export default function MenuItemsPage({ 
  menuId, 
  restaurantId, 
  menuName,
  isPublished = false 
}: MenuItemsPageProps) {
  const { toast } = useToast();
  const { items, loading, error, fetchItems, saveItem, updateItem, deleteItem, bulkActionItems } = useMenuItems(menuId);
  const { categories, loading: categoriesLoading, fetchCategories, updateCategories } = useCategories(menuId);
  
  const [editing, setEditing] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    setEditing(item.id);
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    const success = await deleteItem(itemId);
    if (success) {
      await fetchItems();
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
        variant: "success"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  const handleSave = async (data: MenuItemInput) => {
    try {
      if (editing === "new") {
        await saveItem(data);
      } else if (editing) {
        await updateItem(editing, data);
      }
      setEditing(null);
      setEditItem(null);
      await fetchItems();
      toast({
        title: "Success",
        description: "Menu item saved successfully",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive"
      });
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (!selectedCategory || selectedItems.length === 0) return;
    
    const success = await bulkActionItems({
      ids: selectedItems,
      action: "updateCategory",
      data: { category: selectedCategory }
    });

    if (success) {
      toast({
        title: "Success",
        description: "Items updated successfully",
        variant: "success"
      });
      setSelectedItems([]);
      setSelectedCategory(null);
      await fetchItems();
    } else {
      toast({
        title: "Error",
        description: "Failed to update items",
        variant: "destructive"
      });
    }
  };

  const handleSaveReordering = async (reorderedItems: MenuItem[]): Promise<boolean> => {
    try {
      const success = await bulkActionItems({
        ids: reorderedItems.map(item => item.id),
        action: "reorder",
        data: { 
          order: reorderedItems.map(item => item.id)
        }
      });
      
      if (success) {
        toast({
          title: "Success",
          description: "Menu items reordered successfully",
          variant: "success",
        });
        setReordering(false);
        await fetchItems();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error reordering menu items:", err);
      toast({
        title: "Error",
        description: "Failed to save item order",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleExtractedItems = async (extractedItems: Array<MenuItemInput>) => {
    let successCount = 0;
    let errorCount = 0;

    for (const item of extractedItems) {
      try {
        await saveItem(item);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Success",
        description: `Added ${successCount} items to the menu`,
        variant: "success"
      });
      await fetchItems();
    }

    if (errorCount > 0) {
      toast({
        title: "Warning",
        description: `Failed to add ${errorCount} items`,
        variant: "destructive"
      });
    }
  };

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const menuUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${restaurantId}/menu/${menuId}`;

  if (loading || categoriesLoading) return (
    <div className="flex justify-center py-8">
      <Icons.spinner className="h-6 w-6 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-red-600 p-4 text-center">{error}</div>
  );

  return (
    <main className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div className="space-y-4 flex-1">
          <h1 className="text-2xl font-bold">{menuName}</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCategories(!showCategories)}
            >
              <Icons.tag className="mr-2 h-4 w-4" />
              {showCategories ? "Hide Categories" : "Manage Categories"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setReordering(!reordering)}
            >
              <Icons.refresh className="mr-2 h-4 w-4" />
              {reordering ? "Cancel Reordering" : "Reorder Items"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Icons.eye className="mr-2 h-4 w-4" />
              Preview Menu
            </Button>
            {isPublished && (
              <Button
                variant="outline"
                onClick={() => setShowQRCode(true)}
              >
                <Icons.qrCode className="mr-2 h-4 w-4" />
                Show QR Code
              </Button>
            )}
          </div>
        </div>
        <div>
          <Button onClick={() => setEditing("new")} disabled={reordering}>
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* File Uploader */}
      <div className="mb-8">
        <MenuFileUploader
          menuId={menuId}
          onItemsExtracted={handleExtractedItems}
        />
      </div>

      {/* Category Manager */}
      {showCategories && (
        <div className="mb-8">
          <CategoryManager
            menuId={menuId}
            initialCategories={categories}
            onUpdateCategories={updateCategories}
          />
        </div>
      )}

      {/* QR Code */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <MenuQRCode url={menuUrl} restaurantName={menuName} />
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setShowQRCode(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Menu Items */}
      {reordering ? (
        <div className="mb-8">
          <MenuItemReorder
            items={items}
            onSave={handleSaveReordering}
            onClose={() => setReordering(false)}
          />
        </div>
      ) : (
        <div>
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No items found. Add items manually or upload a menu file.
            </div>
          ) : (
            Object.entries(itemsByCategory).map(([category, categoryItems]) => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      dish={item}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item.id)}
                      selected={selectedItems.includes(item.id)}
                      onSelect={() => {
                        setSelectedItems(prev =>
                          prev.includes(item.id)
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Menu Item Editor */}
      {editing && (
        <MenuItemEditor
          menuId={menuId}
          item={editItem || undefined}
          onClose={() => {
            setEditing(null);
            setEditItem(null);
          }}
          onSave={handleSave}
          categories={categories}
        />
      )}

      {/* Menu Preview */}
      {showPreview && (
        <MenuItemPreview 
          items={items} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </main>
  );
}
