"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

interface Position {
  x: number;
  y: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function computePositions(
  count: number,
  containerWidth: number,
): { positions: Position[]; height: number } {
  if (count <= 0 || containerWidth <= 0) {
    return { positions: [], height: 400 };
  }

  const rand = seededRandom(42);
  const positions: Position[] = [];

  // Calculate grid dimensions
  const cols = Math.max(2, Math.ceil(Math.sqrt(count * 1.4)));
  const rows = Math.max(2, Math.ceil(count / cols));
  const cellW = containerWidth / cols;
  const cellH = Math.max(cellW * 0.55, 100);
  const totalHeight = rows * cellH + 80;

  const minDist = Math.min(cellW, cellH) * 0.7;

  // Place items top-to-bottom, left-to-right (no shuffle)
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Base position = center of cell
    const baseX = col * cellW + cellW / 2;
    const baseY = row * cellH + cellH / 2;

    // Random offset within cell for organic feel
    const offsetX = (rand() - 0.5) * cellW * 0.5;
    const offsetY = (rand() - 0.5) * cellH * 0.4;

    let x = baseX + offsetX;
    let y = baseY + offsetY;

    // Enforce minimum distance from already placed items
    for (let attempt = 0; attempt < 6; attempt++) {
      let tooClose = false;
      for (const pos of positions) {
        const dx = x - pos.x;
        const dy = y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < minDist) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) break;
      x = baseX + (rand() - 0.5) * cellW * 0.6;
      y = baseY + (rand() - 0.5) * cellH * 0.5;
    }

    // Clamp to container bounds with padding
    const padX = 30;
    const padY = 20;
    x = Math.max(padX, Math.min(containerWidth - padX, x));
    y = Math.max(padY, Math.min(totalHeight - padY, y));

    positions.push({ x, y });
  }

  return { positions, height: totalHeight };
}

export function ArtistsSection({
  activeArtist,
  onSetActiveArtist,
}: ArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    fetch("/api/artists")
      .then((response) => response.json())
      .then((data) => setArtists(data));
  }, []);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { positions, height: containerHeight } = useMemo(
    () => computePositions(artists.length, containerWidth),
    [artists.length, containerWidth],
  );

  const isReady = containerWidth > 0 && positions.length === artists.length;

  if (artists.length === 0) {
    return <SectionSkeleton />;
  }

  return (
    <section
      id="artists"
      className="relative isolate scroll-mt-24 overflow-hidden px-5 pt-16 pb-24 sm:px-8 sm:pt-20 lg:px-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_23%),linear-gradient(180deg,rgba(8,7,6,0.55)_0%,rgba(8,7,6,0.18)_45%,rgba(8,7,6,0.62)_100%)]" />
      <div className="absolute inset-0 bg-black/28" />

      <div className="relative mx-auto max-w-7xl">
        <MotionReveal className="mb-6 md:mb-12">
          <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
            Artists
          </p>
        </MotionReveal>
      </div>

      {/* Scattered pool container */}
      <div
        ref={containerRef}
        className="relative mx-auto max-w-7xl"
        style={{ height: isReady ? containerHeight : "60vh" }}
      >
        {artists.map((artist, index) => {
          const isHovered = hoveredId === artist.id;
          const isOtherHovered = hoveredId !== null && !isHovered;
          const pos = positions[index];

          if (!isReady) {
            return (
              <motion.button
                key={artist.id}
                type="button"
                onClick={() => onSetActiveArtist(artist)}
                onMouseEnter={() => setHoveredId(artist.id)}
                onMouseLeave={() => setHoveredId(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group relative text-left font-bebas uppercase leading-[0.85] tracking-normal text-stone-100/82 outline-none transition-colors duration-700 ease-out hover:text-white focus:text-white text-[clamp(1.8rem,5vw,3rem)] md:text-[clamp(2.8rem,6vw,5.5rem)] whitespace-nowrap mb-4 mr-6"
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
          }

          return (
            <motion.button
              key={artist.id}
              type="button"
              onClick={() => onSetActiveArtist(artist)}
              onMouseEnter={() => setHoveredId(artist.id)}
              onMouseLeave={() => setHoveredId(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isOtherHovered ? 0.2 : 1,
                scale: isHovered ? 1.25 : 1,
              }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.35, ease: "easeOut" },
              }}
              className="group absolute text-left font-bebas uppercase leading-[0.85] tracking-normal text-stone-100/82 outline-none transition-colors duration-700 ease-out hover:text-white focus:text-white text-[clamp(1.8rem,5vw,3rem)] md:text-[clamp(2.8rem,6vw,5.5rem)] origin-center whitespace-nowrap"
              style={{
                left: containerWidth > 0 ? `${(pos.x / containerWidth) * 100}%` : 0,
                top: containerHeight > 0 ? `${(pos.y / containerHeight) * 100}%` : 0,
                transform: "translate(-50%, -50%)",
              }}
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

      <ArtistModal
        artist={activeArtist}
        onClose={() => onSetActiveArtist(undefined)}
      />
    </section>
  );
}