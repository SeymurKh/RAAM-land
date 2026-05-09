"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  Headphones,
  Camera,
  Music2,
  Play,
  Radio,
  X,
} from "lucide-react";
import type { Artist, SocialKind } from "@/types/content";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";

const socialIcons: Partial<Record<SocialKind, typeof Camera>> = {
  instagram: Camera,
  soundcloud: Radio,
  spotify: Music2,
  youtube: Play,
  linktree: ExternalLink,
};

interface ArtistModalProps {
  artist?: Artist;
  onClose: () => void;
}

export function ArtistModal({ artist, onClose }: ArtistModalProps) {
  useScrollLock(!!artist);

  useEffect(() => {
    if (!artist) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [artist, onClose]);

  return (
    <AnimatePresence>
      {artist ? (
        <motion.div
          className="fixed inset-0 z-[80] overflow-y-auto bg-black/72 px-4 pt-20 pb-5 backdrop-blur-2xl sm:px-6 sm:pt-24 sm:pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${artist.id}-title`}
          onMouseDown={onClose}
        >
          <motion.article
            initial={{ opacity: 0, y: 46, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative mx-auto min-h-[70vh] max-w-4xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b0a09]/92 shadow-[0_30px_140px_rgba(0,0,0,0.72)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/40 text-white backdrop-blur-xl transition hover:bg-white/10"
              aria-label="Close artist details"
            >
              <X size={18} />
            </button>

            <div className="absolute inset-0 opacity-70">
              <div
                className={cn(
                  "absolute -left-20 top-10 h-72 w-72 rounded-full bg-gradient-to-br blur-3xl",
                  artist.visual.tone,
                  "to-transparent",
                )}
              />
              <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-stone-800/30 blur-3xl" />
            </div>

            <div className="relative grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="flex min-h-[300px] flex-col justify-between border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-stone-300/55">
                    {artist.role} / {artist.origin}
                  </p>
                  <h3
                    id={`${artist.id}-title`}
                    className="mt-5 text-5xl font-semibold uppercase leading-[0.86] tracking-normal text-white sm:text-7xl"
                  >
                    {artist.name}
                  </h3>
                </div>

                <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  {artist.bannerImage ? (
                    <Image
                      src={artist.bannerImage}
                      alt={`${artist.name} banner`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(74,58,42,0.12),transparent)]" />
                      <div className="absolute inset-x-8 top-12 h-px bg-white/20" />
                      <div className="absolute bottom-8 left-8 text-[6rem] font-semibold uppercase leading-none tracking-normal text-white/10 sm:text-[9rem]">
                        {artist.visual.initials}
                      </div>
                      <div className="absolute bottom-8 right-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/35 text-stone-200 backdrop-blur-xl">
                        <Headphones size={28} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="artist-modal-scroll max-h-none overflow-y-auto p-6 sm:p-8 lg:max-h-[70vh]">
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-stone-200/72"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mt-10 space-y-5 text-lg leading-8 text-stone-100/76">
                  {artist.bio.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {artist.highlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-stone-200/72"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <p className="text-xs uppercase tracking-[0.42em] text-stone-300/55">
                    Portfolio
                  </p>
                  <div className="mt-5 grid gap-3">
                    {artist.portfolio.map((item) => {
                      const Icon = item.kind === "video" ? Play : Radio;
                      const hasUrl = !!item.url;
                      const sharedInner = (
                        <>
                          <span className="flex items-center gap-3 text-stone-100">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100/10">
                              <Icon size={16} />
                            </span>
                            {item.title}
                          </span>
                          <span className="flex items-center gap-2">
                            {hasUrl ? null : (
                              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-stone-400/60">
                                Soon
                              </span>
                            )}
                            <span className="text-xs uppercase tracking-[0.25em] text-stone-300/45">
                              {item.kind}
                            </span>
                          </span>
                        </>
                      );

                      if (hasUrl) {
                        return (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-stone-200/24 hover:bg-white/[0.07]"
                          >
                            {sharedInner}
                          </a>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-3xl border border-white/6 bg-white/[0.02] p-4 opacity-60"
                        >
                          {sharedInner}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-12 flex flex-wrap gap-3">
                  {artist.socials.map((social) => {
                    const Icon = socialIcons[social.kind] ?? ExternalLink;
                    return (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-200/78 transition hover:border-stone-100/28 hover:text-white"
                      >
                        <Icon size={15} />
                        {social.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
