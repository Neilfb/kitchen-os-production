import { NextRequest, NextResponse } from "next/server";

interface Customer {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export async function GET() {
  try {
    // Demo mode response
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      return NextResponse.json({
        customers: [
          {
            id: 'demo-1',
            email: 'john@example.com',
            name: 'John Doe',
            role: 'user',
            status: 'active',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-2',
            email: 'jane@example.com',
            name: 'Jane Smith',
            role: 'user',
            status: 'active',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    }

    const data = await // TODO: Implement Firebase equivalent
      "/admin/customers",
      { method: "GET" }
    );

    return NextResponse.json({ customers: data.items });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { customerId, action } = await req.json();
    
    if (!customerId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!['suspend', 'activate', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Demo mode response
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        message: `Customer ${action}d successfully in demo mode`
      });
    }

    const response = await // TODO: Implement Firebase equivalent
      `/admin/customers/${customerId}/${action}`,
      { method: "PUT" }
    );

    return NextResponse.json({
      success: true,
      message: `Customer ${action}d successfully`
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
