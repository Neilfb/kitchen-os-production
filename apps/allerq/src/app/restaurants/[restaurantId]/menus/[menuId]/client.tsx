"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import {
  ArrowLeft,
  Edit,
  FileText,
  QrCode,
  Eye,
  Settings,
  Brain,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { EnhancedMenu } from "@/lib/types/menu";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

interface MenuOverviewClientProps {
  restaurantId: string;
  menuId: string;
}

export default function MenuOverviewClient({ restaurantId, menuId }: MenuOverviewClientProps) {
  const [menu, setMenu] = useState<EnhancedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useFirebaseAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchMenu();
      fetchItemCount();
    } else if (!authLoading && !user) {
      setError('Please sign in to access this menu');
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
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemCount = async () => {
    try {
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItemCount(data.items?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching item count:', err);
    }
  };

  const handleDeleteMenu = async () => {
    if (!confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
      return;
    }

    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in again",
          variant: "destructive",
        });
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete menu');
      }

      toast({
        title: "Success",
        description: "Menu deleted successfully",
      });

      router.push(`/restaurants/${restaurantId}/menus`);
    } catch (err) {
      console.error('Error deleting menu:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete menu',
        variant: "destructive",
      });
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
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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

  const getStatusBadge = () => {
    if (menu.status === 'published') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
    } else if (menu.status === 'draft') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
    return <Badge variant="outline">{menu.status}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/restaurants/${restaurantId}/menus`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menus
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{menu.name}</h1>
            <p className="text-gray-600">{menu.description}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={`/restaurants/${restaurantId}/menus/${menuId}/edit`}>
          <Button className="w-full" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Menu
          </Button>
        </Link>
        <Link href={`/restaurants/${restaurantId}/menus/${menuId}/items`}>
          <Button className="w-full" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Manage Items ({itemCount})
          </Button>
        </Link>
        <Link href={`/restaurants/${restaurantId}/menus/${menuId}/qr`}>
          <Button className="w-full" variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(`/r/${restaurantId}/menu/${menuId}`, '_blank', 'noopener,noreferrer')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Menu Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Menu Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{menu.name}</p>
            </div>
            {menu.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{menu.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Created</label>
              <p className="text-gray-900">{new Date(menu.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Updated</label>
              <p className="text-gray-900">{new Date(menu.updated_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Menu Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="font-medium">{itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Categories</span>
                  <span className="font-medium">{menu.categories?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AI Processed</span>
                  <span className="font-medium">{menu.ai_processed ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDeleteMenu}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
