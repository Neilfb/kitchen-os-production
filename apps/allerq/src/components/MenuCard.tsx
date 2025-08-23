// Displays a dish entry with edit and delete options
import React from "react";
import { MenuItem } from "../hooks/useMenuItems";
import Image from "next/image";

interface MenuCardProps {
  dish: MenuItem;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  onSelect?: () => void;
}

export default function MenuCard({ dish, onEdit, onDelete, showActions = true, selected, onSelect }: MenuCardProps) {
  return (
    <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {onSelect && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={onSelect}
            className={`p-1 rounded-full transition-colors duration-200 ${selected ? 'text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label={selected ? "Deselect" : "Select"}
          >
            {selected ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12l2 2 4-4m0 0l4 4 2-2M6 12l4-4 4 4m0 0l4 4 2-2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12l2 2 4-4m0 0l4 4 2-2M6 12l4-4 4 4m0 0l4 4 2-2" />
              </svg>
            )}
          </button>
        </div>
      )}
      
      {dish.image && (
        <div className="relative h-48 w-full">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/400x300?text=No+Image";
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800">{dish.name}</h2>
          {dish.price && (
            <span className="text-lg font-bold text-green-600">
              ${typeof dish.price === 'number' ? dish.price.toFixed(2) : dish.price}
            </span>
          )}
        </div>
        
        <p className="mt-2 text-gray-600 text-sm">{dish.description}</p>
        
        <div className="mt-3 space-y-2">
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dish.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full"
                >
                  {allergen}
                </span>
              ))}
            </div>
          )}
          
          {dish.dietary && dish.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dish.dietary.map((diet) => (
                <span
                  key={diet}
                  className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}
          
          {dish.category && (
            <div className="text-xs text-gray-500">
              Category: {dish.category}
            </div>
          )}
        </div>
        
        {showActions && (onEdit || onDelete) && (
          <div className="mt-4 flex justify-end space-x-2 border-t pt-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
