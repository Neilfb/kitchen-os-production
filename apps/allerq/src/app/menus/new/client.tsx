'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMenus, MenuInput } from "@/hooks/useMenus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateMenuClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const { createMenu } = useMenus();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to dashboard if no restaurant ID is provided
  useEffect(() => {
    if (!restaurantId) {
      toast({
        title: "Restaurant Required",
        description: "Please select a restaurant first to create a menu.",
        variant: "destructive",
      });
      router.push('/dashboard');
    }
  }, [restaurantId, router, toast]);
  
  // Form state
  const [formData, setFormData] = useState<MenuInput>({
    name: "",
    description: "",
    tags: [],
    restaurantId: restaurantId || undefined,
    status: "draft",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "");
    
    setFormData({
      ...formData,
      tags: tagsArray,
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("Creating menu with data:", formData);
      const menu = await createMenu(formData);
      
      if (!menu) {
        throw new Error("Failed to create menu");
      }
      
      toast({
        title: "Success",
        description: "Menu created successfully",
        variant: "success",
      });
      
      // Redirect back to restaurant menus page
      window.location.href = `/restaurants/${restaurantId}/menus`;
    } catch (err) {
      console.error("Error creating menu:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      toast({
        title: "Error",
        description: `Failed to create menu: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Menu</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="name" className="font-medium">
              Menu Name *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter menu name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Enter menu description"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tags" className="font-medium">
              Tags (comma-separated)
            </label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags?.join(", ") || ""}
              onChange={handleTagsChange}
              placeholder="breakfast, lunch, dinner, etc."
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Menu"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
