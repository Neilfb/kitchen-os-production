// GET, PUT, DELETE menu
import { NextRequest, NextResponse } from "next/server";

interface Menu {
  id: string;
  name: string;
  tags?: string[];
  description?: string;
  restaurantId?: string;
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  publishedVersion?: number;
  items?: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  menuId: string;
  allergens?: string[];
  tags?: string[];
  image?: string;
  order?: number;
}

export async function GET(
  req: NextRequest,
  context: { params: { menuId: string } }
) {
  try {
    const { menuId } = context.params;
    if (!menuId) {
      return NextResponse.json({ error: "Missing menu id" }, { status: 400 });
    }
    
    // Demo menu for fallback
    const demoMenu: Menu = {
      id: menuId,
      name: `Demo Menu ${menuId}`,
      tags: ["demo", "test"],
      description: "This is a demo menu",
      restaurantId: "demo-restaurant",
      status: "draft",
      createdAt: "2025-05-24T09:00:00Z",
      updatedAt: "2025-05-24T09:00:00Z",
      items: [
        {
          id: "item-1",
          name: "Demo Item 1",
          description: "A delicious demo item",
          price: 12.99,
          menuId: menuId,
          allergens: ["gluten", "dairy"],
          tags: ["vegetarian", "popular"],
          order: 0
        },
        {
          id: "item-2",
          name: "Demo Item 2",
          description: "Another tasty demo item",
          price: 15.99,
          menuId: menuId,
          allergens: ["nuts"],
          tags: ["spicy", "chef-special"],
          order: 1
        }
      ]
    };
    
    const menu = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}`,
      { method: "GET" },
      demoMenu
    );
    
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }
    return NextResponse.json({ menu, success: true });
  } catch (err) {
    console.error("Error in GET /menus/[menuId]:", err);
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { menuId: string } }
) {
  try {
    const { menuId } = context.params;
    if (!menuId) {
      return NextResponse.json({ error: "Missing menu id" }, { status: 400 });
    }
    const input = await req.json();
    // Validate input: must be object, name required, tags optional (array of strings)
    if (!input || typeof input !== "object") {
      return NextResponse.json(
        { error: "Invalid input: must be an object" },
        { status: 400 },
      );
    }
    if (!input.name || typeof input.name !== "string" || input.name.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid required field: name" },
        { status: 400 },
      );
    }
    if (input.tags && !Array.isArray(input.tags)) {
      return NextResponse.json(
        { error: "Invalid field: tags must be an array of strings" },
        { status: 400 },
      );
    }
    const menu = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
      // Demo fallback
      {
        id: menuId,
        ...input,
        updatedAt: new Date().toISOString()
      }
    );
    return NextResponse.json({ menu, success: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in PUT /menus/[menuId]:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to update menu: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in PUT /menus/[menuId]:", err);
      return NextResponse.json(
        { error: "Failed to update menu (unknown error)" },
        { status: 500 },
      );
    }
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { menuId: string } }
) {
  try {
    const { menuId } = context.params;
    if (!menuId) {
      return NextResponse.json({ error: "Missing menu id" }, { status: 400 });
    }
    await // TODO: Implement Firebase equivalent
      `/menus/${menuId}`,
      { method: "DELETE" },
      { success: true }
    );
    return NextResponse.json({ success: true, message: "Menu deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in DELETE /menus/[menuId]:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to delete menu: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in DELETE /menus/[menuId]:", err);
      return NextResponse.json(
        { error: "Failed to delete menu (unknown error)" },
        { status: 500 },
      );
    }
  }
}
