"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Handshake, NotebookPen, Video } from "lucide-react";

const cornerPositions = [
  { left: "0%", top: "0%" },
  { left: "50%", top: "0%" },
  { left: "0%", top: "50%" },
  { left: "50%", top: "50%" },
];

const labels = ["Book Artist", "Collaboration", "Media Production", "Coaching"];
const icons = [NotebookPen, Handshake, Video, GraduationCap];
const inquiryTypes = ["book", "collab", "media", "coaching"] as const;

interface LogoDotsProps {
  onSelect?: (type: (typeof inquiryTypes)[number]) => void;
}

export function LogoDots({ onSelect }: LogoDotsProps) {
  const [activeDot, setActiveDot] = useState<number | null>(null);

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72">
      {[0, 1, 2, 3].map((i) => {
        const isActive = activeDot === i;
        const isOtherActive = activeDot !== null && !isActive;

        return (
          <motion.button
            key={i}
            type="button"
            className="absolute rounded-full border border-white/10 bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.06)]"
            style={{ width: "48%", height: "48%" }}
            animate={{
              left: isActive ? "50%" : cornerPositions[i].left,
              top: isActive ? "50%" : cornerPositions[i].top,
              x: isActive ? "-50%" : "0%",
              y: isActive ? "-50%" : "0%",
              scale: isActive ? 2.0 : isOtherActive ? 0.85 : 1,
              opacity: isOtherActive ? 0.25 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 28,
            }}
            onMouseEnter={() => setActiveDot(i)}
            onMouseLeave={() => setActiveDot(null)}
            onClick={() => onSelect?.(inquiryTypes[i])}
          >
            {(() => {
              const Icon = icons[i];
              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-[#0a0a0a] sm:gap-1">
                  <Icon
                    size={20}
                    className="opacity-80 sm:size-[20px]"
                    strokeWidth={1.5}
                  />
                  <span className="text-[0.55rem] font-medium uppercase tracking-[0.12em] opacity-85 sm:text-[0.6rem]">
                    {labels[i]}
                  </span>
                </div>
              );
            })()}
          </motion.button>
        );
      })}
    </div>
  );
}