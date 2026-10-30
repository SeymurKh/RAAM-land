"use client";

import { SectionFrame } from "@/components/SectionFrame";
import { FluidButton } from "@/components/FluidButton";
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
      <div className="mt-10 flex justify-center">
        <FluidButton href="/radio-stream-bar" className="min-w-52">
          Go to Radio Stream Bar
        </FluidButton>
      </div>
    </SectionFrame>
  );
}
