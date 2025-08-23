import { useState } from "react";
import { MenuItem } from "@/hooks/useMenuItems";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface MenuItemPreviewProps {
  items: MenuItem[];
  onClose: () => void;
}

export default function MenuItemPreview({ items, onClose }: MenuItemPreviewProps) {
  const [viewMode, setViewMode] = useState<"customer" | "qr">("customer");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Group items by category
  const categories = items.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
  
  const categoryNames = Object.keys(categories);
  
  // Set initial active category if none is selected
  if (!activeCategory && categoryNames.length > 0) {
    setActiveCategory(categoryNames[0]);
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex gap-4">
            <h2 className="font-bold text-xl">Menu Preview</h2>
            <div className="flex border rounded-md overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${
                  viewMode === "customer" ? "bg-blue-100 text-blue-800" : "bg-white"
                }`}
                onClick={() => setViewMode("customer")}
              >
                Customer View
              </button>
              <button
                className={`px-3 py-1 text-sm ${
                  viewMode === "qr" ? "bg-blue-100 text-blue-800" : "bg-white"
                }`}
                onClick={() => setViewMode("qr")}
              >
                QR Code
              </button>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icons.close className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {viewMode === "customer" ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Category sidebar */}
              <div className="md:w-48 flex flex-row md:flex-col overflow-auto gap-1 mb-4 md:mb-0 pb-2 md:pb-0">
                {categoryNames.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-2 text-left text-sm rounded-md whitespace-nowrap ${
                      activeCategory === category
                        ? "bg-blue-100 text-blue-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Menu items */}
              <div className="flex-1">
                {activeCategory && categories[activeCategory]?.length > 0 ? (
                  <>
                    <h3 className="font-semibold text-lg mb-4">{activeCategory}</h3>
                    <div className="space-y-4">
                      {categories[activeCategory].map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4 flex items-start gap-4">
                            {item.image && (
                              <div className="flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={80}
                                  height={80}
                                  className="rounded-md object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{item.name}</h4>
                                {item.price && (
                                  <span className="font-bold">
                                    ${item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.allergens?.map((allergen) => (
                                  <span
                                    key={allergen}
                                    className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs"
                                  >
                                    {allergen}
                                  </span>
                                ))}
                                {item.dietary?.map((diet) => (
                                  <span
                                    key={diet}
                                    className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                                  >
                                    {diet}
                                  </span>
                                ))}
                                {item.tags?.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No items in this category
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
                <div className="border p-4 rounded-lg">
                  <Icons.qrCode className="h-64 w-64" />
                </div>
              </div>
              <p className="mt-4 text-center text-gray-600">
                Scan this QR code to view the menu on your device.<br />
                You can generate and customize QR codes in the QR Studio.
              </p>
              <Button className="mt-4" variant="outline">
                <Icons.arrowRight className="mr-2 h-4 w-4" />
                Go to QR Studio
              </Button>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close Preview</Button>
        </div>
      </div>
    </div>
  );
}
