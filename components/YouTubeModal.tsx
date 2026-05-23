"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { getYouTubeEmbed } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";

interface YouTubeModalProps {
  youtubeUrl?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function YouTubeModal({
  youtubeUrl,
  title,
  isOpen,
  onClose,
}: YouTubeModalProps) {
  useScrollLock(isOpen);

  const embedUrl = getYouTubeEmbed(youtubeUrl);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && embedUrl ? (
        <motion.div
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
            className="relative w-full max-w-4xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b0a09]/92 shadow-[0_30px_140px_rgba(0,0,0,0.72)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/40 text-white backdrop-blur-xl transition hover:bg-white/10"
              aria-label="Close video player"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              <h3 className="mb-6 text-2xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-50">
                {title}
              </h3>

              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <iframe
                  src={embedUrl}
                  title={`${title} — YouTube`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
