// Search/filter component for public menu
import React, { useState } from "react";

export default function MenuSearchBar() {
  const [query, setQuery] = useState("");
  // Placeholder: implement search/filter logic
  return (
    <div className="mb-4 flex gap-2">
      <input
        type="text"
        className="border rounded px-3 py-2 w-full max-w-md"
        placeholder="Search dishes or allergens..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Search
      </button>
    </div>
  );
}
