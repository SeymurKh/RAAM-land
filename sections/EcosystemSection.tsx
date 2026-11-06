"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { capabilities, siteConfig } from "@/data/site";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionTransition } from "@/components/SectionTransition";
import { TiltCard } from "@/components/TiltCard";
import { VenueTeaser } from "@/components/VenueTeaser";

export function EcosystemSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  useInView(gridRef, { once: true, margin: "-10% 0px" });

  return (
    <section id="ecosystem" className="relative isolate scroll-mt-24 overflow-hidden px-4 pt-0 pb-6 sm:px-5 sm:pt-0 sm:pb-20 lg:px-12">
      <SectionTransition position="bottom" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_23%),linear-gradient(180deg,#080706_0%,rgba(8,7,6,0.55)_42%,#080706_100%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-4 border-t border-white/10 py-5 sm:gap-10 sm:py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col">
          <MotionReveal direction="left">
            <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
              We are building
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold uppercase leading-[0.92] tracking-normal text-stone-100 sm:mt-4 sm:text-6xl">
              The ecosystem
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-200/64 sm:mt-7 sm:text-lg sm:leading-8">
              {siteConfig.tagline}
            </p>
          </MotionReveal>
          {/* Тизер ВНЕ MotionReveal: filter/transform у framer-контейнера
              создают backdrop root и глушат backdrop-blur карточки */}
          <div className="mt-6 grid flex-1 sm:mt-10">
            <VenueTeaser />
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 gap-1.5 sm:gap-3">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <TiltCard key={item.id} index={index}>
                <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100 sm:mb-8 sm:h-11 sm:w-11">
                  <Icon size={14} />
                </div>
                <h3 className="text-sm font-medium text-white sm:text-xl">{item.title}</h3>
                <p className="mt-1.5 text-[0.65rem] leading-4 text-stone-200/58 sm:mt-3 sm:text-sm sm:leading-6">
                  {item.description}
                </p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}