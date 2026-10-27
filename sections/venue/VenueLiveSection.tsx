"use client";

import { BrandSocialIcon } from "@/components/BrandSocialIcon";
import { MotionReveal } from "@/components/MotionReveal";
import { StreamPlayer } from "@/components/StreamPlayer";
import type { VenuePageContent } from "@/types/content";

interface VenueLiveSectionProps {
  live: VenuePageContent["live"];
}

export function VenueLiveSection({ live }: VenueLiveSectionProps) {
  return (
    <section
      id="venue-live"
      className="relative isolate scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center md:gap-14">
        {/* Copy */}
        <MotionReveal>
          <div>
            <p className="text-xs uppercase tracking-[0.48em] text-[#E82919]">
              {live.eyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-semibold uppercase leading-[0.95] tracking-normal text-stone-100 sm:text-5xl">
              {live.title}
            </h2>

            {live.description.map((paragraph, index) => (
              <p key={index} className="mt-5 max-w-xl text-base leading-7 text-stone-200/65">
                {paragraph}
              </p>
            ))}

            {live.platforms.length > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {live.platforms.map((platform) => (
                  <a
                    key={platform.kind + platform.url}
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs text-stone-200/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                  >
                    <BrandSocialIcon
                      kind={platform.kind}
                      className="h-3.5 w-3.5 object-contain invert"
                    />
                    {platform.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </MotionReveal>

        {/* Player — same as the Live section on the main page */}
        <MotionReveal delay={0.1}>
          <StreamPlayer />
        </MotionReveal>
      </div>
    </section>
  );
}