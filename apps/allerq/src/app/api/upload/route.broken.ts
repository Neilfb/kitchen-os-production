import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const menuId = formData.get("menuId") as string;

    if (!file || !menuId) {
      return NextResponse.json(
        { error: "File and menu ID are required" },
        { status: 400 }
      );
    }

    // Create form data to send to the backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("menuId", menuId);

    // TODO: Implement Firebase equivalent - stubbed for now
      "/upload",
      {
        method: "POST",
        body: backendFormData,
      },
      { url: "https://placehold.co/400x300" } // Demo data
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
