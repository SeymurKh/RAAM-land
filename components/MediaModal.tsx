"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { getMediaCover, getMediaEmbedUrl } from "@/lib/media";
import { useScrollLock } from "@/lib/useScrollLock";
import type { MediaItem } from "@/types/content";

interface MediaModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

/** Лайтбокс медиа-архива: фото — full-size, видео/аудио — embed-плеер. */
export function MediaModal({ item, onClose }: MediaModalProps) {
  useScrollLock(!!item);

  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  const embedUrl = item ? getMediaEmbedUrl(item) : undefined;
  const cover = item ? getMediaCover(item) : undefined;

  const modal = item ? (
    <AnimatePresence>
      <motion.div
        key="media-modal-overlay"
        className="fixed inset-0 z-80 flex items-center justify-center bg-black/72 px-4 backdrop-blur-2xl sm:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        onMouseDown={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 46, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onMouseDown={(event) => event.stopPropagation()}
          className="relative max-h-[92vh] w-full max-w-[92vw] overflow-y-auto rounded-xl border border-white/10 bg-[#0b0a09]/92 shadow-[0_30px_140px_rgba(0,0,0,0.72)] sm:max-w-2xl sm:rounded-[1.6rem] md:max-w-5xl artist-modal-scroll"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/40 text-white backdrop-blur-xl transition hover:bg-white/10"
            aria-label="Close media"
          >
            <X size={18} />
          </button>

          <div className="p-4 sm:p-6">
            <h3 className="mb-1 pr-12 text-lg font-semibold uppercase leading-tight tracking-normal text-stone-50">
              {item.title}
            </h3>
            <p className="mb-4 text-xs uppercase tracking-[0.22em] text-stone-400/60">
              {item.date}
            </p>

            {embedUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <iframe
                  src={embedUrl}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : cover ? (
              <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={cover}
                  alt={item.title}
                  fill
                  sizes="92vw"
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return modal ? createPortal(modal, document.body) : null;
}