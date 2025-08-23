'use client';

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Eye, Download, Settings, BarChart3, Plus } from "lucide-react";
import Link from "next/link";
import { EnhancedMenu } from '@/lib/types/menu';

interface QRCodeManagementProps {
  restaurantId: string;
}

export default function QRCodeManagement({ restaurantId }: QRCodeManagementProps) {
  const { user } = useFirebaseAuth();
  const [menus, setMenus] = useState<EnhancedMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMenus();
    }
  }, [user, restaurantId]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await user?.getIdToken();
      const response = await fetch(`/api/restaurants/${restaurantId}/menus`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch menus');
      }

      const data = await response.json();
      setMenus(data.menus || []);
    } catch (error) {
      console.error('Error fetching menus:', error);
      setError('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeUrl = (menuId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/r/${restaurantId}/menu/${menuId}`;
  };

  const handleDownloadQR = (menuId: string, menuName: string) => {
    // Navigate to QR Studio with pre-filled data
    const qrUrl = generateQRCodeUrl(menuId);
    const studioUrl = `/qr-studio?url=${encodeURIComponent(qrUrl)}&title=${encodeURIComponent(menuName)}`;
    window.open(studioUrl, '_blank');
  };

  const handlePreviewMenu = (menuId: string) => {
    const previewUrl = generateQRCodeUrl(menuId);
    window.open(previewUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMenus} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (menus.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Menus Found</h3>
            <p className="text-gray-600 mb-4">
              Create your first menu to generate QR codes for customer access.
            </p>
            <Link
              href={`/restaurants/${restaurantId}/menus`}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Menu
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <Card key={menu.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{menu.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {menu.description || 'No description'}
                </p>
              </div>
              <Badge 
                variant={menu.status === 'published' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {menu.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Menu Stats */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>{menu.items?.length || 0} items</span>
                <span>{menu.categories?.length || 0} categories</span>
              </div>

              {/* QR Code URL Preview */}
              <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-700 truncate">
                {generateQRCodeUrl(menu.id)}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreviewMenu(menu.id)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownloadQR(menu.id, menu.name)}
                  className="flex-1"
                  disabled={menu.status !== 'published'}
                >
                  <QrCode className="h-3 w-3 mr-1" />
                  QR Code
                </Button>
              </div>

              {menu.status !== 'published' && (
                <p className="text-xs text-amber-600 text-center">
                  Publish menu to enable QR code generation
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Menu Card */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="pt-6">
          <Link
            href={`/restaurants/${restaurantId}/menus`}
            className="flex flex-col items-center justify-center h-full text-center group"
          >
            <Plus className="h-8 w-8 text-gray-400 group-hover:text-gray-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
              Create New Menu
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Add another menu to generate more QR codes
            </p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
