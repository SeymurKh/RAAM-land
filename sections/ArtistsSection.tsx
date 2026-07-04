"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArtistModal } from "@/components/ArtistModal";
import { SectionFrame } from "@/components/SectionFrame";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import type { Artist } from "@/types/content";
import type { Dispatch, SetStateAction } from "react";

interface ArtistsSectionProps {
  activeArtist?: Artist;
  onSetActiveArtist: Dispatch<SetStateAction<Artist | undefined>>;
  onBook?: () => void;
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

  // Alternating pattern: even rows = 2 edges, odd rows = 1 center
  let rows = 0;
  let covered = 0;
  while (covered < count) {
    covered += rows % 2 === 0 ? 2 : 1;
    rows++;
  }
  const tileHeight = containerHeight / rows;
  const centerX = containerWidth / 2;
  const edgeOffsetX = 0.30;

  // Sort by name length (longest → first), Farik forced to position 2 (row 1, center)
  const sorted = [...names].sort((a, b) => b.name.length - a.name.length);
  const farikIdx = sorted.findIndex((n) => n.name === "Farik Interlude");
  if (farikIdx >= 0 && farikIdx !== 2) {
    const [farik] = sorted.splice(farikIdx, 1);
    sorted.splice(2, 0, farik);
  }

  let artistCursor = 0;

  for (let row = 0; row < rows && artistCursor < count; row++) {
    const tileCenterY = tileHeight * (row + 0.5);
    const isEven = row % 2 === 0;

    if (isEven) {
      for (let slot = 0; slot < 2 && artistCursor < count; slot++, artistCursor++) {
        const dx = slot === 0 ? -edgeOffsetX : +edgeOffsetX;
        let x = centerX + dx * containerWidth + (rand() - 0.5) * containerWidth * 0.05;
        let y = tileCenterY + (rand() - 0.5) * tileHeight * 0.06;

        x -= containerWidth * 0.10;

        const padX = Math.max(30, containerWidth * 0.03);
        const padY = Math.max(20, tileHeight * 0.08);
        x = Math.max(padX, Math.min(containerWidth - padX, x));
        y = Math.max(row * tileHeight + padY, Math.min((row + 1) * tileHeight - padY, y));

        const origIdx = names.findIndex((n) => n.id === sorted[artistCursor].id);
        positions[origIdx] = { x, y };
      }
    } else {
      let x = centerX + (rand() - 0.5) * containerWidth * 0.05;
      let y = tileCenterY + (rand() - 0.5) * tileHeight * 0.06;

      x -= containerWidth * 0.10;

      const padX = Math.max(30, containerWidth * 0.03);
      const padY = Math.max(20, tileHeight * 0.08);
      x = Math.max(padX, Math.min(containerWidth - padX, x));
      y = Math.max(row * tileHeight + padY, Math.min((row + 1) * tileHeight - padY, y));

      const origIdx = names.findIndex((n) => n.id === sorted[artistCursor].id);
      positions[origIdx] = { x, y };
      artistCursor++;
    }
  }

  // Fine-tune individual positions
  for (const targetName of ["Pedro", "Boraa"]) {
    const idx = names.findIndex((n) => n.name === targetName);
    if (idx >= 0 && positions[idx]) {
      positions[idx].y += tileHeight * 0.04;
    }
  }

  // Farik Interlude: additional 3% left shift
  const farikPosIdx = names.findIndex((n) => n.name === "Farik Interlude");
  if (farikPosIdx >= 0 && positions[farikPosIdx]) {
    positions[farikPosIdx].x -= containerWidth * 0.06;
  }

  return positions;
}

export function ArtistsSection({
  activeArtist,
  onSetActiveArtist,
  onBook,
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

  const numRows = useMemo(() => {
    let r = 0;
    let covered = 0;
    while (covered < artists.length) {
      covered += r % 2 === 0 ? 2 : 1;
      r++;
    }
    return r;
  }, [artists.length]);

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
      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-7xl"
        style={{
          minHeight: `${Math.max(50, numRows * 22)}vh`,
        }}
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
                className="group relative text-left font-bebas uppercase leading-[0.85] tracking-normal text-stone-50/90 outline-none transition-colors duration-700 ease-out hover:text-white focus:text-white text-[clamp(2.4rem,7vw,3.5rem)] md:text-[clamp(2.8rem,6vw,5.5rem)] whitespace-nowrap mb-4 mr-6"
                aria-label={`Open ${artist.name} profile`}
              >
                <span className="block text-balance transition duration-500 group-hover:-translate-y-1">
                  {artist.name}
                </span>
                <span className="mt-2 block text-xs font-normal uppercase tracking-[0.36em] text-stone-200/70 opacity-0 transition delay-150 duration-500 group-hover:opacity-100 group-focus:opacity-100">
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
              className="group absolute text-left font-bebas uppercase leading-[0.85] tracking-normal text-stone-50/90 outline-none transition-colors duration-700 ease-out hover:text-white focus:text-white text-[clamp(2.8rem,9vw,3.8rem)] sm:text-[clamp(2.4rem,7vw,3.5rem)] md:text-[clamp(2.8rem,6vw,5.5rem)] origin-center whitespace-nowrap"
              style={{
                left: containerWidth > 0 ? `${(pos.x / containerWidth) * 100}%` : 0,
                top: containerHeight > 0 ? `${(pos.y / containerHeight) * 100}%` : 0,
                transform: containerWidth < 640 ? "translate(-57%, -50%)" : "translate(-50%, -50%)",
              }}
              aria-label={`Open ${artist.name} profile`}
            >
              <span
                className="inline-flex items-center gap-3 text-balance transition duration-500 group-hover:-translate-y-1"
                style={{
                  animation: `float-drift ${4 + index * 0.4}s ease-in-out infinite`,
                  animationDelay: `${index * 0.7}s`,
                  textShadow: "0 0 12px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {artist.avatar && (
                  <span className="relative inline-flex h-[1em] w-[1em] shrink-0 overflow-hidden rounded-full border border-white/20">
                    <img
                      src={artist.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: artist.avatarPosition ?? "50% 50%" }}
                    />
                  </span>
                )}
                {artist.name}
              </span>
              <span className="mt-2 block text-xs font-normal uppercase tracking-[0.36em] text-stone-200/70 opacity-0 transition delay-150 duration-500 group-hover:opacity-100 group-focus:opacity-100">
                {artist.origin} / {artist.genres.slice(0, 2).join(" / ")}
              </span>
            </motion.button>
          );
        })}
      </div>

      <ArtistModal
        artist={activeArtist}
        onClose={() => onSetActiveArtist(undefined)}
        onBook={onBook}
      />
    </SectionFrame>
  );
}