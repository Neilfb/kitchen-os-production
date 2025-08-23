// API route for bulk upload processing (placeholder)
import { NextRequest, NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var menus: { id: string; name: string; tags?: string[] }[] | undefined;
}
const menus = global.menus ?? [];
if (!global.menus) global.menus = menus;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const text = await file.text();
  let parsed: { name: string; tags?: string[] }[] = [];
  try {
    parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Invalid file format. Must be JSON array." },
      { status: 400 },
    );
  }
  const newMenus = parsed.map((m) => ({
    id: Date.now().toString() + Math.random(),
    ...m,
  }));
  global.menus = [...(global.menus ?? []), ...newMenus];
  return NextResponse.json({ success: true, count: newMenus.length });
}
