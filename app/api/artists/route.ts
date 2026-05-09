import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getArtists, createArtist } from "@/lib/db";
import type { Artist } from "@/types/content";

export async function GET() {
  const artists = await getArtists();
  return NextResponse.json(artists);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Artist;
  if (!body.id || !body.name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }

  const artist = await createArtist(body);
  return NextResponse.json(artist, { status: 201 });
}
