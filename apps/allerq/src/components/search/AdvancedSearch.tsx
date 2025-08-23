'use client';

import { useState, useEffect, useMemo } from 'react';
import { MenuItem } from '@kitchen-os/database';
import { Input } from '@kitchen-os/ui';
import { Button } from '@kitchen-os/ui';
import {
  Search,
  Filter,
  X,
  Star,
  DollarSign,
  Clock,
  Utensils,
  Leaf,
  AlertTriangle,
} from 'lucide-react';

interface SearchFilters {
  query: string;
  priceRange: [number, number];
  categories: string[];
  allergens: string[];
  dietaryTags: string[];
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'name' | 'price' | 'popularity' | 'newest';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  menuItems: MenuItem[];
  onResults: (filteredItems: MenuItem[]) => void;
  popularityData?: Record<string, number>; // Item ID to click count
  className?: string;
}

export function AdvancedSearch({
  menuItems,
  onResults,
  popularityData = {},
  className = '',
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    priceRange: [0, 100],
    categories: [],
    allergens: [],
    dietaryTags: [],
    availability: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<Array<{
    name: string;
    filters: SearchFilters;
  }>>([]);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(menuItems.map(item => item.category))];
    const allergens = [...new Set(menuItems.flatMap(item => item.allergens))];
    const dietaryTags = [...new Set(menuItems.flatMap(item => item.dietaryTags))];
    const maxPrice = Math.max(...menuItems.map(item => item.price), 100);

    return { categories, allergens, dietaryTags, maxPrice };
  }, [menuItems]);

  // Fuzzy search function
  const fuzzySearch = (query: string, text: string): boolean => {
    if (!query) return true;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match
    if (textLower.includes(queryLower)) return true;
    
    // Fuzzy match - allow for typos
    const words = queryLower.split(' ');
    return words.every(word => {
      if (word.length <= 2) return textLower.includes(word);
      
      // Allow one character difference for words longer than 2 characters
      for (let i = 0; i <= textLower.length - word.length; i++) {
        const substring = textLower.substring(i, i + word.length);
        let differences = 0;
        
        for (let j = 0; j < word.length; j++) {
          if (word[j] !== substring[j]) differences++;
          if (differences > 1) break;
        }
        
        if (differences <= 1) return true;
      }
      
      return false;
    });
  };

  // Filter and sort menu items
  const filteredItems = useMemo(() => {
    let filtered = menuItems.filter(item => {
      // Text search
      if (filters.query) {
        const searchText = `${item.name} ${item.description} ${item.ingredients.join(' ')}`;
        if (!fuzzySearch(filters.query, searchText)) return false;
      }

      // Price range
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
        return false;
      }

      // Categories
      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
        return false;
      }

      // Allergens (exclude items with selected allergens)
      if (filters.allergens.length > 0) {
        const hasExcludedAllergen = filters.allergens.some(allergen =>
          item.allergens.includes(allergen)
        );
        if (hasExcludedAllergen) return false;
      }

      // Dietary tags (include only items with selected tags)
      if (filters.dietaryTags.length > 0) {
        const hasRequiredTag = filters.dietaryTags.some(tag =>
          item.dietaryTags.includes(tag)
        );
        if (!hasRequiredTag) return false;
      }

      // Availability
      if (filters.availability === 'available' && !item.available) return false;
      if (filters.availability === 'unavailable' && item.available) return false;

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'popularity':
          const aPopularity = popularityData[a.id] || 0;
          const bPopularity = popularityData[b.id] || 0;
          comparison = bPopularity - aPopularity; // Higher popularity first
          break;
        case 'newest':
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          comparison = bDate - aDate; // Newer first
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [menuItems, filters, popularityData]);

  // Update results when filtered items change
  useEffect(() => {
    onResults(filteredItems);
  }, [filteredItems, onResults]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = <K extends keyof SearchFilters>(
    key: K,
    value: string
  ) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      priceRange: [0, filterOptions.maxPrice],
      categories: [],
      allergens: [],
      dietaryTags: [],
      availability: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const saveSearch = () => {
    const name = prompt('Enter a name for this search:');
    if (name) {
      setSavedSearches(prev => [...prev, { name, filters }]);
    }
  };

  const loadSearch = (savedFilters: SearchFilters) => {
    setFilters(savedFilters);
  };

  const hasActiveFilters = filters.query || 
    filters.categories.length > 0 || 
    filters.allergens.length > 0 || 
    filters.dietaryTags.length > 0 || 
    filters.availability !== 'all' ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < filterOptions.maxPrice;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items, ingredients, or descriptions..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={showAdvanced ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Active
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredItems.length} of {menuItems.length} items
            {filters.query && ` matching "${filters.query}"`}
          </span>
          
          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
            </select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={filterOptions.maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Utensils className="inline h-4 w-4 mr-1" />
                Categories
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleArrayFilter('categories', category)}
                      className="mr-2"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Leaf className="inline h-4 w-4 mr-1" />
                Dietary Preferences
              </label>
              <div className="space-y-1">
                {filterOptions.dietaryTags.map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.dietaryTags.includes(tag)}
                      onChange={() => toggleArrayFilter('dietaryTags', tag)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{tag.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergens to Exclude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Exclude Allergens
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.allergens.map(allergen => (
                  <label key={allergen} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.allergens.includes(allergen)}
                      onChange={() => toggleArrayFilter('allergens', allergen)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => updateFilter('availability', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saved Searches
              </label>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((saved, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSearch(saved.filters)}
                  >
                    {saved.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex justify-between">
            <Button variant="outline" size="sm" onClick={saveSearch}>
              <Star className="h-4 w-4 mr-2" />
              Save Search
            </Button>
            
            <div className="text-sm text-gray-500">
              {filteredItems.length} results found
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
