"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { getYouTubeEmbed } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";
import type { ProjectVideo } from "@/types/content";

interface YouTubeModalProps {
  youtubeUrl?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  videos?: ProjectVideo[];
}

export function YouTubeModal({
  youtubeUrl,
  title,
  isOpen,
  onClose,
  videos,
}: YouTubeModalProps) {
  useScrollLock(isOpen);

  const [activeUrl, setActiveUrl] = useState(youtubeUrl);
  const embedUrl = getYouTubeEmbed(activeUrl);

  // Reset active URL when modal opens (only on transition from closed → open)
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setActiveUrl(youtubeUrl);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, youtubeUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const hasVideos = videos && videos.length > 0;
  const activeVideo = hasVideos ? videos.find((v) => v.url === activeUrl) : null;

  const modal = isOpen && embedUrl ? (
    <AnimatePresence>
      <motion.div
        key="youtube-modal-overlay"
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 px-4 backdrop-blur-2xl sm:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} — YouTube player`}
        onMouseDown={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 46, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onMouseDown={(event) => event.stopPropagation()}
          className="relative w-full max-w-[92vw] sm:max-w-2xl md:max-w-5xl overflow-hidden rounded-xl sm:rounded-[1.6rem] border border-white/10 bg-[#0b0a09]/92 shadow-[0_30px_140px_rgba(0,0,0,0.72)]"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/40 text-white backdrop-blur-xl transition hover:bg-white/10"
            aria-label="Close video player"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 md:flex-row md:gap-6">
            {hasVideos && (
              <div className="shrink-0 md:w-52">
                <h3 className="mb-3 text-lg font-semibold uppercase leading-[0.9] tracking-normal text-stone-50">
                  {title}
                </h3>
                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 artist-modal-scroll">
                  {videos.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveUrl(v.url)}
                      className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                        v.url === activeUrl
                          ? "border-white/20 bg-white/[0.08] text-white"
                          : "border-white/8 bg-transparent text-stone-300/60 hover:border-white/15 hover:text-white"
                      }`}
                    >
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100/10 group-hover:bg-stone-100/20">
                        <Play size={12} />
                      </span>
                      <span className="line-clamp-1 text-xs">{v.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={hasVideos ? "flex-1" : "w-full"}>
              {!hasVideos && (
                <h3 className="mb-6 text-2xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-50">
                  {title}
                </h3>
              )}
              {activeVideo && hasVideos && (
                <p className="mb-2 text-xs text-stone-400/60">{activeVideo.title}</p>
              )}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <iframe
                  src={embedUrl}
                  title={`${activeVideo?.title ?? title} — YouTube`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return modal ? createPortal(modal, document.body) : null;
}