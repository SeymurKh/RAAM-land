"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */

interface StripState {
  spinOffset: number; // degrees offset from base rotation
  desyncRate: number; // degrees/second offset rate during press
}

/* ───────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────── */

const STRIP_COUNT = 6;
const MOBILE_STRIP_COUNT = 5;

const BASE_SPEED = 30; // deg/s → full rotation in 12s
const MOBILE_BASE_SPEED = 25;

const BOX_DEPTH = 20; // px depth of 3D rectangle
const MOBILE_BOX_DEPTH = 14;

const RECOVERY_DECAY = 0.04; // per-frame lerp (at 60fps)
const MOBILE_RECOVERY_DECAY = 0.06;

const SPEED_MIN_MULT = 0.3;
const SPEED_MAX_MULT = 2.5;
const MOBILE_SPEED_MAX_MULT = 2.0;

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Horizontal strip clipPath — full width, slices portion of height */
function getStripClipPath(index: number, total: number): string {
  const top = (index / total) * 100;
  const bottom = ((total - index - 1) / total) * 100;
  return `inset(${top}% 0% ${bottom}% 0%)`;
}

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */

export function Logo3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Animation state — refs (updated per frame, NOT React state)
  const stripsStateRef = useRef<StripState[]>([]);
  const baseAngleRef = useRef(0);
  const isPressedRef = useRef(false);
  const isRecoveringRef = useRef(false);

  // React state — for UI that changes infrequently (glow, etc.)
  const [interactionState, setInteractionState] = useState<
    "idle" | "pressed" | "recovering"
  >("idle");

  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  /* ─── Mobile detection (debounced) ─── */

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(check, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  /* ─── Derived values ─── */

  const stripCount = isMobile ? MOBILE_STRIP_COUNT : STRIP_COUNT;
  const boxDepth = isMobile ? MOBILE_BOX_DEPTH : BOX_DEPTH;
  const baseSpeed = isMobile ? MOBILE_BASE_SPEED : BASE_SPEED;
  const recoveryDecay = isMobile ? MOBILE_RECOVERY_DECAY : RECOVERY_DECAY;
  const speedMaxMult = isMobile ? MOBILE_SPEED_MAX_MULT : SPEED_MAX_MULT;

  /* ─── Cleanup on unmount ─── */

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ─── Initialize / reset strip states when count changes ─── */

  useEffect(() => {
    stripsStateRef.current = Array.from({ length: stripCount }, () => ({
      spinOffset: 0,
      desyncRate: 0,
    }));
    // Reset DOM transforms
    stripRefs.current.forEach((el) => {
      if (el) el.style.transform = "rotateY(0deg)";
    });
    baseAngleRef.current = 0;
    isPressedRef.current = false;
    isRecoveringRef.current = false;
    setInteractionState("idle");
  }, [stripCount]);

  /* ─── Animation loop (requestAnimationFrame) ─── */

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      if (!mountedRef.current) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1); // cap delta
      lastTime = time;

      const speed = baseSpeed;
      const decay = recoveryDecay;
      const strips = stripsStateRef.current;

      // Base angle always advances at constant speed
      baseAngleRef.current += speed * dt;
      const base = baseAngleRef.current;

      let allRecovered = true;

      for (let i = 0; i < strips.length; i++) {
        const strip = strips[i];
        if (!strip) continue;

        if (isPressedRef.current) {
          // Each strip's offset grows at its own rate → desync
          strip.spinOffset += strip.desyncRate * dt;
          allRecovered = false;
        } else if (isRecoveringRef.current) {
          // Exponential decay: offset → 0 (frame-rate independent)
          const frameDecay = Math.pow(1 - decay, dt * 60);
          strip.spinOffset *= frameDecay;
          if (Math.abs(strip.spinOffset) < 0.3) {
            strip.spinOffset = 0;
          } else {
            allRecovered = false;
          }
        }

        // Display angle = base rotation + strip's offset
        const angle = base + strip.spinOffset;

        // Apply directly to DOM — no React re-render
        const el = stripRefs.current[i];
        if (el) {
          el.style.transform = `rotateY(${angle}deg)`;
        }
      }

      // Recovery complete?
      if (isRecoveringRef.current && allRecovered) {
        isRecoveringRef.current = false;
        setInteractionState("idle");
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [baseSpeed, recoveryDecay]);

  /* ─── Assign random desync rates ─── */

  const assignDesyncRates = useCallback(() => {
    for (const strip of stripsStateRef.current) {
      const mult = random(SPEED_MIN_MULT, speedMaxMult);
      // desyncRate = how fast offset changes vs base speed
      // multiplier 1.0 = same as base (no offset change)
      // multiplier 2.0 = offset grows at baseSpeed rate
      // multiplier 0.3 = offset shrinks (strip falls behind)
      strip.desyncRate = (mult - 1) * baseSpeed;
    }
  }, [baseSpeed, speedMaxMult]);

  /* ─── Event handlers ─── */

  function handlePointerDown(e: React.PointerEvent) {
    if (prefersReducedMotion) return;
    e.preventDefault();
    isPressedRef.current = true;
    isRecoveringRef.current = false;
    setInteractionState("pressed");
    assignDesyncRates();
  }

  function handlePointerUp() {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;
    isRecoveringRef.current = true;
    setInteractionState("recovering");
  }

  function handlePointerLeave() {
    if (isPressedRef.current) handlePointerUp();
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (prefersReducedMotion) return;
    e.preventDefault();
    isPressedRef.current = true;
    isRecoveringRef.current = false;
    setInteractionState("pressed");
    assignDesyncRates();
  }

  function handleTouchEnd() {
    handlePointerUp();
  }

  /* ─── Glow ─── */

  const glowOpacity = prefersReducedMotion
    ? 0.06
    : interactionState === "pressed"
    ? 0.30
    : interactionState === "recovering"
    ? 0.15
    : 0.06;

  const glowColor =
    interactionState === "pressed"
      ? "rgba(214, 180, 120, 0.3)"
      : "rgba(255, 255, 255, 0.2)";

  /* ─── Render ─── */

  const halfDepth = boxDepth / 2;

  // Clip paths for current strip count
  const clipPaths = Array.from({ length: stripCount }, (_, i) =>
    getStripClipPath(i, stripCount)
  );

  // Image props shared across all faces
  const imgProps = {
    src: "/assets/images/logo.png" as const,
    alt: "",
    width: 800,
    height: 340,
    sizes: "(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px",
    className: "h-48 w-auto sm:h-64 lg:h-80",
    priority: true,
    "aria-hidden": true as const,
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        perspective: "1200px",
        touchAction: "none",
      }}
      className="relative cursor-pointer select-none"
    >
      {/* Sizer — invisible, establishes container dimensions */}
      <Image
        src="/assets/images/logo.png"
        alt="RAAM"
        width={800}
        height={340}
        sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
        className="h-48 w-auto sm:h-64 lg:h-80 invisible"
        priority
        aria-hidden
      />

      {/* ── Glow / Bloom layer ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: glowOpacity,
          filter: "blur(24px)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          mixBlendMode: "screen",
          backgroundColor: glowColor,
        }}
      >
        <Image {...imgProps} />
      </motion.div>

      {/* ── 3D Strip Container ── */}
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {clipPaths.map((clipPath, i) => (
          <div
            key={i}
            ref={(el) => {
              stripRefs.current[i] = el;
            }}
            className="absolute inset-0 logo-fragment"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateY(0deg)",
            }}
          >
            {/* ── Front face ── */}
            <div
              className="absolute inset-0"
              style={{
                clipPath,
                transform: `translateZ(${halfDepth}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <Image {...imgProps} />
            </div>

            {/* ── Back face ── */}
            <div
              className="absolute inset-0"
              style={{
                clipPath,
                transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              {/* scaleX(-1) counter-mirrors so logo is readable from behind */}
              <div style={{ transform: "scaleX(-1)" }}>
                <Image {...imgProps} />
              </div>
            </div>

            {/* ── Left edge ── */}
            <div
              className="absolute top-0 bottom-0"
              style={{
                width: boxDepth,
                left: 0,
                transformOrigin: "left center",
                transform: `translateZ(${halfDepth}px) rotateY(-90deg)`,
                background:
                  "linear-gradient(to right, #1a1714, #0d0b09, #1a1714)",
              }}
            />

            {/* ── Right edge ── */}
            <div
              className="absolute top-0 bottom-0"
              style={{
                width: boxDepth,
                right: 0,
                transformOrigin: "right center",
                transform: `translateZ(${halfDepth}px) rotateY(90deg)`,
                background:
                  "linear-gradient(to left, #1a1714, #0d0b09, #1a1714)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
