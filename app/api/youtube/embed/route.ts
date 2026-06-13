import { NextRequest, NextResponse } from "next/server";
import { extractPlaylistId, extractVideoId, getFirstPlaylistVideo } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // No API key — use basic embed (video or videoseries)
    const videoId = extractVideoId(url);
    const listId = extractPlaylistId(url);
    if (videoId) {
      const params = listId ? `autoplay=0&list=${listId}` : "autoplay=0";
      return NextResponse.json({ embedUrl: `https://www.youtube.com/embed/${videoId}?${params}` });
    }
    if (listId) {
      return NextResponse.json({ embedUrl: `https://www.youtube.com/embed/videoseries?autoplay=0&list=${listId}` });
    }
    return NextResponse.json({ error: "Could not parse YouTube URL" }, { status: 400 });
  }

  const videoId = extractVideoId(url);
  const listId = extractPlaylistId(url);

  // If it's a direct video URL
  if (videoId && !listId) {
    return NextResponse.json({
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0`,
    });
  }

  // If it's a playlist — get first video via API, embed with listType=playlist
  if (listId) {
    const firstVideoId = await getFirstPlaylistVideo(apiKey, listId);
    if (firstVideoId) {
      const params = [
        `list=${listId}`,
        "listType=playlist",
        "autoplay=0",
      ].join("&");
      return NextResponse.json({
        embedUrl: `https://www.youtube.com/embed/${firstVideoId}?${params}`,
      });
    }
    // Fallback: videoseries embed
    return NextResponse.json({
      embedUrl: `https://www.youtube.com/embed/videoseries?autoplay=0&list=${listId}`,
    });
  }

  return NextResponse.json({ error: "Could not parse YouTube URL" }, { status: 400 });
}