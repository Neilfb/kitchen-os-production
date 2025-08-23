"use client";

import { useCallback, useState } from "react";
import { MenuItem, MenuItemInput } from "../hooks/useMenuItems";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuItemSchema, type MenuItemFormData } from "@/lib/validations/menu-item";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Category } from "@/hooks/useCategories";

interface MenuItemEditorProps {
  onClose: () => void;
  onSave: (data: MenuItemInput) => Promise<void>;
  item?: MenuItem;
  menuId: string;
  itemId?: string | null;
  categories?: Category[];
}

const allergenOptions = [
  "Dairy", "Eggs", "Fish", "Shellfish", "Tree Nuts", 
  "Peanuts", "Wheat", "Soy", "Sesame"
];

const dietaryOptions = [
  "Vegetarian", "Vegan", "Gluten-Free", "Halal", 
  "Kosher", "Low-Carb", "Keto", "Paleo"
];

export default function MenuItemEditor({
  onClose,
  onSave,
  item,
  menuId,
  categories = [],
}: MenuItemEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || 0,
      category: item?.category || "",
      allergens: item?.allergens || [],
      dietary: item?.dietary || [],
      tags: item?.tags || [],
      image: item?.image || "",
      isVisible: item?.isVisible ?? true,
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("menuId", menuId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await response.json();
      form.setValue("image", url);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [menuId, toast, form]);

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      await onSave(data as MenuItemInput);
      toast({
        title: "Success",
        description: `Menu item ${item ? "updated" : "created"} successfully`,
        variant: "success",
      });
      onClose();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast({
        title: "Error",
        description: `Failed to ${item ? "update" : "create"} menu item`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{item ? "Edit" : "Add"} Menu Item</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Item name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your menu item..."
                      className="h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer",
                        isDragging ? "border-primary" : "border-gray-300",
                        "hover:border-primary transition-colors"
                      )}
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
                        if (file) handleImageUpload(file);
                      }}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleImageUpload(file);
                        };
                        input.click();
                      }}
                    >
                      {field.value ? (
                        <div className="relative w-full aspect-video">
                          <Image
                            src={field.value}
                            alt="Menu item"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue("image", "");
                            }}
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4">
                          {isUploading ? (
                            <Icons.spinner className="h-6 w-6 animate-spin mx-auto" />
                          ) : (
                            <>
                              <Icons.image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p>Drop an image here or click to upload</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Allergens */}
            <FormField
              control={form.control}
              name="allergens"
              render={() => (
                <FormItem>
                  <FormLabel>Allergens</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allergenOptions.map((allergen) => (
                      <label
                        key={allergen}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={form.getValues("allergens")?.includes(allergen)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("allergens") || [];
                            const updated = checked
                              ? [...current, allergen]
                              : current.filter((a) => a !== allergen);
                            form.setValue("allergens", updated);
                          }}
                        />
                        <span>{allergen}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dietary Options */}
            <FormField
              control={form.control}
              name="dietary"
              render={() => (
                <FormItem>
                  <FormLabel>Dietary Options</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dietaryOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={form.getValues("dietary")?.includes(option)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("dietary") || [];
                            const updated = checked
                              ? [...current, option]
                              : current.filter((d) => d !== option);
                            form.setValue("dietary", updated);
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {item ? "Update" : "Create"} Item
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
