// QR Codes API - Firebase Firestore Implementation
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
      console.error('[QR Codes API] Missing Firebase credentials');
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
      console.log('[QR Codes API] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[QR Codes API] Firebase Admin initialization failed:', error);
  }
}

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[QR Codes Auth] No authorization header found');
      return null;
    }
    const token = authHeader.substring(7);
    console.log('[QR Codes Auth] Verifying token...');
    const decodedToken = await getAuth().verifyIdToken(token);
    console.log('[QR Codes Auth] Token verified for user:', decodedToken.uid);
    return decodedToken.uid;
  } catch (error) {
    console.error('[QR Codes Auth] Token verification failed:', error);
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

// Get QR codes for authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('[QR Codes API] GET request - fetching QR codes');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      console.error('[QR Codes API] Authentication failed - no valid token');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('[QR Codes API] User authenticated:', userId);

    const db = getFirestore();
    const qrCodesRef = db.collection('qrCodes');
    
    // Get QR codes for this user
    const query = qrCodesRef
      .where('ownerId', '==', userId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    
    const qrCodes: QrCode[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      qrCodes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as QrCode);
    });

    console.log(`[QR Codes API] Found ${qrCodes.length} QR codes for user`);
    return NextResponse.json({ 
      success: true,
      qrCodes,
      count: qrCodes.length
    });

  } catch (error) {
    console.error("[QR Codes API] Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}

// Create new QR code
export async function POST(request: NextRequest) {
  try {
    console.log('[QR Codes API] POST request - creating QR code');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      console.error('[QR Codes API] Authentication failed - no valid token');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { restaurantId, menuId, name, type, url } = body;

    // Validate required fields
    if (!restaurantId || !name || !type || !url) {
      return NextResponse.json(
        { error: "Missing required fields: restaurantId, name, type, url" },
        { status: 400 }
      );
    }

    // Generate QR code data (URL for now, could be enhanced with actual QR generation)
    const qrCodeData = url;

    const db = getFirestore();
    const now = Timestamp.now();
    
    const newQrCode = {
      restaurantId,
      menuId: menuId || null,
      name,
      type,
      url,
      qrCodeData,
      isActive: true,
      ownerId: userId,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await db.collection('qrCodes').add(newQrCode);
    
    // Get the created document
    const createdDoc = await docRef.get();
    if (!createdDoc.exists) {
      throw new Error('Failed to retrieve created QR code');
    }

    const data = createdDoc.data()!;
    const qrCode = {
      id: createdDoc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as QrCode;

    console.log('[QR Codes API] QR code created successfully:', qrCode.id);
    return NextResponse.json({
      success: true,
      qrCode
    });

  } catch (error) {
    console.error('[QR Codes API] Error creating QR code:', error);
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}
