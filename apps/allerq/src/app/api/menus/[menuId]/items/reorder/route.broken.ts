import { NextRequest, NextResponse } from "next/server";

interface ReorderResponse {
  success: boolean;
  updated: number;
  order: string[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const input = await req.json();
    const { order } = input;
    
    console.log(`Processing reorder request for menu ${params.id}:`, order);
    
    if (!Array.isArray(order)) {
      return NextResponse.json(
        { error: "Invalid or missing order array" },
        { status: 400 }
      );
    }

    if (order.length === 0) {
      return NextResponse.json(
        { error: "Order array cannot be empty" },
        { status: 400 }
      );
    }
    
    // Validate each ID is a string and unique
    const uniqueIds = new Set(order);
    if (!order.every(id => typeof id === 'string') || uniqueIds.size !== order.length) {
      return NextResponse.json(
        { error: "Each item in order array must be a unique item ID string" },
        { status: 400 }
      );
    }
    
    // Fetch current menu items to validate the IDs
    const currentItems = await // TODO: Implement Firebase equivalent
      `/menus/${params.id}/items`,
      { method: "GET" },
      { items: order.map(id => ({ id })) } // Demo data maps the order to items
    );

    // Validate that all provided IDs exist in the menu
    const currentItemIds = new Set(currentItems.items.map(item => item.id));
    const invalidIds = order.filter(id => !currentItemIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid item IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Send reorder request to backend
    const result = await // TODO: Implement Firebase equivalent
      `/menus/${params.id}/items/reorder`,
      {
        method: "POST",
        body: JSON.stringify({ order }),
      },
      // Provide fallback demo data - this simulates successful reordering
      {
        success: true,
        updated: order.length,
        order: order // Preserves the requested order in demo mode
      }
    );
    
    if (!result.success) {
      throw new Error("Backend reorder operation failed");
    }
    
    // Return the updated order, which should match what we sent since it was validated
    return NextResponse.json({
      success: true,
      updated: result.updated,
      order: result.order
    });

  } catch (err) {
    console.error("Error in POST /menus/[id]/items/reorder:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder menu items" },
      { status: 500 }
    );
  }
}
