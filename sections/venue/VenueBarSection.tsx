"use client";

import Image from "next/image";
import { MenuList } from "@/components/MenuList";
import { MotionReveal } from "@/components/MotionReveal";
import type { VenuePageContent } from "@/types/content";

interface VenueBarSectionProps {
  bar: VenuePageContent["bar"];
}

export function VenueBarSection({ bar }: VenueBarSectionProps) {
  return (
    <section
      id="venue-bar"
      className="relative isolate scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
          {/* Copy */}
          <MotionReveal>
            <div>
              <p className="text-xs uppercase tracking-[0.48em] text-[#E82919]">
                {bar.eyebrow}
              </p>

              <h2 className="mt-4 text-3xl font-semibold uppercase leading-[0.95] tracking-normal text-stone-100 sm:text-5xl">
              {bar.title}
            </h2>

            {bar.description.map((paragraph, index) => (
              <p key={index} className="mt-5 max-w-xl text-base leading-7 text-stone-200/65">
                {paragraph}
              </p>
            ))}
            </div>
          </MotionReveal>

          {/* Photos */}
          <MotionReveal delay={0.1}>
            {bar.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {bar.images.slice(0, 2).map((image, index) => (
                  <div
                    key={image.id}
                    className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt ?? ""}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                    {index === 1 ? (
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55))]" />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs uppercase tracking-[0.3em] text-stone-500">
                Photos coming soon
              </div>
            )}
          </MotionReveal>
        </div>

        {/* Menu */}
        <MotionReveal>
          <MenuList menu={bar.menu} />
        </MotionReveal>
      </div>
    </section>
  );
}