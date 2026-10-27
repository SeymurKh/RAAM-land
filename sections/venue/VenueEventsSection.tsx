"use client";

import Image from "next/image";
import { FluidButton } from "@/components/FluidButton";
import { MediaArchive } from "@/components/MediaArchive";
import { MotionReveal } from "@/components/MotionReveal";
import type { VenuePageContent } from "@/types/content";

interface VenueEventsSectionProps {
  events: VenuePageContent["events"];
}

export function VenueEventsSection({ events }: VenueEventsSectionProps) {
  return (
    <section
      id="venue-events"
      className="relative isolate scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center md:gap-14">
        {/* Copy */}
        <MotionReveal>
          <div className="flex items-center gap-4">
            <span className="font-bebas text-5xl leading-none text-white/12 sm:text-6xl">
              02
            </span>
            <p className="text-xs uppercase tracking-[0.48em] text-[#e23b3b]">
              {events.eyebrow}
            </p>
          </div>

          <h2 className="mt-4 text-3xl font-semibold uppercase leading-[0.95] tracking-normal text-stone-100 sm:text-5xl">
            {events.title}
          </h2>

          {events.description.map((paragraph, index) => (
            <p key={index} className="mt-5 max-w-xl text-base leading-7 text-stone-200/65">
              {paragraph}
            </p>
          ))}

          {events.manifesto.length > 0 ? (
            <div className="mt-6 space-y-1.5">
              {events.manifesto.map((line) => (
                <p
                  key={line}
                  className="text-base uppercase tracking-[0.12em] text-stone-100/85"
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          {events.cta.label && events.cta.href ? (
            <FluidButton
              href={events.cta.href}
              target="_blank"
              rel="noreferrer"
              className="mt-8"
            >
              {events.cta.label}
            </FluidButton>
          ) : null}
        </MotionReveal>

        {/* Photo collage */}
        <MotionReveal delay={0.1}>
          {events.gallery.length > 0 ? (
            <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-3 sm:h-[460px]">
              {events.gallery.slice(0, 3).map((image, index) => (
                <div
                  key={image.id}
                  className={`relative overflow-hidden rounded-2xl border border-white/10 ${
                    index === 0 ? "row-span-2" : ""
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt ?? ""}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs uppercase tracking-[0.3em] text-stone-500 sm:h-[460px]">
              Photos coming soon
            </div>
          )}
        </MotionReveal>
      </div>

      {/* Media archive — растёт со временем */}
      <div className="mx-auto max-w-7xl">
        <MediaArchive />
      </div>
    </section>
  );
}