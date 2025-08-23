"use client";
import { useState, useCallback, useEffect } from "react";

// Define MenuItem and MenuItemInput types
export interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description?: string;
  price?: number;
  section?: string;
  isVisible?: boolean;
  tags?: string[];
  allergens?: string[];
  image?: string;
  category?: string;
  dietary?: string[];
  order?: number;
}

export interface MenuItemInput {
  name: string;
  description?: string;
  price?: number;
  section?: string;
  isVisible?: boolean;
  tags?: string[];
  allergens?: string[];
  image?: string;
  category?: string;
  dietary?: string[];
  order?: number;
}

export interface BulkMenuItemAction {
  ids: string[];
  action: "delete" | "move" | "updateCategory" | "reorder";
  data?: {
    category?: string;
    targetMenuId?: string;
    order?: string[];
  };
}

export function useMenuItems(menuId?: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchItems = useCallback(async (signal?: AbortSignal) => {
    if (!menuId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/items`, { signal });
      if (signal?.aborted) return;
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      if (!signal?.aborted) {
        setError(err instanceof Error ? err.message : "Failed to fetch items.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [menuId]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchItems(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [fetchItems]);

  const saveItem = useCallback(
    async (input: MenuItemInput) => {
      setLoading(true);
      try {
        console.log("Sending menu item request:", { menuId, input });
        const res = await fetch(`/api/menus/${menuId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        
        const responseText = await res.text();
        console.log("Raw response:", responseText);

        if (!res.ok) {
          let errorMessage;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || "Failed to save item";
          } catch {
            errorMessage = responseText || "Failed to save item";
          }
          throw new Error(errorMessage);
        }

        const response = JSON.parse(responseText);
        const { item } = response;

        if (!item) {
          throw new Error("Invalid response format - missing item");
        }

        console.log("Successfully created menu item:", item);
        setItems((prev) => [...prev, item]);
        return item;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save item.";
        console.error("Error saving menu item:", message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [menuId],
  );

  const updateItem = useCallback(
    async (itemId: string, input: MenuItemInput) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to update item");
        const { item } = await res.json();
        setItems((prev) => prev.map((i) => (i.id === itemId ? item : i)));
        return item;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update item.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [menuId],
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete item");
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete item.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [menuId],
  );

  const bulkActionItems = useCallback(
    async (action: BulkMenuItemAction) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menus/${menuId}/items/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });
        if (!res.ok) throw new Error("Failed to perform bulk action");
        await res.json();
        
        if (action.action === "delete") {
          setItems((prev) => prev.filter((item) => !action.ids.includes(item.id)));
        } else if (action.action === "updateCategory" && action.data?.category) {
          setItems((prev) =>
            prev.map((item) =>
              action.ids.includes(item.id)
                ? { ...item, category: action.data!.category }
                : item
            )
          );
        } else if (action.action === "reorder" && action.data?.order) {
          const orderMap = new Map(action.data.order.map((id, index) => [id, index]));
          setItems((prev) =>
            prev
              .filter((item) => action.ids.includes(item.id))
              .sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!))
          );
        }
        setSelectedItems([]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to perform bulk ${action.action} action.`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [menuId]
  );

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    saveItem,
    updateItem,
    deleteItem,
    setItems,
    selectedItems,
    toggleItemSelection,
    clearSelection,
    bulkActionItems
  };
}

// General hook for menu items across all menus
export function useAllMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/menu-items');
      if (!res.ok) throw new Error("Failed to fetch menu items");
      const data = await res.json();
      setMenuItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch menu items.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createMenuItem = useCallback(async (input: MenuItemInput & { menuId: string }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/menus/${input.menuId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create menu item");
      const { item } = await res.json();
      setMenuItems(prev => [...prev, item]);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create menu item.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMenuItem = useCallback(async (itemId: string, input: MenuItemInput) => {
    setLoading(true);
    setError("");
    try {
      // Find the menu item to get the menuId
      const item = menuItems.find(i => i.id === itemId);
      if (!item) throw new Error("Menu item not found");

      const res = await fetch(`/api/menus/${item.menuId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update menu item");
      const { item: updatedItem } = await res.json();
      setMenuItems(prev => prev.map(i => i.id === itemId ? updatedItem : i));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update menu item.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuItems]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    setLoading(true);
    setError("");
    try {
      // Find the menu item to get the menuId
      const item = menuItems.find(i => i.id === itemId);
      if (!item) throw new Error("Menu item not found");

      const res = await fetch(`/api/menus/${item.menuId}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete menu item");
      setMenuItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete menu item.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuItems]);

  return {
    menuItems,
    loading,
    error,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}
