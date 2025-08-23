// Search dishes by name or allergen for a restaurant
import { NextRequest, NextResponse } from "next/server";

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

interface MenuItem {
  id: string;
  name: string;
  allergens?: string[];
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const q = searchParams.get("q")?.toLowerCase() || "";
    
    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }
    
    // Demo mode response when DEMO_MODE is enabled or when no API keys are set
    if (process.env.DEMO_MODE === 'true' || !process.env.NOCODEBACKEND_SECRET_KEY) {
      const demoItems = [
        {
          id: "demo-item-1",
          name: "Vegetarian Pasta",
          description: "Delicious pasta with fresh vegetables",
          price: 12.99,
          allergens: ["gluten"],
          tags: ["vegetarian"]
        },
        {
          id: "demo-item-2",
          name: "Classic Burger",
          description: "Juicy beef burger with cheese",
          price: 14.99,
          allergens: ["dairy", "gluten"],
          tags: ["popular"]
        },
        {
          id: "demo-item-3",
          name: "Vegan Salad",
          description: "Fresh salad with seasonal vegetables",
          price: 9.99,
          allergens: ["nuts"],
          tags: ["vegan", "healthy"]
        }
      ];
      
      let filteredItems = demoItems;
      
      if (q) {
        filteredItems = demoItems.filter((item) => {
          const name = (item.name || "").toLowerCase();
          const allergens = (item.allergens || []).map((a) => a.toLowerCase());
          return name.includes(q) || allergens.some((a) => a.includes(q));
        });
      }
      
      return NextResponse.json({ results: filteredItems });
    }
    
    // Fetch all menu items for the restaurant
    const data = await fetch(`https://api.example.com/menuItems?restaurantId=${restaurantId}`).then(res => res.json());
    let items = data.items || [];
    
    if (q) {
      items = items.filter((item: MenuItem) => {
        const name = (item.name || "").toLowerCase();
        const allergens = (item.allergens || []).map((a: string) => a.toLowerCase());
        return name.includes(q) || allergens.some((a: string) => a.includes(q));
      });
    }
    
    return NextResponse.json({ results: items });
  } catch (err) {
    console.error("Error in GET /menus/search:", err);
    return NextResponse.json({ error: "Failed to search dishes" }, { status: 500 });
  }
}
