"use client";

import { useState } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Upload, Wand2, Edit3, FileText, Brain } from "lucide-react";

interface MenuCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (menuId: string) => void;
  restaurantId: string;
}

type CreationMethod = 'manual' | 'upload' | 'ai_assisted';

export function MenuCreationDialog({
  open,
  onOpenChange,
  onSuccess,
  restaurantId
}: MenuCreationDialogProps) {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    creationMethod: 'manual' as CreationMethod,
    aiPrompt: "",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF, Word document, or text file");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setUploadFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Menu name is required");
      return;
    }

    if (formData.creationMethod === 'upload' && !uploadFile) {
      setError("Please upload a menu file");
      return;
    }

    if (formData.creationMethod === 'ai_assisted' && !formData.aiPrompt.trim()) {
      setError("Please provide instructions for AI menu creation");
      return;
    }

    setError("");
    setIsCreating(true);

    try {
      // Check authentication
      if (!user) {
        setError('Please sign in to create a menu');
        return;
      }

      // Get Firebase ID token
      const token = await user.getIdToken();
      console.log('[MenuCreation] Creating menu with Firebase token');

      // Create menu with proper file upload handling
      let response;

      if (formData.creationMethod === 'upload' && uploadFile) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('creationMethod', formData.creationMethod);
        formDataToSend.append('menuFile', uploadFile);

        response = await fetch(`/api/restaurants/${restaurantId}/menus`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - browser will set it with boundary
          },
          body: formDataToSend,
        });
      } else {
        // Use JSON for non-file uploads
        response = await fetch(`/api/restaurants/${restaurantId}/menus`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            creationMethod: formData.creationMethod,
            aiPrompt: formData.aiPrompt.trim(),
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        onSuccess?.(data.menu.id);
        onOpenChange(false);
        // Reset form
        setFormData({ name: "", description: "", creationMethod: 'manual', aiPrompt: "" });
        setUploadFile(null);
      } else {
        setError(data.error || 'Failed to create menu');
      }
    } catch (err) {
      console.error("Error creating menu:", err);
      setError("Failed to create menu. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const creationMethods = [
    {
      value: 'manual',
      title: 'Manual Creation',
      description: 'Build your menu from scratch with full control',
      icon: <Edit3 className="h-5 w-5" />,
      features: ['Complete control', 'Custom categories', 'Step-by-step guidance']
    },
    {
      value: 'upload',
      title: 'Upload Menu File',
      description: 'Upload PDF or Word document for AI processing',
      icon: <Upload className="h-5 w-5" />,
      features: ['PDF/Word support', 'AI extraction', 'Auto-categorization']
    },
    {
      value: 'ai_assisted',
      title: 'AI-Assisted Creation',
      description: 'Describe your menu and let AI create it for you',
      icon: <Brain className="h-5 w-5" />,
      features: ['Natural language', 'Smart suggestions', 'Instant creation']
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border border-gray-200 shadow-xl"
        aria-describedby="menu-creation-description"
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center space-x-2 text-gray-900 text-lg font-semibold">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Create New Menu</span>
          </DialogTitle>
          <p id="menu-creation-description" className="sr-only">
            Create a new menu for your restaurant using manual creation, file upload, or AI assistance
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Menu Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Dinner Menu, Lunch Specials, Weekend Brunch"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this menu..."
                rows={2}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Creation Method Selection */}
          <div className="space-y-4">
            <Label className="text-gray-700 font-medium text-base">How would you like to create your menu?</Label>
            <RadioGroup
              value={formData.creationMethod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, creationMethod: value as CreationMethod }))}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {creationMethods.map((method) => (
                <div key={method.value} className="relative">
                  <RadioGroupItem
                    value={method.value}
                    id={method.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method.value}
                    className="cursor-pointer"
                  >
                    <Card className="peer-checked:ring-2 peer-checked:ring-blue-500 peer-checked:border-blue-500 hover:shadow-md transition-all bg-white border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-sm text-gray-900">
                          {method.icon}
                          <span>{method.title}</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-600">
                          {method.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-xs text-gray-600 space-y-1">
                          {method.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Method-specific inputs */}
          {formData.creationMethod === 'upload' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <Upload className="h-4 w-4" />
                <span className="font-medium">Upload Menu File</span>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="menuFile" className="text-blue-800 font-medium">Select File (PDF, Word, or Text)</Label>
                <Input
                  id="menuFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadFile && (
                  <p className="text-sm text-green-700 flex items-center space-x-1 bg-green-50 p-2 rounded">
                    <Icons.check className="h-3 w-3" />
                    <span>{uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </p>
                )}
              </div>
              
              <div className="text-xs text-blue-700 bg-blue-100 p-3 rounded">
                <p className="font-medium mb-1">AI will automatically:</p>
                <ul className="space-y-1">
                  <li>• Extract menu items and descriptions</li>
                  <li>• Detect allergens based on your restaurant's location</li>
                  <li>• Categorize items (starters, mains, desserts, etc.)</li>
                  <li>• Identify dietary preferences (vegetarian, vegan, etc.)</li>
                </ul>
              </div>
            </div>
          )}

          {formData.creationMethod === 'ai_assisted' && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 text-purple-800">
                <Wand2 className="h-4 w-4" />
                <span className="font-medium">AI Menu Creation</span>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="aiPrompt" className="text-purple-800 font-medium">Describe your menu *</Label>
                <Textarea
                  id="aiPrompt"
                  name="aiPrompt"
                  value={formData.aiPrompt}
                  onChange={handleChange}
                  placeholder="e.g., Create a Mediterranean dinner menu with 3 starters, 5 main courses, and 3 desserts. Include vegetarian and gluten-free options. Focus on fresh seafood and seasonal vegetables."
                  rows={4}
                  required={formData.creationMethod === 'ai_assisted'}
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900"
                />
              </div>
              
              <div className="text-xs text-purple-700 bg-purple-100 p-3 rounded">
                <p className="font-medium mb-1">AI will create:</p>
                <ul className="space-y-1">
                  <li>• Complete menu items with descriptions</li>
                  <li>• Appropriate categories and organization</li>
                  <li>• Allergen and dietary tags</li>
                  <li>• Suggested pricing (you can adjust)</li>
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-700 text-sm bg-red-50 p-3 rounded border border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}

          <DialogFooter className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {formData.creationMethod === 'manual' ? 'Create Menu' :
               formData.creationMethod === 'upload' ? 'Upload & Process' :
               'Generate with AI'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
