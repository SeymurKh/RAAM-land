"use client";

import { SectionFrame } from "@/components/SectionFrame";
import { StreamPlayer } from "@/components/StreamPlayer";

export function LiveStreamSection() {
  return (
    <SectionFrame
      id="live"
      eyebrow="Live"
      title="Stream"
      intro="Watch RAAM live sessions and stay tuned for upcoming broadcasts."
      className="pt-16 sm:pt-10"
    >
      <StreamPlayer />
    </SectionFrame>
  );
}
