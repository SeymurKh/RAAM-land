"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArtistModal } from "@/components/ArtistModal";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Artist } from "@/types/content";
import type { Dispatch, SetStateAction } from "react";

interface ArtistsSectionProps {
  activeArtist?: Artist;
  onSetActiveArtist: Dispatch<SetStateAction<Artist | undefined>>;
}

interface ArtistPosition {
  top: number;
  x: number;
  align: "left" | "right";
  rotate: number;
  origin: string;
}

function getArtistPosition(index: number, total: number, isDesktop: boolean): ArtistPosition {
  const desktopSlots = [
    { top: 18, x: 8, align: "left" as const, rotate: -1.8 },
    { top: 32, x: 10, align: "right" as const, rotate: 1.3 },
    { top: 48, x: 24, align: "left" as const, rotate: 0.8 },
    { top: 64, x: 7, align: "right" as const, rotate: -1.4 },
    { top: 78, x: 13, align: "left" as const, rotate: 1.6 },
    { top: 88, x: 20, align: "right" as const, rotate: -0.8 },
  ];
  const mobileSlots = [
    { top: 16, x: 5, align: "left" as const, rotate: -1 },
    { top: 31, x: 5, align: "right" as const, rotate: 1.1 },
    { top: 47, x: 9, align: "left" as const, rotate: 0.6 },
    { top: 63, x: 6, align: "right" as const, rotate: -0.9 },
    { top: 79, x: 5, align: "left" as const, rotate: 1.2 },
    { top: 90, x: 8, align: "right" as const, rotate: -0.6 },
  ];
  const slots = isDesktop ? desktopSlots : mobileSlots;
  const slot = slots[index % slots.length];
  const cycleOffset = Math.floor(index / slots.length) * (isDesktop ? 4 : 3);
  const densityOffset = total > slots.length ? (index % 2 === 0 ? -2 : 2) : 0;

  return {
    top: Math.min(91, slot.top + cycleOffset + densityOffset),
    x: slot.x,
    align: slot.align,
    rotate: slot.rotate,
    origin: slot.align === "left" ? "left center" : "right center",
  };
}

export function ArtistsSection({ activeArtist, onSetActiveArtist }: ArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    fetch("/api/artists")
      .then((response) => response.json())
      .then((data) => setArtists(data));
  }, []);

  if (artists.length === 0) {
    return <SectionSkeleton />;
  }

  return (
    <section
      id="artists"
      className="relative isolate scroll-mt-24 overflow-hidden px-5 pt-16 pb-24 sm:px-8 sm:pt-20 md:min-h-screen lg:px-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_23%),linear-gradient(180deg,rgba(8,7,6,0.55)_0%,rgba(8,7,6,0.18)_45%,rgba(8,7,6,0.62)_100%)]" />
      <div className="absolute inset-0 bg-black/28" />

      <div className="relative mx-auto min-h-[540px] max-w-7xl sm:min-h-[760px] md:min-h-[800px]">
        <MotionReveal className="mb-6 md:mb-12">
          <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
            Artists
          </p>
        </MotionReveal>

        {artists.map((artist, index) => {
          const isHovered = hoveredId === artist.id;
          const isOtherHovered = hoveredId !== null && !isHovered;
          const position = getArtistPosition(index, artists.length, isDesktop);
          const floatDuration = 6.2 + index * 0.45;

          return (
            <motion.button
              key={artist.id}
              type="button"
              onClick={() => onSetActiveArtist(artist)}
              onMouseEnter={() => setHoveredId(artist.id)}
              onMouseLeave={() => setHoveredId(null)}
              initial={{ opacity: 0, y: 40, rotateX: 18 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              animate={{
                opacity: isOtherHovered ? 0.3 : 1,
                scale: isHovered ? (isDesktop ? 1.1 : 1.05) : 1,
              }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.45, ease: "easeOut" },
              }}
              style={{
                top: `${position.top}%`,
                ...(position.align === "left"
                  ? { left: `${position.x}%` }
                  : { right: `${position.x}%` }),
                rotate: `${position.rotate}deg`,
                transformOrigin: position.origin,
                zIndex: isHovered ? 20 : 1,
                animationName: index % 2 === 0 ? "artist-float-up" : "artist-float-down",
                animationDuration: `${floatDuration}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
              }}
              className="artist-name-3d group absolute max-w-[78vw] text-left text-[clamp(2.45rem,10vw,4.8rem)] font-normal uppercase leading-[0.78] tracking-normal text-stone-100/82 outline-none transition-colors duration-700 ease-out hover:text-white focus:text-white sm:max-w-[62vw] md:text-[clamp(4.8rem,8vw,8.2rem)]"
              aria-label={`Open ${artist.name} profile`}
            >
              <span className="block text-balance transition duration-500 group-hover:-translate-y-2">
                {artist.name}
              </span>
              <span className="mt-2 block text-xs font-normal uppercase tracking-[0.36em] text-stone-300/45 opacity-0 transition delay-150 duration-500 group-hover:opacity-100 group-focus:opacity-100">
                {artist.origin} / {artist.genres.slice(0, 2).join(" / ")}
              </span>
            </motion.button>
          );
        })}
      </div>

      <ArtistModal artist={activeArtist} onClose={() => onSetActiveArtist(undefined)} />
    </section>
  );
}
