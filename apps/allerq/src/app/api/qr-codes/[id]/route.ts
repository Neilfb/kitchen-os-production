// Individual QR Code API - Firebase Firestore Implementation
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
      console.error('[QR Code API] Missing Firebase credentials');
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
      console.log('[QR Code API] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[QR Code API] Firebase Admin initialization failed:', error);
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
    console.error('[QR Code Auth] Token verification failed:', error);
    return null;
  }
}

interface QrCode {
  id: string;
  restaurantId: string;
  menuId?: string;
  name: string;
  type: 'restaurant' | 'menu';
  url: string;
  qrCodeData: string;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QrCodeParams {
  params: Promise<{ id: string }>;
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

// Get individual QR code
export async function GET(request: NextRequest, { params }: QrCodeParams) {
  try {
    const { id: qrCodeId } = await params;
    console.log('[QR Code API] GET request for QR code:', qrCodeId);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getFirestore();
    const docRef = db.collection('qrCodes').doc(qrCodeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    
    // Verify ownership
    if (data.ownerId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const qrCode = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as QrCode;

    return NextResponse.json({
      success: true,
      qrCode
    });

  } catch (error) {
    console.error('[QR Code API] Error fetching QR code:', error);
    return NextResponse.json(
      { error: "Failed to fetch QR code" },
      { status: 500 }
    );
  }
}

// Update QR code
export async function PUT(request: NextRequest, { params }: QrCodeParams) {
  try {
    const { id: qrCodeId } = await params;
    console.log('[QR Code API] PUT request for QR code:', qrCodeId);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, url, type, isActive } = body;

    const db = getFirestore();
    const docRef = db.collection('qrCodes').doc(qrCodeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    
    // Verify ownership
    if (data.ownerId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Update fields
    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    if (name !== undefined) updateData.name = name;
    if (url !== undefined) {
      updateData.url = url;
      updateData.qrCodeData = url; // Update QR code data when URL changes
    }
    if (type !== undefined) updateData.type = type;
    if (isActive !== undefined) updateData.isActive = isActive;

    await docRef.update(updateData);

    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data()!;
    
    const qrCode = {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData.createdAt.toDate(),
      updatedAt: updatedData.updatedAt.toDate()
    } as QrCode;

    console.log('[QR Code API] QR code updated successfully');
    return NextResponse.json({
      success: true,
      qrCode
    });

  } catch (error) {
    console.error('[QR Code API] Error updating QR code:', error);
    return NextResponse.json(
      { error: "Failed to update QR code" },
      { status: 500 }
    );
  }
}

// Delete QR code (soft delete)
export async function DELETE(request: NextRequest, { params }: QrCodeParams) {
  try {
    const { id: qrCodeId } = await params;
    console.log('[QR Code API] DELETE request for QR code:', qrCodeId);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getFirestore();
    const docRef = db.collection('qrCodes').doc(qrCodeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    
    // Verify ownership
    if (data.ownerId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await docRef.update({
      isActive: false,
      updatedAt: Timestamp.now()
    });

    console.log('[QR Code API] QR code soft deleted successfully');
    return NextResponse.json({
      success: true,
      message: "QR code deleted successfully"
    });

  } catch (error) {
    console.error('[QR Code API] Error deleting QR code:', error);
    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 }
    );
  }
}
