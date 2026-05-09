import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getStreamConfig, updateStreamConfig } from "@/lib/db";

export async function GET() {
  const config = await getStreamConfig();
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const config = await updateStreamConfig(body);
  return NextResponse.json(config);
}
