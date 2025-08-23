import { NextRequest, NextResponse } from "next/server";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  menuId: string;
  tags?: string[];
  allergens?: string[];
  dietary?: string[];
  image?: string;
  order?: number;
}

// Get a specific menu item
export async function GET(
  _req: NextRequest,
  context: { params: { menuId: string; itemId: string } },
) {
  try {
    const { menuId, itemId } = context.params;
    
    const result = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/items/${itemId}`,
      { method: "GET" },
      // Fallback demo data
      {
        item: {
          id: itemId,
          name: "Demo Menu Item",
          description: "This is a sample menu item for demo purposes",
          price: 12.99,
          menuId: menuId,
          tags: ["sample", "demo"],
          allergens: [],
          dietary: ["vegetarian"],
          order: 1
        }
      }
    );
    
    const { item } = result;
    if (!item || item.menuId !== menuId) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ item });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in GET /menus/[menuId]/items/[itemId]:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to fetch menu item: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in GET /menus/[menuId]/items/[itemId]:", err);
      return NextResponse.json(
        { error: "Failed to fetch menu item (unknown error)" },
        { status: 500 },
      );
    }
  }
}

// Update a specific menu item
export async function PUT(
  req: NextRequest,
  context: { params: { menuId: string; itemId: string } },
) {
  try {
    const { menuId, itemId } = context.params;
    const input = await req.json();

    // Input validation
    if (!input || typeof input !== "object") {
      return NextResponse.json(
        { error: "Invalid input: must be an object" },
        { status: 400 },
      );
    }

    // Check if item exists by using the GET endpoint functionality
    const checkResult = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/items/${itemId}`,
      { method: "GET" },
      // Fallback demo data - we'll use an empty item to simulate not found if in demo mode
      { item: null }
    );
    
    if (!checkResult.item || checkResult.item.menuId !== menuId) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Name is required
    if (!input.name || typeof input.name !== "string" || input.name.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid required field: name" },
        { status: 400 },
      );
    }

    // Validate arrays
    const arrayFields = ["tags", "allergens", "dietary"] as const;
    for (const field of arrayFields) {
      if (input[field] !== undefined && !Array.isArray(input[field])) {
        return NextResponse.json(
          { error: `Invalid field: ${field} must be an array of strings` },
          { status: 400 },
        );
      }
    }

    // Validate string fields
    const stringFields = ["description", "category", "image"] as const;
    for (const field of stringFields) {
      if (input[field] !== undefined && typeof input[field] !== "string") {
        return NextResponse.json(
          { error: `Invalid field: ${field} must be a string` },
          { status: 400 },
        );
      }
    }

    // Validate price
    if (input.price !== undefined && typeof input.price !== "number") {
      return NextResponse.json(
        { error: "Invalid field: price must be a number" },
        { status: 400 },
      );
    }

    // Send the update request to the backend
    const result = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/items/${itemId}`,
      {
        method: "PUT",
        body: JSON.stringify({ ...input, menuId: menuId }),
      },
      // Fallback demo data
      {
        item: {
          ...checkResult.item,
          ...input,
          id: itemId,
          menuId: menuId,
          updatedAt: new Date().toISOString()
        }
      }
    );

    return NextResponse.json({ item: result.item, success: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in PUT /menus/[menuId]/items/[itemId]:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to update menu item: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in PUT /menus/[menuId]/items/[itemId]:", err);
      return NextResponse.json(
        { error: "Failed to update menu item (unknown error)" },
        { status: 500 },
      );
    }
  }
}

// Delete a specific menu item
export async function DELETE(
  _req: NextRequest,
  context: { params: { menuId: string; itemId: string } },
) {
  try {
    const { menuId, itemId } = context.params;

    // Check if item exists
    const checkResult = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/items/${itemId}`,
      { method: "GET" },
      // Fallback demo data - we'll simulate not found in demo mode
      { item: null }
    );
    
    if (!checkResult.item || checkResult.item.menuId !== menuId) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Process delete
    await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/items/${itemId}`,
      { method: "DELETE" },
      { success: true }
    );

    return NextResponse.json({ success: true, message: "Menu item deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in DELETE /menus/[menuId]/items/[itemId]:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to delete menu item: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in DELETE /menus/[menuId]/items/[itemId]:", err);
      return NextResponse.json(
        { error: "Failed to delete menu item (unknown error)" },
        { status: 500 },
      );
    }
  }
}
