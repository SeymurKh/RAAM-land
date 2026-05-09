"use client";

import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { getYouTubeEmbed } from "@/lib/utils";
import type { StreamConfig } from "@/data/stream";

export function LiveStreamSection() {
  const [config, setConfig] = useState<StreamConfig | null>(null);

  useEffect(() => {
    fetch("/api/stream")
      .then((r) => r.json())
      .then((data) => setConfig(data));
  }, []);

  if (!config) {
    return null;
  }

  const { isLive, youtubeUrl, streamTitle, nextStreamDate } = config;
  const embedUrl = getYouTubeEmbed(youtubeUrl);

  return (
    <SectionFrame
      id="live"
      eyebrow="Live"
      title="Stream"
      intro="Watch RAAM live sessions and stay tuned for upcoming broadcasts."
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10">
        {isLive && embedUrl ? (
          <MotionReveal>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`${embedUrl}?autoplay=0`}
                title={streamTitle}
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
                {streamTitle}
              </span>
            </div>
          </MotionReveal>
        ) : nextStreamDate ? (
          <MotionReveal className="flex min-h-[400px] flex-col items-center justify-center gap-8 bg-[#0b0a09]/92 px-6 py-16">
            <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
              Next stream
            </p>
            <h3 className="text-3xl font-semibold uppercase tracking-normal text-stone-100 sm:text-4xl">
              {streamTitle}
            </h3>
            <CountdownTimer targetDate={nextStreamDate} />
          </MotionReveal>
        ) : (
          <MotionReveal className="flex min-h-[300px] flex-col items-center justify-center gap-4 bg-[#0b0a09]/92 px-6 py-16">
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
