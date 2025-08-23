import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import QRCodeManagement from "./client";

interface Params {
  restaurantId: string;
}

export default function RestaurantQRCodesPage({
  params,
}: {
  params: Params;
}) {
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
            <p className="text-gray-600">Generate and manage QR codes for your menus</p>
          </div>
        </div>
        <Link
          href="/qr-studio"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Studio
        </Link>
      </div>

      {/* QR Code Management */}
      <Suspense fallback={<div>Loading menus...</div>}>
        <QRCodeManagement restaurantId={params.restaurantId} />
      </Suspense>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="text-center">
              <QrCode className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-1">Bulk Generate</h3>
              <p className="text-sm text-gray-600 mb-3">Generate QR codes for all menus</p>
              <Button size="sm" className="w-full">Generate All</Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <Download className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium mb-1">Download Pack</h3>
              <p className="text-sm text-gray-600 mb-3">Download all QR codes as ZIP</p>
              <Button size="sm" variant="outline" className="w-full">Download</Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium mb-1">Preview Menu</h3>
              <p className="text-sm text-gray-600 mb-3">See how customers view your menu</p>
              <Button size="sm" variant="outline" className="w-full">Preview</Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <QrCode className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-medium mb-1">Print Ready</h3>
              <p className="text-sm text-gray-600 mb-3">Get print-ready QR codes</p>
              <Button size="sm" variant="outline" className="w-full">Prepare</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How QR Codes Work</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">1. Generate</h4>
            <p className="text-sm text-blue-700">Create QR codes for your menus with custom branding</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">2. Display</h4>
            <p className="text-sm text-blue-700">Print and place QR codes on tables or at your entrance</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">3. Scan</h4>
            <p className="text-sm text-blue-700">Customers scan to instantly view your digital menu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
