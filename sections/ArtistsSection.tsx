"use client";

import Image from "next/image";
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
}

/**
 * Generate a deterministic position for an artist based on its index
 * and the total number of artists. This ensures:
 * - Even vertical distribution across the section
 * - Alternating left/right alignment
 * - Stable positions across re-renders (seeded offsets)
 * - No overlaps regardless of how many artists exist
 */
function getArtistPosition(index: number, total: number, isDesktop: boolean): ArtistPosition {
  const rows = total;
  const verticalGap = 78 / (rows + 1); // equal spacing with margins

  const baseTop = verticalGap * (index + 1) + 8;

  // Deterministic offset based on index — stable across re-renders
  const seedOffset = ((index * 7 + 3) % 11) - 5; // range: -5..5

  const isLeft = index % 2 === 0;

  return {
    top: isDesktop ? baseTop + seedOffset * 0.5 : baseTop + seedOffset * 0.3,
    x: isDesktop ? (8 + Math.abs(seedOffset) * 0.3) : (5 + Math.abs(seedOffset) * 0.2),
    align: isLeft ? "left" : "right",
    rotate: seedOffset * 0.15,
  };
}

export function ArtistsSection({ activeArtist, onSetActiveArtist }: ArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    fetch("/api/artists")
      .then((r) => r.json())
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
      <Image
        src="/assets/images/lilbl.png"
        alt="RAAM artists background"
        fill
        sizes="100vw"
        className="object-cover opacity-30"
        priority
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_23%),linear-gradient(180deg,#080706_0%,rgba(8,7,6,0.55)_42%,#080706_100%)]" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto min-h-[480px] sm:min-h-[760px] max-w-7xl md:min-h-[760px]">
        <MotionReveal className="mb-6 md:mb-12">
          <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
            Artists
          </p>
        </MotionReveal>

        {artists.map((artist, index) => {
          const isHovered = hoveredId === artist.id;
          const isOtherHovered = hoveredId !== null && !isHovered;

          const pos = getArtistPosition(index, artists.length, isDesktop);

          // Alternate float direction based on index for visual variety
          const floatDuration = 5.5 + index * 0.35;

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
                scale: isHovered ? 1.15 : 1,
              }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5, ease: "easeOut" },
              }}
              style={{
                top: `${pos.top}%`,
                ...(pos.align === "left"
                  ? { left: `${pos.x}%` }
                  : { right: `${pos.x}%` }),
                rotate: `${pos.rotate}deg`,
                zIndex: isHovered ? 20 : 1,
                // CSS-driven float animation — runs on compositor thread
                animationName: index % 2 === 0 ? "artist-float-up" : "artist-float-down",
                animationDuration: `${floatDuration}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
              }}
              className="artist-name-3d group absolute max-w-[60vw] sm:max-w-[70vw] origin-center text-left text-2xl font-semibold uppercase leading-[0.82] tracking-normal text-stone-100/82 outline-none transition-all duration-700 ease-out hover:scale-[1.4] hover:text-white focus:text-white sm:text-4xl lg:text-5xl lg:hover:scale-[1.8]"
              aria-label={`Open ${artist.name} profile`}
            >
              <span className="block transition duration-500 group-hover:-translate-y-2">
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
