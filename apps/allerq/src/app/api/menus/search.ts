// Search dishes by name or allergen for a restaurant
import { NextRequest, NextResponse } from "next/server";

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
