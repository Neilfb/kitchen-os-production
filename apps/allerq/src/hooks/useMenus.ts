"use client";
import { useState, useCallback, useEffect } from "react";
import { MenuItem } from "@/hooks/useMenuItems";

export interface Menu {
  id: string;
  name: string;
  restaurantId?: string;
  tags?: string[];
  description?: string;
  items?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
  status?: "draft" | "published";
  publishedAt?: string;
  publishedVersion?: number;
}

export interface MenuInput {
  name: string;
  restaurantId?: string;
  tags?: string[];
  description?: string;
  status?: "draft" | "published";
}

interface UpdateMenuOrderInput {
  menuIds: string[];
}

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateMenuOrder = useCallback(async (input: UpdateMenuOrderInput): Promise<boolean> => {
    try {
      const res = await fetch('/api/menus/reorder', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update menu order");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update menu order");
      return false;
    }
  }, []);

  const getMenuById = useCallback(async (id: string, signal?: AbortSignal): Promise<Menu | null> => {
    try {
      const res = await fetch(`/api/menus/${id}`, { signal });
      if (signal?.aborted) return null;
      if (!res.ok) throw new Error("Failed to fetch menu");
      return await res.json();
    } catch (err) {
      if (!signal?.aborted) {
        setError(err instanceof Error ? err.message : "Failed to fetch menu");
      }
      return null;
    }
  }, []);

  const updateMenu = useCallback(async (id: string, input: MenuInput): Promise<Menu | null> => {
    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update menu");
      const updatedMenu = await res.json();
      setMenus(prev => prev.map(menu => menu.id === id ? updatedMenu : menu));
      return updatedMenu;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update menu");
      return null;
    }
  }, []);

  const fetchMenus = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/menus", { signal });
      if (signal?.aborted) return;
      if (!res.ok) throw new Error("Failed to fetch menus");
      const data = await res.json();
      setMenus(data.menus || []);
    } catch (err) {
      if (!signal?.aborted) {
        setError(err instanceof Error ? err.message : "Failed to fetch menus.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const createMenu = useCallback(async (input: MenuInput): Promise<Menu | null> => {
    setLoading(true);
    setError("");
    try {
      console.log("Making request to create menu:", input);
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      
      // Handle non-2xx responses
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = "Failed to create menu";
        
        // Try to get a more specific error message from the response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else {
          // If not JSON, get text error
          const textError = await res.text();
          if (textError) errorMessage = textError;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse success response
      try {
        const responseData = await res.json();
        console.log("Create menu response:", responseData);
        
        if (!responseData.menu) {
          throw new Error("Invalid response format - missing menu data");
        }
        
        setMenus((prev) => [...prev, responseData.menu]);
        return responseData.menu;
      } catch (parseError) {
        console.error("Error parsing create menu response:", parseError);
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create menu";
      console.error("Error creating menu:", errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMenu = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/menus/${id}`, { 
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete menu");
      setMenus((prev) => prev.filter((m) => m.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete menu.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishMenu = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/menus/${id}/publish`, {
        method: "POST",
      });
      
      if (!res.ok) throw new Error("Failed to publish menu");
      
      const { menu } = await res.json();
      setMenus((prev) => prev.map((m) => (m.id === id ? menu : m)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish menu.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchMenus(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [fetchMenus]);

  return { 
    menus, 
    loading, 
    error, 
    fetchMenus, 
    createMenu, 
    deleteMenu, 
    setMenus,
    getMenuById,
    updateMenu,
    publishMenu,
    updateMenuOrder
  };
}
