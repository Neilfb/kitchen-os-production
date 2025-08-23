// Restaurant Team Management API - Firebase Firestore Implementation
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[Team API] Missing Firebase credentials');
    } else {
      // Handle private key formatting
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[Team API] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[Team API] Firebase Admin initialization failed:', error);
  }
}

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('[Team Auth] Token verification failed:', error);
    return null;
  }
}

interface TeamMember {
  id: string;
  restaurantId: string;
  userId?: string; // Firebase UID if user exists
  email: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'pending' | 'active' | 'inactive';
  invitedBy: string;
  invitedAt: Date;
  joinedAt?: Date;
  ownerId: string; // Restaurant owner
  createdAt: Date;
  updatedAt: Date;
}

interface TeamParams {
  params: Promise<{ restaurantId: string }>;
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

// Get team members for a restaurant
export async function GET(request: NextRequest, { params }: TeamParams) {
  try {
    const { restaurantId } = await params;
    console.log('[Team API] GET request for restaurant:', restaurantId);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify restaurant ownership
    const db = getFirestore();
    const restaurantRef = db.collection('restaurants').doc(restaurantId);
    const restaurantDoc = await restaurantRef.get();

    if (!restaurantDoc.exists) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data()!;
    if (restaurantData.ownerId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get team members
    const teamRef = db.collection('teamMembers');
    const query = teamRef
      .where('restaurantId', '==', restaurantId)
      .where('status', '!=', 'inactive')
      .orderBy('status')
      .orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    
    const teamMembers: TeamMember[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      teamMembers.push({
        id: doc.id,
        ...data,
        invitedAt: data.invitedAt.toDate(),
        joinedAt: data.joinedAt ? data.joinedAt.toDate() : undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as TeamMember);
    });

    console.log(`[Team API] Found ${teamMembers.length} team members`);
    return NextResponse.json({
      success: true,
      teamMembers,
      count: teamMembers.length
    });

  } catch (error) {
    console.error('[Team API] Error fetching team members:', error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// Invite a team member
export async function POST(request: NextRequest, { params }: TeamParams) {
  try {
    const { restaurantId } = await params;
    console.log('[Team API] POST request - inviting team member to restaurant:', restaurantId);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, role } = body;

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email and role" },
        { status: 400 }
      );
    }

    if (!['admin', 'manager', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, manager, or staff" },
        { status: 400 }
      );
    }

    // Verify restaurant ownership
    const db = getFirestore();
    const restaurantRef = db.collection('restaurants').doc(restaurantId);
    const restaurantDoc = await restaurantRef.get();

    if (!restaurantDoc.exists) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data()!;
    if (restaurantData.ownerId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if user is already a team member
    const existingQuery = db.collection('teamMembers')
      .where('restaurantId', '==', restaurantId)
      .where('email', '==', email.toLowerCase())
      .where('status', '!=', 'inactive');

    const existingSnapshot = await existingQuery.get();
    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 409 }
      );
    }

    // Create team member invitation
    const now = Timestamp.now();
    const newTeamMember = {
      restaurantId,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      invitedBy: userId,
      invitedAt: now,
      ownerId: userId,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await db.collection('teamMembers').add(newTeamMember);
    
    // Get the created document
    const createdDoc = await docRef.get();
    const data = createdDoc.data()!;
    
    const teamMember = {
      id: createdDoc.id,
      ...data,
      invitedAt: data.invitedAt.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as TeamMember;

    console.log('[Team API] Team member invited successfully:', teamMember.id);
    
    // TODO: Send invitation email here
    
    return NextResponse.json({
      success: true,
      teamMember,
      message: `Invitation sent to ${email}`
    });

  } catch (error) {
    console.error('[Team API] Error inviting team member:', error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
}
