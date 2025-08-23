// Live filter input for dishes/allergens (public menu search)
import React, { useState } from "react";
import { useDishSearch } from "@/hooks/useDishSearch";

interface DishSearchProps {
  restaurantId?: string;
  onSearch?: (query: string) => void;
}

export default function DishSearch({ restaurantId, onSearch }: DishSearchProps) {
  const [query, setQuery] = useState("");
  const { search } = useDishSearch(restaurantId || '');

  const handleSearch = () => {
    if (onSearch) onSearch(query);
    if (restaurantId) search(query);
  };
  return (
    <div className="mb-4 flex gap-2">
      <input
        type="text"
        className="border rounded px-3 py-2 w-full max-w-md"
        placeholder="Search dishes or allergens..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}
