import { NextRequest, NextResponse } from "next/server";

interface Category {
  id: string;
  name: string;
  order: number;
}

interface CategoryResponse {
  categories: Category[];
}

function isValidCategoryResponse(data: unknown): data is CategoryResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "categories" in data &&
    Array.isArray((data as CategoryResponse).categories)
  );
}

export async function GET(
  _req: NextRequest,
  context: { params: { menuId: string } }
) {
  try {
    // Define demo data for fallback
    const demoCategories = [
      { id: "cat-1", name: "Starters", order: 0 },
      { id: "cat-2", name: "Main Dishes", order: 1 },
      { id: "cat-3", name: "Desserts", order: 2 },
      { id: "cat-4", name: "Drinks", order: 3 }
    ];

    const data = await // TODO: Implement Firebase equivalent
      `/menus/${context.params.menuId}/categories`,
      { method: "GET" },
      { categories: demoCategories }
    );

    if (!isValidCategoryResponse(data)) {
      throw new Error("Invalid response format from backend");
    }

    return NextResponse.json({ categories: data.categories });
  } catch (err) {
    console.error("Error in GET /menus/[menuId]/categories:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { menuId: string } }
) {
  try {
    const { menuId } = context.params;
    const input = await req.json();

    // Validate input
    if (!input || typeof input.name !== 'string' || input.name.trim() === '') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: input.name,
      order: input.order || 0
    };

    const result = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/categories`,
      {
        method: "POST",
        body: JSON.stringify(newCategory)
      },
      newCategory
    );

    return NextResponse.json({ category: result });
  } catch (err) {
    console.error("Error in POST /menus/[menuId]/categories:", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
