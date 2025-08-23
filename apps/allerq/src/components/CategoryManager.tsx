"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  order: number;
}

interface CategoryManagerProps {
  menuId: string;
  initialCategories: Category[];
  onUpdateCategories: (categories: Category[]) => Promise<boolean | void>;
}

export default function CategoryManager({ menuId: _menuId, initialCategories, onUpdateCategories }: CategoryManagerProps) {
  // Component for managing menu categories
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: `temp_${Date.now()}`,
      name: newCategoryName.trim(),
      order: categories.length,
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName("");
  };

  const handleUpdateCategory = (id: string, name: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, name } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleSaveCategories = async () => {
    try {
      // Update order based on current position
      const orderedCategories = categories.map((category, index) => ({
        ...category,
        order: index,
      }));
      
      await onUpdateCategories(orderedCategories);
      
      toast({
        title: "Success",
        description: "Categories updated successfully",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update categories",
        variant: "destructive",
      });
    }
  };

  const handleMoveCategory = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    )
      return;

    const newCategories = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap positions
    [newCategories[index], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[index],
    ];
    
    setCategories(newCategories);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Manage Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1"
            />
            <Button onClick={handleAddCategory} variant="secondary">
              Add
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Input
                value={category.name}
                onChange={(e) => handleUpdateCategory(category.id, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMoveCategory(index, "up")}
                disabled={index === 0}
              >
                <Icons.arrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMoveCategory(index, "down")}
                disabled={index === categories.length - 1}
              >
                <Icons.arrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDeleteCategory(category.id)}
              >
                <Icons.trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {categories.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveCategories}>Save Categories</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
