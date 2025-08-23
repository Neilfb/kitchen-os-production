'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@kitchen-os/auth';
import { QRCode, Restaurant, Menu } from '@kitchen-os/database';
import { QRCodeService, RestaurantService, MenuService } from '@kitchen-os/database';
import { QRCodeGenerator as QRGen } from '@kitchen-os/utils';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { QRCodeCard } from '@/components/qr/QRCodeCard';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator';
import { Button } from '@kitchen-os/ui';
import { Plus, QrCode as QrCodeIcon, Loader2, X } from 'lucide-react';

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.customerId) {
      loadData();
    }
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile?.customerId) return;

    try {
      setLoading(true);
      const restaurantsData = await RestaurantService.getRestaurantsByCustomer(userProfile.customerId);
      setRestaurants(restaurantsData);

      if (restaurantsData.length > 0) {
        // Load QR codes for all restaurants
        const qrCodesPromises = restaurantsData.map(restaurant =>
          QRCodeService.getQRCodesByRestaurant(restaurant.id)
        );
        const qrCodesArrays = await Promise.all(qrCodesPromises);
        const allQrCodes = qrCodesArrays.flat();
        setQrCodes(allQrCodes);

        // Load menus for all restaurants
        const menusPromises = restaurantsData.map(restaurant =>
          MenuService.getMenusByRestaurant(restaurant.id)
        );
        const menusArrays = await Promise.all(menusPromises);
        const allMenus = menusArrays.flat().filter(menu => menu.published);
        setMenus(allMenus);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQRCode = async (customization: any) => {
    if (!selectedRestaurant) {
      alert('Please select a restaurant');
      return;
    }

    try {
      const restaurant = restaurants.find(r => r.id === selectedRestaurant);
      if (!restaurant) throw new Error('Restaurant not found');

      // Generate URL
      const url = selectedMenu 
        ? QRGen.generateMenuURL(selectedRestaurant, selectedMenu)
        : QRGen.generateMenuURL(selectedRestaurant);

      // Create tracking URL
      const trackingUrl = QRGen.generateTrackingURL('temp', url);

      // Create QR code record
      const qrCode = await QRCodeService.createQRCode({
        restaurantId: selectedRestaurant,
        menuId: selectedMenu || undefined,
        customization,
        url: trackingUrl,
      });

      // Update the tracking URL with the actual QR code ID
      const finalTrackingUrl = QRGen.generateTrackingURL(qrCode.id, url);
      await QRCodeService.updateQRCode(qrCode.id, { url: finalTrackingUrl });

      setShowGenerator(false);
      setSelectedRestaurant('');
      setSelectedMenu('');
      await loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEditQRCode = (qrCode: QRCode) => {
    // TODO: Implement edit functionality
    console.log('Edit QR code:', qrCode);
  };

  const handleDeleteQRCode = async (qrCode: QRCode) => {
    if (!confirm('Are you sure you want to delete this QR code?')) {
      return;
    }

    try {
      await QRCodeService.deleteQRCode(qrCode.id);
      await loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleViewAnalytics = (qrCode: QRCode) => {
    // TODO: Navigate to analytics page
    console.log('View analytics for QR code:', qrCode);
  };

  const getRestaurantMenus = (restaurantId: string) => {
    return menus.filter(menu => menu.restaurantId === restaurantId);
  };

  const getQRCodeUrl = () => {
    if (!selectedRestaurant) return '';
    
    return selectedMenu 
      ? QRGen.generateMenuURL(selectedRestaurant, selectedMenu)
      : QRGen.generateMenuURL(selectedRestaurant);
  };

  if (loading) {
    return (
      <DashboardLayout title="QR Codes" subtitle="Generate and manage QR codes for your menus">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-kitchen-os-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="QR Codes"
      subtitle="Generate and manage QR codes for your menus"
      action={{
        label: 'Create QR Code',
        onClick: () => {
          if (restaurants.length === 0) {
            alert('Please create a restaurant first before generating QR codes.');
            return;
          }
          setShowGenerator(true);
        },
      }}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
          <p className="text-gray-600 mb-6">
            You need to create a restaurant before you can generate QR codes.
          </p>
          <Button
            asChild
            className="kitchen-os-gradient text-white"
          >
            <a href="/dashboard/restaurants">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Restaurant
            </a>
          </Button>
        </div>
      ) : qrCodes.length === 0 ? (
        <div className="text-center py-12">
          <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No QR codes yet</h3>
          <p className="text-gray-600 mb-6">
            Generate QR codes to let customers access your digital menus.
          </p>
          <Button
            onClick={() => setShowGenerator(true)}
            className="kitchen-os-gradient text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Your First QR Code
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qrCode) => (
            <QRCodeCard
              key={qrCode.id}
              qrCode={qrCode}
              onEdit={handleEditQRCode}
              onDelete={handleDeleteQRCode}
              onViewAnalytics={handleViewAnalytics}
            />
          ))}
        </div>
      )}

      {/* QR Code Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Generate QR Code</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowGenerator(false);
                  setSelectedRestaurant('');
                  setSelectedMenu('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Restaurant Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant *
                </label>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => {
                    setSelectedRestaurant(e.target.value);
                    setSelectedMenu(''); // Reset menu selection
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitchen-os-500"
                >
                  <option value="">Select a restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Selection */}
              {selectedRestaurant && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu (Optional)
                  </label>
                  <select
                    value={selectedMenu}
                    onChange={(e) => setSelectedMenu(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitchen-os-500"
                  >
                    <option value="">All published menus</option>
                    {getRestaurantMenus(selectedRestaurant).map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to show all published menus for this restaurant
                  </p>
                </div>
              )}

              {/* QR Code Generator */}
              {selectedRestaurant && (
                <QRCodeGenerator
                  url={getQRCodeUrl()}
                  restaurantName={restaurants.find(r => r.id === selectedRestaurant)?.name}
                  menuName={selectedMenu ? menus.find(m => m.id === selectedMenu)?.name : undefined}
                  onCustomizationChange={handleCreateQRCode}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
