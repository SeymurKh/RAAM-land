"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArtistModal } from "@/components/ArtistModal";
import { SectionFrame } from "@/components/SectionFrame";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { parseImagePosition } from "@/lib/utils";
import type { Artist } from "@/types/content";
import type { Dispatch, SetStateAction } from "react";

interface ArtistsSectionProps {
  activeArtist?: Artist;
  onSetActiveArtist: Dispatch<SetStateAction<Artist | undefined>>;
  onBook?: () => void;
}

export function ArtistsSection({
  activeArtist,
  onSetActiveArtist,
  onBook,
}: ArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/artists")
      .then((response) => response.json())
      .then((data) => setArtists(data));
  }, []);

  // Group artists into rows: odd rows = 2 artists (justify-between), even rows = 1 artist (centered)
  // Farik Interlude forced to the single-artist row
  const rows = useMemo(() => {
    if (artists.length === 0) return [];

    // Sort by name length (longest → first), Farik forced to position 2 (row index 1)
    const sorted = [...artists].sort((a, b) => b.name.length - a.name.length);
    const farikIdx = sorted.findIndex((a) => a.name === "Farik Interlude");
    if (farikIdx >= 0 && farikIdx !== 2) {
      const [farik] = sorted.splice(farikIdx, 1);
      sorted.splice(2, 0, farik);
    }

    const result: Artist[][] = [];
    let rowIdx = 0;
    let i = 0;
    while (i < sorted.length) {
      const count = rowIdx % 2 === 0 ? 2 : 1; // row 0 = 2, row 1 = 1, row 2 = 2, ...
      result.push(sorted.slice(i, i + count));
      i += count;
      rowIdx++;
    }
    return result;
  }, [artists]);

  if (artists.length === 0) {
    return <SectionSkeleton />;
  }

  return (
    <SectionFrame
      id="artists"
      eyebrow="Artists"
      intro="Resident DJs, producers, and core contributors shaping the RAAM sound."
      transition="top"
    >
      <div className="flex flex-col items-center gap-y-12 sm:gap-y-22 pt-16 sm:pt-8">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`flex w-full max-w-5xl gap-4 sm:gap-0 ${
              rowIdx % 2 === 0 ? "justify-center sm:justify-between" : "justify-center"
            }`}
          >
            {row.map((artist) => {
              const isHovered = hoveredId === artist.id;
              const isOtherHovered = hoveredId !== null && !isHovered;

              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => onSetActiveArtist(artist)}
                  onMouseEnter={() => setHoveredId(artist.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group font-bebas uppercase leading-[0.85] tracking-normal text-stone-50/90 outline-none transition-colors duration-700 ease-out hover:text-white focus:text-white text-[clamp(2.4rem,9vw,3.2rem)] sm:text-[clamp(2.4rem,7vw,3.5rem)] md:text-[clamp(2.8rem,6vw,5.5rem)] origin-center whitespace-normal text-center sm:text-left"
                  style={{
                    opacity: isOtherHovered ? 0.2 : 1,
                    transform: isHovered ? "scale(1.25)" : "scale(1)",
                    transition: "opacity 0.4s, transform 0.35s ease-out",
                    willChange: "transform, opacity",
                  }}
                  aria-label={`Open ${artist.name} profile`}
                >
                  <span
                    className="inline-flex items-center gap-3 transition duration-500 group-hover:-translate-y-1"
                    style={{
                      animation: `float-drift ${4 + artists.indexOf(artist) * 0.4}s ease-in-out infinite`,
                      animationDelay: `${artists.indexOf(artist) * 0.7}s`,
                      textShadow: "0 0 12px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {artist.avatar && (
                      <span className="relative inline-flex h-[1em] w-[1em] shrink-0 overflow-hidden rounded-full border border-white/20">
                        <Image
                          src={artist.avatar}
                          alt=""
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                          style={(() => {
                            const { position, zoom } = parseImagePosition(artist.avatarPosition);
                            return {
                              transformOrigin: position,
                              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                            };
                          })()}
                          unoptimized
                        />
                      </span>
                    )}
                    {artist.name}
                  </span>
                  <span className="mt-2 block text-xs font-normal uppercase tracking-[0.36em] text-stone-200/70 opacity-0 transition delay-150 duration-500 group-hover:opacity-100 group-focus:opacity-100">
                    {artist.origin} / {artist.genres.slice(0, 2).join(" / ")}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <ArtistModal
        artist={activeArtist}
        onClose={() => onSetActiveArtist(undefined)}
        onBook={onBook}
      />
    </SectionFrame>
  );
}