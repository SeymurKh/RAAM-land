"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArtistModal } from "@/components/ArtistModal";
import { artists } from "@/data/site";
import type { Artist } from "@/types/content";
import { cn } from "@/lib/utils";

export function ArtistsSection() {
  const [activeArtist, setActiveArtist] = useState<Artist>();

  return (
    <section
      id="artists"
      className="relative isolate min-h-screen overflow-hidden px-5 py-24 sm:px-8 lg:px-12"
    >
      <Image
        src="/assets/images/raam-artists-bg.png"
        alt="RAAM Presents logo background"
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_23%),linear-gradient(180deg,#080706_0%,rgba(8,7,6,0.55)_42%,#080706_100%)]" />
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

      <div className="relative mx-auto min-h-[760px] max-w-7xl">
        <p className="absolute left-0 top-0 text-xs uppercase tracking-[0.48em] text-stone-300/45">
          Residents
        </p>

        {artists.map((artist, index) => (
          <motion.button
            key={artist.id}
            type="button"
            onClick={() => setActiveArtist(artist)}
            initial={{ opacity: 0, y: 40, rotateX: 18 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            animate={{
              y: [0, index % 2 ? -14 : 14, 0],
              rotateZ: [0, index % 2 ? 1.4 : -1.2, 0],
            }}
            transition={{
              opacity: { duration: 0.8, delay: index * 0.08 },
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
            style={{ top: `${14 + (index / artists.length) * 68}%`, ...(index % 2 === 0 ? { left: `${7 + (index % 3) * 3}%` } : { right: `${7 + (index % 3) * 3}%` }), ...(index === artists.length - 1 && artists.length > 1 ? { left: '50%', right: 'auto', transform: 'translateX(-50%)' } : {}) }}
            className={cn(
              "artist-name-3d group absolute max-w-[86vw] text-left text-5xl font-semibold uppercase leading-[0.82] tracking-normal text-stone-100/82 outline-none transition duration-500 hover:text-white focus:text-white sm:text-7xl lg:text-[7.5rem]",
            )}
            aria-label={`Open ${artist.name} profile`}
          >
            <span className="block transition duration-500 group-hover:-translate-y-2">
              {artist.name}
            </span>
            <span className="mt-3 block text-xs font-normal uppercase tracking-[0.36em] text-stone-300/45 opacity-0 transition duration-500 group-hover:opacity-100 group-focus:opacity-100">
              {artist.origin} / {artist.genres.slice(0, 2).join(" / ")}
            </span>
          </motion.button>
        ))}
      </div>

      <ArtistModal artist={activeArtist} onClose={() => setActiveArtist(undefined)} />
    </section>
  );
}
