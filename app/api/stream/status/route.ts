import { NextResponse } from "next/server";
import { getStreamConfig } from "@/lib/db";

export async function GET() {
  // Check if stream is disabled via admin kill switch
  const streamConfig = await getStreamConfig();
  if (streamConfig.disabled) {
    return NextResponse.json({
      isLive: false,
      videoId: null,
      source: "disabled",
    });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    // No API configured — fall back to manual config
    return NextResponse.json({
      isLive: false,
      videoId: null,
      source: "none",
    });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("eventType", "live");
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "date");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });

    if (!res.ok) {
      console.error("YouTube API error:", res.status, await res.text());
      return NextResponse.json({
        isLive: false,
        videoId: null,
        source: "error",
      });
    }

    const data = await res.json();
    const items = data.items ?? [];

    if (items.length > 0) {
      const videoId = items[0].id.videoId as string;
      const title = items[0].snippet.title as string;
      return NextResponse.json({
        isLive: true,
        videoId,
        title,
        source: "youtube",
      });
    }

    return NextResponse.json({
      isLive: false,
      videoId: null,
      source: "youtube",
    });
  } catch (error) {
    console.error("YouTube API fetch failed:", error);
    return NextResponse.json({
      isLive: false,
      videoId: null,
      source: "error",
    });
  }
}
