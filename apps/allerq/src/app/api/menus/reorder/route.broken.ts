import { NextRequest, NextResponse } from "next/server";

interface ReorderInput {
  menuIds: string[];
}

export async function PUT(req: NextRequest) {
  try {
    const input: ReorderInput = await req.json();

    // Validate input
    if (!Array.isArray(input.menuIds) || input.menuIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty menu order" },
        { status: 400 }
      );
    }

    // Update menu order in backend
    await // TODO: Implement Firebase equivalent
      "/menus/reorder",
      {
        method: "PUT",
        body: JSON.stringify({ menuOrder: input.menuIds }),
      },
      // Demo data for fallback
      { 
        success: true, 
        updated: input.menuIds.length,
        order: input.menuIds
      }
    );

    return NextResponse.json({ success: true, updated: input.menuIds.length });
  } catch (err) {
    console.error("Error in PUT /menus/reorder:", err);
    return NextResponse.json(
      { error: "Failed to update menu order" },
      { status: 500 }
    );
  }
}
