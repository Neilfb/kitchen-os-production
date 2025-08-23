"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { MenuCreationDialog } from "@/components/menu/MenuCreationDialog";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Eye,
  QrCode,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Wand2,
  Upload,
  Settings
} from "lucide-react";
import { EnhancedMenu } from "@/lib/types/menu";

interface EnhancedMenuListProps {
  restaurantId: string;
}

export function EnhancedMenuList({ restaurantId }: EnhancedMenuListProps) {
  const [menus, setMenus] = useState<EnhancedMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();

  // Fetch menus for this restaurant
  useEffect(() => {
    if (!authLoading && user) {
      fetchMenus();
    } else if (!authLoading && !user) {
      setError('Please sign in to view menus');
      setLoading(false);
    }
  }, [restaurantId, user, authLoading]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('Please sign in again');
        return;
      }

      // Get Firebase ID token
      const token = await user.getIdToken();

      const response = await fetch(`/api/restaurants/${restaurantId}/menus`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          setError('Your session has expired. Please sign in again.');
          return;
        } else if (response.status === 403) {
          setError('You do not have permission to access this restaurant.');
          return;
        } else if (response.status === 404) {
          setError('Restaurant not found.');
          return;
        } else if (response.status >= 500) {
          setError('Server error. Please try again later.');
          return;
        } else {
          setError(`Error ${response.status}: ${response.statusText}`);
          return;
        }
      }

      const data = await response.json();

      if (data.success) {
        setMenus(data.menus || []);
      } else {
        setError(data.error || 'Failed to fetch menus');
      }
    } catch (err) {
      console.error('Error fetching menus:', err);
      setError('Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuCreated = (menuId: string) => {
    // Refresh the menu list
    fetchMenus();
  };

  const getStatusBadge = (menu: EnhancedMenu) => {
    if (menu.aiProcessingStatus === 'processing') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          AI Processing
        </Badge>
      );
    }

    if (menu.aiProcessed) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Brain className="h-3 w-3 mr-1" />
          AI Enhanced
        </Badge>
      );
    }

    if (menu.status === 'published') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Published
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <Edit className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  const getCreationMethodIcon = (menu: EnhancedMenu) => {
    if (menu.sourceFile) {
      return <Upload className="h-4 w-4 text-blue-600" />;
    }
    if (menu.aiProcessed) {
      return <Brain className="h-4 w-4 text-purple-600" />;
    }
    return <Edit className="h-4 w-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-gray-600">Loading menus...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Menus</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchMenus} variant="outline">
          <Icons.refresh className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menus</h2>
          <p className="text-gray-600">
            {menus.length === 0 ? 'No menus created yet' : `${menus.length} menu${menus.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Menu
        </Button>
      </div>

      {/* Menu Grid */}
      {menus.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Menus Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first menu to start managing your restaurant's offerings. 
            You can build manually, upload a file, or use AI assistance.
          </p>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Menu
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Card key={menu.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCreationMethodIcon(menu)}
                    <div>
                      <CardTitle className="text-lg">{menu.name}</CardTitle>
                      {menu.description && (
                        <CardDescription className="mt-1">
                          {menu.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(menu)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Menu Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{menu.items.length} items</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Settings className="h-4 w-4" />
                    <span>{menu.categories.length} categories</span>
                  </div>
                </div>

                {/* Regional Info */}
                {menu.region && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {menu.region} Regulations
                    </Badge>
                    {menu.aiProcessed && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        AI Tagged
                      </Badge>
                    )}
                  </div>
                )}

                {/* AI Processing Status */}
                {menu.aiProcessingStatus === 'processing' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Clock className="h-4 w-4 animate-pulse" />
                      <span className="text-sm font-medium">AI Processing in Progress</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Analyzing menu items for allergens and dietary tags...
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/restaurants/${restaurantId}/menus/${menu.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/restaurants/${restaurantId}/menus/${menu.id}/items`)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Items
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/restaurants/${restaurantId}/menus/${menu.id}/qr`)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Menu Dialog */}
      <MenuCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleMenuCreated}
        restaurantId={restaurantId}
      />
    </div>
  );
}
