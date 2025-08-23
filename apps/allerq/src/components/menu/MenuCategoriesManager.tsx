"use client";

import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { MenuCategory } from '@/lib/services/firebaseMenuService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuCategoriesManagerProps {
  restaurantId: string;
  menuId: string;
  onCategoriesChange?: (categories: MenuCategory[]) => void;
}

export default function MenuCategoriesManager({
  restaurantId,
  menuId,
  onCategoriesChange
}: MenuCategoriesManagerProps) {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isVisible: true,
  });

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
        onCategoriesChange?.(data.categories || []);
      } else {
        throw new Error(data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load menu categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update category
  const saveCategory = async () => {
    if (!user || !formData.name.trim()) return;

    try {
      const token = await user.getIdToken();
      const isEditing = !!editingCategory;
      
      const url = isEditing 
        ? `/api/restaurants/${restaurantId}/menus/${menuId}/categories/${editingCategory.id}`
        : `/api/restaurants/${restaurantId}/menus/${menuId}/categories`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Category ${isEditing ? 'updated' : 'created'} successfully`,
        });
        
        // Reset form and close dialog
        setFormData({ name: '', description: '', order: 0, isVisible: true });
        setShowCreateDialog(false);
        setEditingCategory(null);
        
        // Refresh categories
        await fetchCategories();
      } else {
        throw new Error(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingCategory ? 'update' : 'create'} category`,
        variant: "destructive",
      });
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    if (!user || !confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        
        // Refresh categories
        await fetchCategories();
      } else {
        throw new Error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // Handle edit
  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      order: category.order,
      isVisible: category.isVisible,
    });
    setShowCreateDialog(true);
  };

  // Handle create new
  const handleCreateNew = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', order: categories.length, isVisible: true });
    setShowCreateDialog(true);
  };

  useEffect(() => {
    fetchCategories();
  }, [user, restaurantId, menuId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Menu Categories</CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Appetizers, Main Courses, Desserts"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description for this category"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visible">Visible</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="visible"
                        checked={formData.isVisible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: !!checked }))}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.isVisible ? 'Visible on menu' : 'Hidden from menu'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveCategory} disabled={!formData.name.trim()}>
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No categories created yet.</p>
            <p className="text-sm">Categories help organize your menu items.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-600">{category.description}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      Order: {category.order} • {category.isVisible ? 'Visible' : 'Hidden'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
