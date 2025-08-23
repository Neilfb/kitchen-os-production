// GET, POST menus
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
}

export async function GET() {
  try {
    // Demo data for fallback
    const demoMenus: Menu[] = [
      {
        id: "demo-menu-1",
        name: "Breakfast Menu",
        tags: ["breakfast", "morning"],
        description: "Our morning breakfast options",
        restaurantId: "demo-restaurant",
        status: "published",
        createdAt: "2025-05-24T09:00:00Z",
        updatedAt: "2025-05-24T09:00:00Z",
        publishedAt: "2025-05-24T10:00:00Z",
        publishedVersion: 1
      },
      {
        id: "demo-menu-2",
        name: "Lunch Menu",
        tags: ["lunch", "afternoon"],
        description: "Lunch options",
        restaurantId: "demo-restaurant",
        status: "draft",
        createdAt: "2025-05-24T11:00:00Z",
        updatedAt: "2025-05-24T11:00:00Z"
      }
    ];

    // TODO: Implement Firebase equivalent - stubbed for now
      "/menus",
      { method: "GET" },
      { items: demoMenus }
    );
    
    if (!data || !Array.isArray(data.items)) {
      console.error("Invalid data from backend in GET /menus", data);
      return NextResponse.json(
        { error: "Invalid data from backend" },
        { status: 500 },
      );
    }
    return NextResponse.json({ menus: data.items });
  } catch (err) {
    console.error("Error in GET /menus:", err);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Received POST request to /api/menus");
    
    // Parse request body and handle JSON parsing errors
    let input;
    try {
      input = await req.json();
    } catch (parseError) {
      console.error("Error parsing JSON body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }
    
    console.log("Request body parsed:", input);
    
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
    
    // Generate a fallback demo menu with a unique ID
    const demoMenu: Menu = {
      id: `menu-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: input.name,
      tags: input.tags || [],
      description: input.description || "",
      restaurantId: input.restaurantId || "demo-restaurant",
      status: input.status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log("Sending request to backend with fallback demo menu:", demoMenu);
    
    // Make the API request with the fallback data
    // TODO: Implement Firebase equivalent - stubbed for now
      "/menus",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      demoMenu
    );
    
    console.log("Menu created successfully:", menu);
    return NextResponse.json({ menu, success: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in POST /menus:", err.message, err.stack);
      return NextResponse.json(
        { error: `Failed to create menu: ${err.message}` },
        { status: 500 },
      );
    } else {
      console.error("Unknown error in POST /menus:", err);
      return NextResponse.json(
        { error: "Failed to create menu (unknown error)" },
        { status: 500 },
      );
    }
  }
}
