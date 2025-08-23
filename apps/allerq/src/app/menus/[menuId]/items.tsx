"use client";

// List & edit items for a menu
import { useEffect, useState } from "react";
import { useMenuItems, MenuItem, MenuItemInput } from "../../../hooks/useMenuItems";
import MenuItemEditor from "../../../components/MenuItemEditor";
import CategoryManager from "@/components/CategoryManager";
import MenuItemReorder from "@/components/MenuItemReorder";
import MenuItemPreview from "@/components/MenuItemPreview";
import { use } from "react";
import { ClientRouteParams } from "@/lib/route-utils";
import MenuCard from "@/components/MenuCard";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

type Params = ClientRouteParams<{ menuId: string }>;

export default function MenuItemsPage({ params }: { params: Params }) {
  const { menuId } = use(params);
  const { items, loading, error, fetchItems, saveItem, updateItem, deleteItem, bulkActionItems } = useMenuItems(menuId);
  const { categories, loading: categoriesLoading, fetchCategories, updateCategories } = useCategories(menuId);
  const [editing, setEditing] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

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
    }
  };

  const handleSave = async (data: MenuItemInput) => {
    if (editing === "new") {
      await saveItem(data);
    } else if (editing) {
      await updateItem(editing, data);
    }
    setEditing(null);
    setEditItem(null);
    await fetchItems();
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
    }
  };

  // Handler for saving reordered items
  const handleSaveReordering = async (reorderedItems: MenuItem[]) => {
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to save item order",
        variant: "destructive",
      });
      return false;
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

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Menu Items</h1>
          <div className="mt-2 space-x-2">
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
            {selectedItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkCategoryUpdate}
                disabled={!selectedCategory}
              >
                Move Selected to Category
              </Button>
            )}
          </div>
        </div>
        <Button onClick={() => setEditing("new")} disabled={reordering}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {showCategories && (
        <div className="mb-8">
          <CategoryManager
            menuId={menuId}
            initialCategories={categories}
            onUpdateCategories={updateCategories}
          />
        </div>
      )}

      {reordering ? (
        <div className="mb-8">
          <MenuItemReorder
            items={items}
            onSave={handleSaveReordering}
            onClose={() => setReordering(false)}
          />
        </div>
      ) : (
        <>
          {(loading || categoriesLoading) && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No items found. Click "Add Item" to create your first menu item.
            </div>
          ) : (
            Object.entries(itemsByCategory).map(([category, categoryItems]) => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item: MenuItem) => (
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
        </>
      )}

      {editing && (
        <MenuItemEditor
          menuId={menuId}
          itemId={editing === "new" ? null : editing}
          item={editItem || undefined}
          onClose={() => {
            setEditing(null);
            setEditItem(null);
          }}
          onSave={handleSave}
          categories={categories}
        />
      )}
      
      {showPreview && (
        <MenuItemPreview 
          items={items} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </main>
  );
}
