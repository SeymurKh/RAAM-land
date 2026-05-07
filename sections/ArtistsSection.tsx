"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArtistModal } from "@/components/ArtistModal";
import { SectionFrame } from "@/components/SectionFrame";
import { artists } from "@/data/site";
import type { Artist } from "@/types/content";
import { cn } from "@/lib/utils";

const positionClass: Record<Artist["visual"]["position"], string> = {
  high: "lg:translate-y-0",
  middle: "lg:translate-y-16",
  low: "lg:translate-y-32",
};

export function ArtistsSection() {
  const [activeArtist, setActiveArtist] = useState<Artist>();

  return (
    <SectionFrame
      id="artists"
      eyebrow="Residents"
      title="Asymmetric voices"
      intro="A resident circle of selectors, producers, mentors, and live voices shaping the electronic music language around RAAM."
      className="overflow-hidden"
    >
      <div className="relative min-h-[760px]">
        <div className="pointer-events-none absolute left-1/2 top-12 hidden -translate-x-1/2 text-[12vw] font-semibold uppercase leading-none tracking-normal text-white/[0.025] lg:block">
          Residents
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {artists.map((artist, index) => (
            <motion.button
              key={artist.id}
              type="button"
              onClick={() => setActiveArtist(artist)}
              initial={{ opacity: 0, y: 42 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.76,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "group relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-stone-100/28 hover:bg-white/[0.065] focus:outline-none focus:ring-2 focus:ring-stone-200/35 md:min-h-[420px]",
                positionClass[artist.visual.position],
              )}
              aria-label={`Open ${artist.name} profile`}
            >
              <span
                className={cn(
                  "absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br blur-3xl transition duration-700 group-hover:scale-125",
                  artist.visual.tone,
                  "to-transparent",
                )}
              />
              <span className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),transparent_35%,rgba(92,72,49,0.12))] opacity-70" />
              <span className="relative flex items-start justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.28em] text-stone-300/55">
                  {artist.origin}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-stone-200/60">
                  Open
                </span>
              </span>
              <span className="relative">
                <span className="mb-5 block text-[5.8rem] font-semibold uppercase leading-none tracking-normal text-white/[0.045] transition group-hover:text-white/[0.08]">
                  {artist.visual.initials}
                </span>
                <span className="block text-4xl font-semibold uppercase leading-[0.88] tracking-normal text-stone-50 lg:text-[2.7rem]">
                  {artist.name}
                </span>
                <span className="mt-4 block text-sm leading-6 text-stone-200/60">
                  {artist.genres.slice(0, 3).join(" / ")}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <ArtistModal artist={activeArtist} onClose={() => setActiveArtist(undefined)} />
    </SectionFrame>
  );
}
