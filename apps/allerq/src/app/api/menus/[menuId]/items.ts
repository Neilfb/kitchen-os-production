import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../config/noCodeBackend";

export async function GET(
  _req: NextRequest,
  context: { params: { menuId: string } },
) {
  try {
    const data = await backend
      .collection("menuItems")
      .list({ filter: { menuId: context.params.menuId } });
    return NextResponse.json({ items: data.items });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in GET /menus/[id]/items:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to fetch menu items: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in GET /menus/[id]/items:", err);
      return NextResponse.json(
        { error: "Failed to fetch menu items (unknown error)" },
        { status: 500 },
      );
    }
  }
}

interface MenuItemInput {
  name: string;
  description?: string;
  price?: number;
  tags?: string[];
  allergens?: string[];
  image?: string;
  category?: string;
  dietary?: string[];
}

export async function POST(
  req: NextRequest,
  context: { params: { menuId: string } },
) {
  try {
    const input: MenuItemInput = await req.json();

    // Input validation: name required, must be string
    if (!input || typeof input !== "object" || !input.name || typeof input.name !== "string" || input.name.trim() === "") {
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

    const item = await backend
      .collection("menuItems")
      .create({ ...input, menuId: context.params.menuId });
    return NextResponse.json({ item });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in POST /menus/[id]/items:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to create menu item: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in POST /menus/[id]/items:", err);
      return NextResponse.json(
        { error: "Failed to create menu item (unknown error)" },
        { status: 500 },
      );
    }
  }
}