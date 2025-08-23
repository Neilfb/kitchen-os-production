import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/requireRole";
import { UserRole } from "@/contexts/AuthContext";
import { noCodeBackendFetch } from "@/lib/noCodeBackendFetch";

// POST - Invite a team member
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    // Ensure user has permission (admin or manager)
    await requireRole(["admin", "manager"] as UserRole[]);

    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email and role" },
        { status: 400 }
      );
    }

    // Demo response for development
    const demoTeamMember = {
      id: `team_${Date.now()}`,
      email,
      role,
    };

    const response = await noCodeBackendFetch(
      `/restaurants/${params.restaurantId}/team`,
      {
        method: "POST",
        body: JSON.stringify({ email, role }),
      },
      { success: true, teamMember: demoTeamMember }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Team API] Error:", error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
}

// GET - List all team members for a restaurant
export async function GET(
  _req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    // Ensure user has permission (admin or any role within the restaurant)
    await requireRole(["admin", "manager", "staff"] as UserRole[]);

    const restaurantId = params.restaurantId;

    // Demo response for development
    const demoMembers = [
      {
        id: "team_001",
        email: "manager@example.com",
        role: "manager" as UserRole,
      },
      {
        id: "team_002",
        email: "chef@example.com",
        role: "staff" as UserRole,
      },
      {
        id: "team_003",
        email: "supervisor@example.com",
        role: "admin" as UserRole,
      },
    ];

    const response = await noCodeBackendFetch(
      `/restaurants/${restaurantId}/team`,
      { method: "GET" },
      { team: demoMembers }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Team API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
