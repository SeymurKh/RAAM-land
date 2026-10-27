"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { BrandSocialIcon } from "@/components/BrandSocialIcon";
import { FluidButton } from "@/components/FluidButton";
import { MotionReveal } from "@/components/MotionReveal";
import { YouTubeModal } from "@/components/YouTubeModal";
import type { VenuePageContent } from "@/types/content";

interface VenueLiveSectionProps {
  live: VenuePageContent["live"];
}

export function VenueLiveSection({ live }: VenueLiveSectionProps) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const hasVideo = Boolean(live.videoUrl);

  return (
    <section
      id="venue-live"
      className="relative isolate scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center md:gap-14">
        {/* Copy */}
        <MotionReveal>
          <div className="flex items-center gap-4">
            <span className="font-bebas text-5xl leading-none text-white/12 sm:text-6xl">
              01
            </span>
            <p className="text-xs uppercase tracking-[0.48em] text-[#e23b3b]">
              {live.eyebrow}
            </p>
          </div>

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

          {live.note ? (
            <p className="mt-6 max-w-xl text-base leading-7 text-stone-200/65">
              {live.note}
            </p>
          ) : null}

          {live.cta.label && live.cta.href ? (
            <FluidButton
              href={live.cta.href}
              target="_blank"
              rel="noreferrer"
              className="mt-8"
            >
              <span className="flex items-center gap-3">
                {live.cta.label}
                <Play size={12} />
              </span>
            </FluidButton>
          ) : null}
        </MotionReveal>

        {/* Video card */}
        <MotionReveal delay={0.1}>
          <button
            type="button"
            onClick={() => hasVideo && setPlayerOpen(true)}
            className={`group relative block aspect-video w-full overflow-hidden rounded-[1.4rem] border border-white/10 ${
              hasVideo ? "cursor-pointer" : "cursor-default"
            }`}
          >
            {live.videoThumb ? (
              <Image
                src={live.videoThumb}
                alt={live.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(226,59,59,0.18),transparent_60%),linear-gradient(180deg,#161111,#0b0a09)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45))]" />

            {live.liveBadge ? (
              <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-[#e23b3b] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live
              </span>
            ) : null}

            <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/35 backdrop-blur-xl transition duration-500 group-hover:scale-110 group-hover:bg-black/55">
              <Play size={20} className="translate-x-[2px] text-white" />
            </span>
          </button>
        </MotionReveal>
      </div>

      <YouTubeModal
        youtubeUrl={live.videoUrl}
        title={live.title}
        isOpen={playerOpen && hasVideo}
        onClose={() => setPlayerOpen(false)}
      />
    </section>
  );
}