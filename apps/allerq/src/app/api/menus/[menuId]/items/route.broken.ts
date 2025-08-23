import { NextRequest, NextResponse } from "next/server";

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { menuId: string } }
) {
  // Get the menu ID
  const { menuId } = params;
  console.log(`Processing GET request for menu items with menu ID: ${menuId}`);
  
  // Demo mode response when DEMO_MODE is enabled or when no API keys are set
  if (process.env.DEMO_MODE === 'true' || !process.env.NOCODEBACKEND_SECRET_KEY) {
    return NextResponse.json({
      items: [
        {
          id: "demo-item-1",
          name: "Demo Dish 1",
          description: "A delicious demo dish with spectacular flavors",
          price: 12.99,
          menuId: menuId,
          allergens: ["gluten", "dairy"],
          tags: ["vegetarian", "popular"]
        },
        {
          id: "demo-item-2",
          name: "Demo Dish 2",
          description: "Another amazing demo dish that customers love",
          price: 15.99,
          menuId: menuId,
          allergens: ["nuts"],
          tags: ["spicy", "chef-special"]
        }
      ]
    });
  }
  
  try {
    console.log(`Fetching menu items for menu ${menuId}`);
    const data = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/items`,
      { method: "GET" },
      { items: [] }
    );
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching menu items:", err);
    return NextResponse.json(
      { error: "Failed to fetch menu items", details: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { menuId: string } }
) {
  const { menuId } = params;
  console.log(`Processing POST request for menu items with menu ID: ${menuId}`);
  
  // Demo mode response when no API keys are set
  if (!process.env.NOCODEBACKEND_SECRET_KEY) {
    try {
      const input = await req.json();
      console.log("Demo mode: Received menu item input:", input);
      const demoItem = {
        ...input,
        id: `demo-item-${Date.now()}`,
        menuId: menuId,
        createdAt: new Date().toISOString()
      };
      console.log("Demo mode: Created item:", demoItem);
      return NextResponse.json({ item: demoItem });
    } catch (err) {
      console.error("Demo mode: Error parsing JSON:", err);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }
  }
  
  try {
    const input = await req.json();
    console.log(`Attempting to create menu item for menu ${menuId}:`, input);
    
    // Input validation: name required, must be string
    if (!input || typeof input !== "object" || !input.name || typeof input.name !== "string" || input.name.trim() === "") {
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
    if (input.allergens && !Array.isArray(input.allergens)) {
      return NextResponse.json(
        { error: "Invalid field: allergens must be an array of strings" },
        { status: 400 },
      );
    }
    
    const result = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/items`,
      {
        method: "POST",
        body: JSON.stringify({ ...input, menuId }),
      },
      // Demo fallback
      { 
        item: {
          ...input,
          id: `item-${Date.now()}`,
          menuId,
          createdAt: new Date().toISOString()
        }
      }
    );
    
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error creating menu item:", err);
    return NextResponse.json(
      { error: "Failed to create menu item", details: String(err) },
      { status: 500 },
    );
  }
}
