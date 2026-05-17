"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

/* ───────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────── */

const MAX_TILT = 8; // degrees
const PERSPECTIVE = 800; // px

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */

export function Logo3D() {
  const logoRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !logoRef.current) return;

      const rect = logoRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1

      // Center-relative: -0.5..+0.5
      const cx = x - 0.5;
      const cy = y - 0.5;

      // Tilt away from cursor: cursor left → logo tilts left (rotateY negative)
      const rotateY = cx * MAX_TILT * -1;
      const rotateX = cy * MAX_TILT;

      logoRef.current.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      logoRef.current.style.transition = "transform 0.1s ease-out";
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    if (!logoRef.current) return;

    if (prefersReducedMotion) {
      logoRef.current.style.transform = "";
      logoRef.current.style.transition = "";
      return;
    }

    logoRef.current.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg)`;
    logoRef.current.style.transition = "transform 0.5s ease-out";
  }, [prefersReducedMotion]);

  const handleMouseEnterReduced = useCallback(() => {
    if (!prefersReducedMotion || !logoRef.current) return;
    logoRef.current.style.transform = "scale(1.02)";
    logoRef.current.style.transition = "transform 0.3s ease-out";
  }, [prefersReducedMotion]);

  const handleMouseLeaveReduced = useCallback(() => {
    if (!prefersReducedMotion || !logoRef.current) return;
    logoRef.current.style.transform = "";
    logoRef.current.style.transition = "transform 0.3s ease-out";
  }, [prefersReducedMotion]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={prefersReducedMotion ? handleMouseLeaveReduced : handleMouseLeave}
      onMouseEnter={prefersReducedMotion ? handleMouseEnterReduced : undefined}
      className="relative cursor-pointer select-none"
    >
      <div ref={logoRef} style={{ willChange: "transform" }}>
        <Image
          src="/assets/images/logo.png"
          alt="RAAM"
          width={800}
          height={340}
          sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
          className="h-48 w-auto sm:h-64 lg:h-80"
          priority
        />
      </div>
    </div>
  );
}
