import { NextRequest, NextResponse } from "next/server";
// Legacy NoCodeBackend removed - using Firebase implementation

interface Analytics {
  metrics: {
    scanCount: number;
    menuCount: number;
    restaurantCount: number;
    totalUsers: number;
    activeUsers: number;
  };
  charts: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
}

export async function GET(req: NextRequest) {
  try {
    // Demo mode response
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      return NextResponse.json({
        metrics: {
          scanCount: 1250,
          menuCount: 85,
          restaurantCount: 42,
          totalUsers: 150,
          activeUsers: 120
        },
        charts: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Menu Scans',
              data: [65, 89, 123, 150, 180, 245],
              borderColor: '#3b82f6'
            },
            {
              label: 'Active Users',
              data: [20, 35, 45, 60, 90, 120],
              borderColor: '#10b981'
            }
          ]
        }
      });
    }

    const searchParams = req.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Use the new CRUD pattern for reading analytics data
    let url = '/read/analytics';
    const params = new URLSearchParams();
    if (customerId) params.set('customerId', customerId);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // TODO: Implement Firebase-based analytics
    return NextResponse.json({
      success: true,
      message: "Analytics endpoint migrated from NoCodeBackend - Firebase implementation pending",
      data: []
    });
  } catch (error) {
    console.error('Error fetching super admin analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
