"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArtistModal } from "@/components/ArtistModal";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import type { Artist } from "@/types/content";
import type { Dispatch, SetStateAction } from "react";

interface ArtistsSectionProps {
  activeArtist?: Artist;
  onSetActiveArtist: Dispatch<SetStateAction<Artist | undefined>>;
}

export function ArtistsSection({ activeArtist, onSetActiveArtist }: ArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
      className="relative isolate min-h-screen scroll-mt-24 overflow-hidden px-5 pt-10 pb-24 sm:px-8 lg:px-12"
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
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

      <div className="relative mx-auto min-h-[760px] max-w-7xl">
        <MotionReveal className="mb-12">
          <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
            Artists
          </p>
        </MotionReveal>

        {artists.map((artist, index) => {
          const isHovered = hoveredId === artist.id;
          const isOtherHovered = hoveredId !== null && !isHovered;

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
                y: [0, index % 2 ? -10 : 10, 0],
                rotateZ: [0, index % 2 ? 1 : -0.8, 0],
                opacity: isOtherHovered ? 0.3 : 1,
                scale: isHovered ? 1.15 : 1,
              }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5, ease: "easeOut" },
                y: {
                  duration: 5.5 + index * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotateZ: {
                  duration: 6 + index * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              style={{
                top: `${14 + (index / artists.length) * 68}%`,
                ...(index % 2 === 0
                  ? { left: `${7 + (index % 3) * 3}%` }
                  : { right: `${7 + (index % 3) * 3}%` }),
                ...(index === artists.length - 1 && artists.length > 1
                  ? { left: "50%", right: "auto", transform: "translateX(-50%)" }
                  : {}),
              }}
              className="artist-name-3d group absolute max-w-[86vw] origin-center text-left text-2xl font-semibold uppercase leading-[0.82] tracking-normal text-stone-100/82 outline-none transition-all duration-700 ease-out hover:scale-[1.4] hover:text-white focus:text-white sm:text-4xl lg:text-5xl lg:hover:scale-[1.8]"
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
