import { useState, useCallback } from "react";

export interface Category {
  id: string;
  name: string;
  order: number;
}

export function useCategories(menuId: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setError("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  const updateCategories = useCallback(async (updatedCategories: Category[]) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updatedCategories }),
      });
      if (!res.ok) throw new Error("Failed to update categories");
      const data = await res.json();
      setCategories(data.categories);
      return true;
    } catch {
      setError("Failed to update categories.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    updateCategories,
  };
}
