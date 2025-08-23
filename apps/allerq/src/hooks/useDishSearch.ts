// Search/filter dishes by name or allergen for public menu
import { useState, useCallback } from "react";
import { MenuItem } from "./useMenuItems";

export function useDishSearch(restaurantId: string) {
  const [results, setResults] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/menus/search?restaurantId=${restaurantId}&q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  return { results, loading, error, search };
}
