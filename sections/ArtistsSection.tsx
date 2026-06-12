"use client";

import { useEffect, useRef, useState } from "react";
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

function computeCellMin(count: number, containerWidth: number): number {
  if (count <= 0 || containerWidth <= 0) return 200;
  const aspect = 1.6;
  const cols = Math.max(2, Math.ceil(Math.sqrt(count * aspect)));
  const cellMin = Math.floor(containerWidth / cols);
  return Math.max(120, Math.min(cellMin, 500));
}

export function ArtistsSection({
  activeArtist,
  onSetActiveArtist,
}: ArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellMin, setCellMin] = useState(200);

  useEffect(() => {
    fetch("/api/artists")
      .then((response) => response.json())
      .then((data) => setArtists(data));
  }, []);

  useEffect(() => {
    function recalc() {
      if (!gridRef.current) return;
      const width = gridRef.current.clientWidth;
      setCellMin(computeCellMin(artists.length, width));
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [artists.length]);

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

      <div className="relative mx-auto max-w-7xl">
        <MotionReveal className="mb-6 md:mb-12">
          <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
            Artists
          </p>
        </MotionReveal>

        <div
          ref={gridRef}
          className="grid gap-x-6 gap-y-10 md:gap-y-14"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${cellMin}px, 1fr))`,
          }}
        >
          {artists.map((artist) => {
            const isHovered = hoveredId === artist.id;
            const isOtherHovered = hoveredId !== null && !isHovered;

            return (
              <motion.button
                key={artist.id}
                type="button"
                onClick={() => onSetActiveArtist(artist)}
                onMouseEnter={() => setHoveredId(artist.id)}
                onMouseLeave={() => setHoveredId(null)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                animate={{
                  opacity: isOtherHovered ? 0.25 : 1,
                  scale: isHovered ? 1.15 : 1,
                }}
                transition={{
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.35, ease: "easeOut" },
                }}
                className="group text-left font-bebas uppercase leading-[0.85] tracking-normal text-stone-100/82 outline-none transition-colors duration-700 ease-out hover:text-white focus:text-white text-[clamp(1.8rem,5vw,3rem)] md:text-[clamp(2.8rem,6vw,5.5rem)] origin-left"
                aria-label={`Open ${artist.name} profile`}
              >
                <span className="block text-balance transition duration-500 group-hover:-translate-y-1">
                  {artist.name}
                </span>
                <span className="mt-2 block text-xs font-normal uppercase tracking-[0.36em] text-stone-300/45 opacity-0 transition delay-150 duration-500 group-hover:opacity-100 group-focus:opacity-100">
                  {artist.origin} / {artist.genres.slice(0, 2).join(" / ")}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <ArtistModal
        artist={activeArtist}
        onClose={() => onSetActiveArtist(undefined)}
      />
    </section>
  );
}