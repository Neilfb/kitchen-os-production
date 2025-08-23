// GET all menu items across all menus
import { NextRequest, NextResponse } from "next/server";
import { noCodeBackendFetch } from "@/lib/noCodeBackendFetch";

interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  dietary?: string[];
  tags?: string[];
  image?: string;
  order?: number;
  isVisible?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function GET() {
  try {
    // Demo data for fallback
    const demoItems: MenuItem[] = [
      {
        id: "demo-item-1",
        menuId: "demo-menu-1",
        name: "Pancakes",
        description: "Fluffy pancakes with maple syrup",
        price: 8.99,
        category: "Breakfast",
        allergens: ["Dairy", "Eggs", "Wheat"],
        dietary: ["Vegetarian"],
        tags: ["breakfast", "sweet"],
        isVisible: true,
        created_at: "2025-05-24T09:00:00Z",
        updated_at: "2025-05-24T09:00:00Z"
      },
      {
        id: "demo-item-2",
        menuId: "demo-menu-1",
        name: "Avocado Toast",
        description: "Sourdough toast with smashed avocado",
        price: 12.50,
        category: "Breakfast",
        allergens: ["Wheat"],
        dietary: ["Vegan", "Vegetarian"],
        tags: ["breakfast", "healthy"],
        isVisible: true,
        created_at: "2025-05-24T09:30:00Z",
        updated_at: "2025-05-24T09:30:00Z"
      }
    ];

    const data = await noCodeBackendFetch<{ items: MenuItem[] }>(
      "/menu-items",
      { method: "GET" },
      { items: demoItems }
    );
    
    if (!data || !Array.isArray(data.items)) {
      console.error("Invalid data from backend in GET /menu-items", data);
      return NextResponse.json(
        { error: "Invalid data from backend" },
        { status: 500 },
      );
    }
    
    return NextResponse.json({ items: data.items });
  } catch (err) {
    console.error("Error in GET /menu-items:", err);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 },
    );
  }
}
