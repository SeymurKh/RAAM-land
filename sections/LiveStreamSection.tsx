"use client";

import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { SectionFrame } from "@/components/SectionFrame";
import type { StreamConfig } from "@/data/stream";

interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  title?: string;
  source: string;
  twitchChannel?: string;
}

export function LiveStreamSection() {
  const [config, setConfig] = useState<StreamConfig | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);

  useEffect(() => {
    fetch("/api/stream")
      .then((r) => r.json())
      .then((data) => setConfig(data));

    fetch("/api/stream/status")
      .then((r) => r.json())
      .then((data) => setLiveStatus(data));
  }, []);

  if (!config) {
    return <SectionSkeleton className="min-h-[320px] sm:min-h-[500px]" />;
  }

  const { nextStreamDate, streamTitle } = config;
  const isLive = liveStatus?.isLive ?? false;
  const liveVideoId = liveStatus?.videoId;
  const liveTitle = liveStatus?.title ?? streamTitle;
  const liveSource = liveStatus?.source;
  const twitchChannel = liveStatus?.twitchChannel;

  // Build embed URL based on source
  let embedUrl: string | null = null;
  if (isLive && liveSource === "twitch" && twitchChannel) {
    const parent =
      typeof window !== "undefined" ? window.location.hostname : "";
    embedUrl = `https://player.twitch.tv/?channel=${encodeURIComponent(twitchChannel)}&parent=${encodeURIComponent(parent)}`;
  } else if (isLive && liveSource === "youtube" && liveVideoId) {
    embedUrl = `https://www.youtube.com/embed/${liveVideoId}`;
  }

  return (
    <SectionFrame
      id="live"
      eyebrow="Live"
      title="Stream"
      intro="Watch RAAM live sessions and stay tuned for upcoming broadcasts."
    >
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10">
        {isLive && embedUrl ? (
          <MotionReveal>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={embedUrl}
                title={liveTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="flex items-center gap-3 bg-[#0b0a09]/92 px-6 py-4">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="text-sm uppercase tracking-[0.2em] text-stone-200/70">
                {liveTitle}
              </span>
              {liveStatus?.source === "youtube" && (
                <span className="ml-auto text-xs uppercase tracking-[0.16em] text-stone-400/50">
                  Auto-detected
                </span>
              )}
              {liveStatus?.source === "twitch" && (
                <span className="ml-auto text-xs uppercase tracking-[0.16em] text-stone-400/50">
                  Twitch
                </span>
              )}
            </div>
          </MotionReveal>
        ) : nextStreamDate ? (
          <MotionReveal className="flex min-h-[260px] flex-col items-center justify-center gap-6 bg-[#0b0a09]/92 px-4 py-8 sm:min-h-[400px] sm:gap-8 sm:px-6 sm:py-16">
            <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
              Next stream
            </p>
            <h3 className="text-3xl font-semibold uppercase tracking-normal text-stone-100 sm:text-4xl">
              {streamTitle}
            </h3>
            <CountdownTimer targetDate={nextStreamDate} />
          </MotionReveal>
        ) : (
          <MotionReveal className="flex min-h-[180px] flex-col items-center justify-center gap-4 bg-[#0b0a09]/92 px-4 py-8 sm:min-h-[300px] sm:px-6 sm:py-16">
            <p className="text-lg text-stone-200/60">
              Stay tuned for the next stream
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-stone-200/20 to-transparent" />
          </MotionReveal>
        )}
      </div>
    </SectionFrame>
  );
}
