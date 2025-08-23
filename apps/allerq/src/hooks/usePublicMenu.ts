import { useState, useEffect } from "react";

export interface PublicMenuData {
  restaurantName: string;
  description?: string;
  branding?: { logoUrl?: string };
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
    allergens?: string[];
    dietary?: string[];
    tags?: string[];
  }>;
}

export function usePublicMenu(restaurantId: string) {
  const [menu, setMenu] = useState<PublicMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    async function fetchMenu() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/menus?restaurantId=${restaurantId}`, { signal });
        if (!res.ok) throw new Error("Failed to fetch menu");
        const json = await res.json();
        if (!signal.aborted) {
          setMenu(json.menu || null);
        }
      } catch (err) {
        if (!signal.aborted && err instanceof Error) {
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMenu();

    return () => {
      abortController.abort();
    };
  }, [restaurantId]);

  return { menu, loading, error };
}
