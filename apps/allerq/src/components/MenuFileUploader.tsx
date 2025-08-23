"use client";

import { useState, useCallback } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MenuFileUploaderProps {
  menuId: string;
  onItemsExtracted: (items: Array<{
    name: string;
    description?: string;
    price?: number;
    allergens?: string[];
    dietary?: string[];
  }>) => void;
}

export default function MenuFileUploader({ menuId, onItemsExtracted }: MenuFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileDrop = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, JPEG, or PNG file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('menuId', menuId);

    try {
      const response = await fetch('/api/menus/extract', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to process menu file');

      const { items } = await response.json();
      onItemsExtracted(items);

      toast({
        title: "Success",
        description: `Successfully extracted ${items.length} items from menu`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error processing menu file:', error);
      toast({
        title: "Error",
        description: "Failed to process menu file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [menuId, onItemsExtracted, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Menu</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragging ? 'border-primary' : 'border-gray-300'}
            hover:border-primary transition-colors
          `}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileDrop(file);
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.docx,.jpeg,.jpg,.png';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleFileDrop(file);
            };
            input.click();
          }}
        >
          {isProcessing ? (
            <div>
              <Icons.spinner className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p>Processing menu file...</p>
            </div>
          ) : (
            <>
              <Icons.upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Upload a menu file (PDF, DOCX, JPEG, PNG) or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">The AI will automatically extract menu items and detect allergens</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
