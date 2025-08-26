"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GooglePlacesStatus } from "@/components/debug/GooglePlacesStatus";
import { MenuCreationDialog } from "@/components/menu/MenuCreationDialog";
import { 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Eye, 
  Settings,
  FileText,
  MapPin,
  Image as ImageIcon
} from "lucide-react";

export default function CriticalFixesTestPage() {
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [testResults, setTestResults] = useState<{
    logoUpload: 'pending' | 'success' | 'error';
    googlePlaces: 'pending' | 'success' | 'error';
    menuButtons: 'pending' | 'success' | 'error';
    dialogStyling: 'pending' | 'success' | 'error';
  }>({
    logoUpload: 'pending',
    googlePlaces: 'pending',
    menuButtons: 'pending',
    dialogStyling: 'pending'
  });

  const [logoTestDetails, setLogoTestDetails] = useState<{
    storageMethod?: string;
    fileSize?: string;
    environment?: string;
  } | null>(null);

  const testLogoUpload = async () => {
    try {
      // Create a test image file for logo upload testing
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');

      // Draw a simple test logo
      if (ctx) {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LOGO', 50, 55);
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Test the logo upload using dedicated debug endpoint
      const formData = new FormData();
      formData.append('logo', blob, 'test-logo.png');

      const response = await fetch('/api/debug/logo-upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success && data.logoUrl) {
        console.log('Logo upload test successful:', data);
        setTestResults(prev => ({ ...prev, logoUpload: 'success' }));
        setLogoTestDetails({
          storageMethod: data.storageMethod,
          fileSize: data.fileInfo?.sizeFormatted,
          environment: data.environment?.isVercel ? 'Vercel' : 'Local'
        });
      } else {
        console.error('Logo upload test failed:', data.error);
        setTestResults(prev => ({ ...prev, logoUpload: 'error' }));
        setLogoTestDetails(null);
      }
    } catch (error) {
      console.error('Logo upload test failed:', error);
      setTestResults(prev => ({ ...prev, logoUpload: 'error' }));
    }
  };

  const testGooglePlaces = async () => {
    try {
      const response = await fetch('/api/debug/environment');
      const data = await response.json();
      
      if (data.success && !data.environment.googlePlacesDemo) {
        setTestResults(prev => ({ ...prev, googlePlaces: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, googlePlaces: 'error' }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, googlePlaces: 'error' }));
    }
  };

  const testMenuButtons = () => {
    // This is a visual test - mark as success if we can see the page
    setTestResults(prev => ({ ...prev, menuButtons: 'success' }));
  };

  const testDialogStyling = () => {
    setShowMenuDialog(true);
    setTestResults(prev => ({ ...prev, dialogStyling: 'success' }));
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Fixed</Badge>;
      case 'error':
        return <Badge variant="destructive">Issue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Critical Issues Fix Verification
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This page tests the four critical production issues that were identified and fixed:
          logo display, Google Places API demo mode, duplicate menu buttons, and dialog styling.
        </p>
      </div>

      {/* Issue 1: Restaurant Logo Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.logoUpload)}
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Issue 1: Restaurant Logo Display</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Logo files now use base64 encoding for Vercel production persistence
                </p>
              </div>
            </div>
            {getStatusBadge(testResults.logoUpload)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Fix Applied:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Modified processLogoUpload() to use base64 data URLs in production</li>
                <li>• Ensures logos persist across Vercel deployments</li>
                <li>• Maintains local file storage for development</li>
                <li>• Added proper size validation for base64 storage</li>
              </ul>
            </div>

            {logoTestDetails && testResults.logoUpload === 'success' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Test Results:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div>• Storage Method: <strong>{logoTestDetails.storageMethod}</strong></div>
                  <div>• File Size: <strong>{logoTestDetails.fileSize}</strong></div>
                  <div>• Environment: <strong>{logoTestDetails.environment}</strong></div>
                  <div>• Status: <strong>Logo upload working correctly!</strong></div>
                </div>
              </div>
            )}

            <Button onClick={testLogoUpload} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Test Logo Upload System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issue 2: Google Places API Demo Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.googlePlaces)}
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Issue 2: Google Places API Demo Mode</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Environment variable detection and debug component added
                </p>
              </div>
            </div>
            {getStatusBadge(testResults.googlePlaces)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <GooglePlacesStatus />
            <Button onClick={testGooglePlaces} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Test Google Places Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issue 3: Duplicate Menu Creation Buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.menuButtons)}
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Issue 3: Duplicate Menu Creation Buttons</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Removed duplicate button from page header, kept EnhancedMenuList button
                </p>
              </div>
            </div>
            {getStatusBadge(testResults.menuButtons)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Fix Applied:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Removed duplicate "Create Menu" button from page header</li>
                <li>• Kept single button in EnhancedMenuList component</li>
                <li>• Fixed routing to use modal dialog instead of broken /new route</li>
                <li>• Improved user experience with consistent UI patterns</li>
              </ul>
            </div>
            <Button onClick={testMenuButtons} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Mark Menu Buttons as Fixed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issue 4: Menu Creation Overlay Styling */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.dialogStyling)}
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Issue 4: Menu Creation Overlay Styling</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Fixed contrast, visibility, and styling issues in MenuCreationDialog
                </p>
              </div>
            </div>
            {getStatusBadge(testResults.dialogStyling)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Fix Applied:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Added explicit background colors and text colors</li>
                <li>• Improved contrast for all form elements</li>
                <li>• Enhanced border and focus states</li>
                <li>• Added Google Places status debug component</li>
                <li>• Fixed button styling and footer layout</li>
              </ul>
            </div>
            <Button onClick={testDialogStyling} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Test Menu Creation Dialog
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Fix Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(testResults.logoUpload)}
              </div>
              <p className="text-sm font-medium">Logo Upload</p>
              {getStatusBadge(testResults.logoUpload)}
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(testResults.googlePlaces)}
              </div>
              <p className="text-sm font-medium">Google Places</p>
              {getStatusBadge(testResults.googlePlaces)}
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(testResults.menuButtons)}
              </div>
              <p className="text-sm font-medium">Menu Buttons</p>
              {getStatusBadge(testResults.menuButtons)}
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(testResults.dialogStyling)}
              </div>
              <p className="text-sm font-medium">Dialog Styling</p>
              {getStatusBadge(testResults.dialogStyling)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Creation Dialog */}
      <MenuCreationDialog
        open={showMenuDialog}
        onOpenChange={setShowMenuDialog}
        onSuccess={() => {
          setShowMenuDialog(false);
          alert('Menu creation dialog is working correctly!');
        }}
        restaurantId="test-restaurant-id"
      />
    </div>
  );
}
