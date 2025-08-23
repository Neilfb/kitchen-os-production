import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: { menuId: string; categoryId: string } }
) {
  try {
    const { menuId, categoryId } = context.params;
    
    const result = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/categories/${categoryId}`,
      { method: "GET" },
      // Provide demo fallback data
      {
        id: categoryId,
        name: "Demo Category",
        order: 0
      }
    );
    
    return NextResponse.json({ category: result });
  } catch (err) {
    console.error("Error in GET /menus/[menuId]/categories/[categoryId]:", err);
    return NextResponse.json(
      { error: "Failed to fetch menu category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { menuId: string; categoryId: string } }
) {
  try {
    const { menuId, categoryId } = context.params;
    const input = await req.json();
    
    if (!input || typeof input.name !== 'string' || input.name.trim() === '') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    
    const result = await // TODO: Implement Firebase equivalent
      `/menus/${menuId}/categories/${categoryId}`,
      {
        method: "PUT",
        body: JSON.stringify(input)
      },
      // Provide demo fallback data
      {
        id: categoryId,
        ...input,
        updatedAt: new Date().toISOString()
      }
    );
    
    return NextResponse.json({ category: result });
  } catch (err) {
    console.error("Error in PUT /menus/[menuId]/categories/[categoryId]:", err);
    return NextResponse.json(
      { error: "Failed to update menu category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { menuId: string; categoryId: string } }
) {
  try {
    const result = await // TODO: Implement Firebase equivalent
      `/menus/${context.params.menuId}/categories/${context.params.categoryId}`,
      {
        method: 'DELETE'
      },
      { success: true }
    );
    
    return Response.json(result);
  } catch (err) {
    console.error('Error deleting category:', err);
    return Response.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
