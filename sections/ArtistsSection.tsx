"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArtistModal } from "@/components/ArtistModal";
import { SectionFrame } from "@/components/SectionFrame";
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
  containerHeight: number,
  names: { name: string; id: string }[],
): Position[] {
  if (count <= 0 || containerWidth <= 0) {
    return [];
  }

  const rand = seededRandom(42);
  const positions: Position[] = [];

  const centerY = containerHeight * 0.47;

  // Sort artists within each group: longest name moves to center slot
  const sorted = [...names].sort((a, b) => b.name.length - a.name.length);
  // Force "Farik Interlude" to position 2 (center of domino-5)
  const farikIdx = sorted.findIndex((n) => n.name === "Farik Interlude");
  if (farikIdx >= 0 && farikIdx !== 2) {
    const [farik] = sorted.splice(farikIdx, 1);
    sorted.splice(2, 0, farik);
  }

  // Each "domino tile" holds up to 5 artists (4 corners + 1 center)
  const PER_TILE = 5;
  const groups = Math.ceil(count / PER_TILE);
  const slotWidth = containerWidth / groups;

  // Domino-5 template: TL, TR, C, BL, BR relative to group center
  // Larger offsets = more breathing room, "floating in air" effect
  const cornerOffsetX = 0.26;
  const cornerOffsetY = 0.24;

  const templates: Array<{ dx: number; dy: number }> = [
    { dx: -cornerOffsetX, dy: -cornerOffsetY }, // TL
    { dx: +cornerOffsetX, dy: -cornerOffsetY }, // TR
    { dx: 0, dy: 0 },                            // C (longest name)
    { dx: -cornerOffsetX, dy: +cornerOffsetY },  // BL
    { dx: +cornerOffsetX, dy: +cornerOffsetY },  // BR
  ];

  for (let g = 0; g < groups; g++) {
    const groupCenterX = slotWidth * (g + 0.5);
    const startIdx = g * PER_TILE;
    const groupArtists = sorted.slice(startIdx, startIdx + PER_TILE);
    const groupSize = groupArtists.length;

    for (let i = 0; i < groupSize; i++) {
      const tpl = templates[i];
      let x =
        groupCenterX +
        tpl.dx * slotWidth +
        (rand() - 0.5) * slotWidth * 0.05; // organic jitter ±2.5%
      let y =
        centerY +
        tpl.dy * containerHeight +
        (rand() - 0.5) * containerHeight * 0.06; // organic jitter ±3%

      // Shift whole composition left to balance visual center
      x -= containerWidth * 0.09;

      // Clamp within padded container
      const padX = Math.max(30, containerWidth * 0.03);
      const padY = Math.max(20, containerHeight * 0.06);
      x = Math.max(padX, Math.min(containerWidth - padX, x));
      y = Math.max(padY, Math.min(containerHeight - padY, y));

      // Map back to original order
      const origIdx = names.findIndex((n) => n.id === groupArtists[i].id);
      positions[origIdx] = { x, y };
    }
  }

  // Fine-tune individual positions
  for (const targetName of ["Farik Interlude", "Pedro", "Boraa"]) {
    const idx = names.findIndex((n) => n.name === targetName);
    if (idx >= 0 && positions[idx]) {
      if (targetName === "Farik Interlude") {
        positions[idx].x -= containerWidth * 0.03; // existing left shift
        positions[idx].y += containerHeight * 0.01; // net: -0.02 + 0.03 = +0.01
      } else {
        positions[idx].y += containerHeight * 0.03; // Pedro, Boraa: 3% lower
      }
    }
  }

  // Safety fill
  for (let i = 0; i < count; i++) {
    if (!positions[i]) {
      positions[i] = { x: containerWidth / 2, y: centerY };
    }
  }

  return positions;
}

export function ArtistsSection({
  activeArtist,
  onSetActiveArtist,
}: ArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);
  const [containerHeight, setContainerHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );

  useEffect(() => {
    fetch("/api/artists")
      .then((response) => response.json())
      .then((data) => setArtists(data));
  }, []);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.clientWidth);
      setContainerHeight(containerRef.current.clientHeight);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const positions = useMemo(
    () =>
      computePositions(
        artists.length,
        containerWidth,
        containerHeight,
        artists.map((a) => ({ name: a.name, id: a.id })),
      ),
    [artists.length, containerWidth, containerHeight],
  );

  const isReady = containerWidth > 0 && positions.length === artists.length;

  if (artists.length === 0) {
    return <SectionSkeleton />;
  }

  return (
    <SectionFrame
      id="artists"
      eyebrow="Artists"
      intro="Resident DJs, producers, and core contributors shaping the RAAM sound."
    >

      {/* Scattered pool container */}
      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-7xl"
        style={{ minHeight: "50vh" }}
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
              <span
                className="block text-balance transition duration-500 group-hover:-translate-y-1"
                style={{
                  animation: `float-drift ${4 + index * 0.4}s ease-in-out infinite`,
                  animationDelay: `${index * 0.7}s`,
                }}
              >
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
    </SectionFrame>
  );
}