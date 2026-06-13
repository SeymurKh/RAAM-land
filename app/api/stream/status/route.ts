import { NextResponse } from "next/server";
import { getStreamConfig } from "@/lib/db";
import { getLiveStream } from "@/lib/youtube";

export async function GET() {
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
    return NextResponse.json({
      isLive: false,
      videoId: null,
      source: "none",
    });
  }

  try {
    const result = await getLiveStream(apiKey, channelId);

    return NextResponse.json({
      isLive: result.isLive,
      videoId: result.videoId,
      title: result.title || undefined,
      source: "youtube",
    });
  } catch (error) {
    console.error("[stream/status] YouTube API error:", error);
    return NextResponse.json({
      isLive: false,
      videoId: null,
      source: "error",
    });
  }
}