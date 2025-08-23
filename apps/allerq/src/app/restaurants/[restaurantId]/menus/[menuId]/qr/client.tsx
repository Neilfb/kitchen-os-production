"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  QrCode,
  AlertCircle,
  CheckCircle,
  Palette,
  Settings,
  Eye
} from "lucide-react";
import { EnhancedMenu } from "@/lib/types/menu";
import { useToast } from "@/hooks/use-toast";
import { generateQrCode } from "@/lib/qr-service";

interface QRCodeClientProps {
  restaurantId: string;
  menuId: string;
}

export default function QRCodeClient({ restaurantId, menuId }: QRCodeClientProps) {
  const [menu, setMenu] = useState<EnhancedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrSettings, setQrSettings] = useState({
    size: 400,
    color: '#000000',
    backgroundColor: '#ffffff'
  });
  const [publicMenuUrl, setPublicMenuUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Set public menu URL safely on client side
    if (typeof window !== 'undefined') {
      setPublicMenuUrl(`${window.location.origin}/r/${restaurantId}/menu/${menuId}`);
    }
    fetchMenu();
  }, [restaurantId, menuId]);

  useEffect(() => {
    if (publicMenuUrl) {
      generateQRCode();
    }
  }, [qrSettings, publicMenuUrl]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in again');
        return;
      }

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

  const generateQRCode = async () => {
    if (!publicMenuUrl) return;

    try {
      setGenerating(true);

      const result = await generateQrCode({
        value: publicMenuUrl,
        size: qrSettings.size,
        color: qrSettings.color,
        backgroundColor: qrSettings.backgroundColor
      });

      if (result.success && result.dataUrl) {
        setQrCodeUrl(result.dataUrl);
      } else {
        throw new Error(result.error || 'Failed to generate QR code');
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl || !menu) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${menu.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicMenuUrl);
      toast({
        title: "Success",
        description: "Menu URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (!menu) return null;
    
    if (menu.status === 'published') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
    } else if (menu.status === 'draft') {
      return <Badge variant="secondary">Draft - Not Public</Badge>;
    }
    return <Badge variant="outline">{menu.status}</Badge>;
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
    <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">QR Code for {menu.name}</h1>
            <p className="text-gray-600">Generate and customize QR codes for your menu</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Status Warning */}
      {menu.status !== 'published' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Menu Not Published</p>
                <p className="text-yellow-700 text-sm">
                  This menu is not published yet. Customers won't be able to view it via QR code until you publish it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {generating ? (
              <div className="flex items-center justify-center h-64">
                <Icons.spinner className="h-8 w-8 animate-spin" />
              </div>
            ) : qrCodeUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="Menu QR Code" 
                    className="border rounded-lg shadow-sm"
                    style={{ width: Math.min(qrSettings.size, 300), height: Math.min(qrSettings.size, 300) }}
                  />
                </div>
                <div className="flex justify-center space-x-3">
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (publicMenuUrl) {
                        window.open(publicMenuUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 py-12">
                Failed to generate QR code
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                QR Code Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (pixels)</Label>
                <Input
                  id="size"
                  type="number"
                  min="200"
                  max="800"
                  step="50"
                  value={qrSettings.size}
                  onChange={(e) => setQrSettings(prev => ({ ...prev, size: parseInt(e.target.value) || 400 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">QR Code Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={qrSettings.color}
                    onChange={(e) => setQrSettings(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={qrSettings.color}
                    onChange={(e) => setQrSettings(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={qrSettings.backgroundColor}
                    onChange={(e) => setQrSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={qrSettings.backgroundColor}
                    onChange={(e) => setQrSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menu URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Public Menu Link</Label>
                <div className="flex space-x-2">
                  <Input
                    value={publicMenuUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Customers can scan the QR code or visit this URL directly to view your menu.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
