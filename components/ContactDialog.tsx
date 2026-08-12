"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Handshake, NotebookPen, Video, X } from "lucide-react";
import type { Artist } from "@/types/content";

export type InquiryType = "book" | "collab" | "media" | "coaching";

const config = {
  book: {
    label: "Book Artist",
    icon: NotebookPen,
    needsArtists: true,
  },
  collab: {
    label: "Collaboration",
    icon: Handshake,
    needsArtists: false,
  },
  media: {
    label: "Media Production",
    icon: Video,
    needsArtists: false,
  },
  coaching: {
    label: "Coaching",
    icon: GraduationCap,
    needsArtists: false,
  },
};

interface ContactDialogProps {
  open: boolean;
  type: InquiryType | null;
  onClose: () => void;
}

export function ContactDialog({ open, type, onClose }: ContactDialogProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Сброс полей при открытии — во время рендера, без эффекта
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedArtists([]);
      setEmail("");
      setPhone("");
      setMessage("");
      setStatus("idle");
    }
  }

  // Подгрузка списка артистов при первом открытии
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      fetch("/api/artists")
        .then((r) => r.json())
        .then(setArtists);
    }
    prevOpenRef.current = open;
  }, [open]);

  if (!type) return null;
  const { label, icon: Icon, needsArtists } = config[type];

  function toggleArtist(id: string) {
    setSelectedArtists((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          artists: selectedArtists
            .map((id) => artists.find((a) => a.id === id)?.name)
            .filter(Boolean),
          email,
          phone,
          message,
          website: honeypotRef.current?.value ?? "",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const modal = open ? (
    <AnimatePresence>
      <motion.div
        key="contact-dialog-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-85 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0a09]/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/30 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <h2 className="text-lg font-semibold uppercase tracking-[0.08em] text-white sm:text-xl">
                {label}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Artist selector (Book Artist only) */}
              {needsArtists && (
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-stone-300/60">
                    Select artists
                  </label>
                  <div className="flex max-h-45 flex-wrap gap-1.5 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-2.5">
                    {artists.length === 0 ? (
                      <p className="text-xs text-stone-400/50">Loading...</p>
                    ) : (
                      artists.map((artist) => (
                        <button
                          key={artist.id}
                          type="button"
                          onClick={() => toggleArtist(artist.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            selectedArtists.includes(artist.id)
                              ? "border-white/30 bg-white/15 text-white"
                              : "border-white/8 bg-transparent text-stone-300/60 hover:border-white/15 hover:text-white"
                          }`}
                        >
                          {artist.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-stone-300/60">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/30"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-stone-300/60">
                  Phone <span className="text-stone-500">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994 XX XXX XX XX"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/30"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-stone-300/60">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your request..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/30"
                />
              </div>

              {/* Honeypot — невидимое поле против ботов */}
              <input
                ref={honeypotRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={!email || status === "sending" || status === "sent"}
                className="w-full rounded-full border border-white/10 bg-white/6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white transition hover:bg-white/12 disabled:opacity-40"
              >
                {status === "sending"
                  ? "Sending..."
                  : status === "sent"
                    ? "Request sent ✓"
                    : "Send request"}
              </button>

              {status === "error" && (
                <p className="text-center text-xs text-red-400/80">
                  Something went wrong. Please try again or email us directly at
                  roomallaboutmusic@gmail.com
                </p>
              )}
            </form>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  ) : null;

  return modal ? createPortal(modal, document.body) : null;
}