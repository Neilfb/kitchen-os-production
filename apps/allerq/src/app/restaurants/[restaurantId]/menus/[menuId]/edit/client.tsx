"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { EnhancedMenu } from "@/lib/types/menu";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuEditClientProps {
  restaurantId: string;
  menuId: string;
}

export default function MenuEditClient({ restaurantId, menuId }: MenuEditClientProps) {
  const [menu, setMenu] = useState<EnhancedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useFirebaseAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchMenu();
    } else if (!authLoading && !user) {
      setError('Please sign in to edit this menu');
      setLoading(false);
    }
  }, [restaurantId, menuId, user, authLoading]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('Please sign in again');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }

      const data = await response.json();
      setMenu(data.menu);
      setFormData({
        name: data.menu.name,
        description: data.menu.description || '',
        status: data.menu.status || 'draft'
      });
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Menu name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in again",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update menu');
      }

      const data = await response.json();
      setMenu(data.menu);

      toast({
        title: "Success",
        description: "Menu updated successfully",
      });

      // Redirect back to menu overview
      router.push(`/restaurants/${restaurantId}/menus/${menuId}`);
    } catch (err) {
      console.error('Error updating menu:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update menu',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Menu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchMenu} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Not Found</h3>
        <p className="text-gray-600 mb-4">The requested menu could not be found.</p>
        <Link href={`/restaurants/${restaurantId}/menus`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menus
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/restaurants/${restaurantId}/menus/${menuId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Menu</h1>
            <p className="text-gray-600">Update menu information and settings</p>
          </div>
        </div>
        {getStatusBadge(formData.status)}
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Menu Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter menu name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter menu description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'published' | 'archived') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value="published">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Published
                  </div>
                </SelectItem>
                <SelectItem value="archived">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Archived
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {formData.status === 'published' && "Menu is visible to customers via QR codes"}
              {formData.status === 'draft' && "Menu is not visible to customers"}
              {formData.status === 'archived' && "Menu is hidden and not accessible"}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link href={`/restaurants/${restaurantId}/menus/${menuId}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu Info */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2">{new Date(menu.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <span className="ml-2">{new Date(menu.updated_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">AI Processed:</span>
              <span className="ml-2">{menu.ai_processed ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-600">Categories:</span>
              <span className="ml-2">{menu.categories?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
