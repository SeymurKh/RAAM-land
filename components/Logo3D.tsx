"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */

interface StripData {
  id: number;
  clipPath: string;
  /** Inertia-based scatter from click */
  scatter: {
    x: number;
    y: number;
    z: number;
    rotateX: number;
    opacity: number;
  };
  /** Stagger index for reassemble (top-to-bottom) */
  index: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

type AnimState = "idle" | "hover" | "scattered" | "reassembling";

/* ───────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────── */

const STRIP_COUNT = 6;
const MOBILE_STRIP_COUNT = 5;

const PARTICLE_COUNT = 14;
const MOBILE_PARTICLE_COUNT = 8;
const PARTICLE_LIFETIME_MS = 600;

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Horizontal strip clipPath — covers full width, slices a portion of height */
function getStripClipPath(index: number, total: number): string {
  const top = (index / total) * 100;
  const bottom = ((total - index - 1) / total) * 100;
  return `inset(${top}% 0% ${bottom}% 0%)`;
}

/* ───────────────────────────────────────────────
   Strip generation
   ─────────────────────────────────────────────── */

function generateStrips(count: number): StripData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    clipPath: getStripClipPath(i, count),
    scatter: { x: 0, y: 0, z: 0, rotateX: 0, opacity: 1 },
    index: i,
  }));
}

/* ───────────────────────────────────────────────
   Scatter computation — inertia fan-out
   Strips scatter like a deck of cards:
   - Upper strips fly up, lower strips fly down
   - rotateX follows direction (flip away from click)
   - Horizontal drift proportional to distance from center
   ─────────────────────────────────────────────── */

function computeScatter(
  strips: StripData[],
  clickYRatio: number, // 0..1 — vertical position of click within logo
  containerWidth: number
): StripData[] {
  const total = strips.length;

  return strips.map((strip) => {
    const stripCenter = (strip.index + 0.5) / total; // 0..1

    // Vertical direction: strips above click fly up, below fly down
    const dy = stripCenter - clickYRatio;
    const absDy = Math.abs(dy);
    const direction = dy >= 0 ? 1 : -1;

    // Further from click → more force
    const forceFactor = 0.6 + absDy * 1.2;

    // Vertical scatter: 80-220px away, proportional to distance from click
    const scatterY = direction * random(80, 220) * forceFactor;

    // Horizontal drift: slight outward from center, more for edge strips
    const hDrift = random(-60, 60) + (stripCenter - 0.5) * random(40, 120);

    // Z-depth for parallax feel
    const scatterZ = random(40, 160);

    // rotateX: flip away from click direction — like cards being swept
    const rotateX = direction * random(15, 50) * forceFactor;

    // Opacity: slightly transparent when scattered
    const opacity = random(0.5, 0.85);

    return {
      ...strip,
      scatter: {
        x: hDrift,
        y: scatterY,
        z: scatterZ,
        rotateX,
        opacity,
      },
    };
  });
}

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */

export function Logo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [strips, setStrips] = useState<StripData[]>(() =>
    generateStrips(STRIP_COUNT)
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clickYRatio, setClickYRatio] = useState(0.5);
  const [containerWidth, setContainerWidth] = useState(0);

  const stripsRef = useRef<StripData[]>(strips);
  stripsRef.current = strips;

  const mountedRef = useRef(true);
  const particleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion = useReducedMotion();

  /* ─── Mobile detection ─── */

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    let raf: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(raf);
      raf = setTimeout(check, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(raf);
    };
  }, []);

  const stripCount = isMobile ? MOBILE_STRIP_COUNT : STRIP_COUNT;

  // Keep strips in sync with count
  const currentStrips = useMemo(() => {
    if (strips.length !== stripCount) {
      return generateStrips(stripCount);
    }
    return strips;
  }, [strips, stripCount]);

  /* ─── Cleanup on unmount ─── */

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (particleTimerRef.current) clearTimeout(particleTimerRef.current);
    };
  }, []);

  /* ─── Glow opacity ─── */

  const glowOpacity = useMemo(() => {
    if (prefersReducedMotion) return 0.08;
    switch (animState) {
      case "idle":         return 0.08;
      case "hover":        return 0.20;
      case "scattered":    return 0.35;
      case "reassembling": return 0.15;
      default:             return 0.08;
    }
  }, [animState, prefersReducedMotion]);

  const glowColor = useMemo(() => {
    if (animState === "scattered") {
      return "rgba(214, 180, 120, 0.35)"; // warm amber
    }
    return "rgba(255, 255, 255, 0.25)"; // neutral white
  }, [animState]);

  const glowBlur = useMemo(() => {
    switch (animState) {
      case "idle":      return "blur(30px)";
      case "hover":     return "blur(24px)";
      case "scattered": return "blur(20px)";
      default:          return "blur(28px)";
    }
  }, [animState]);

  /* ─── Reassemble completion ─── */

  const reassembleCountRef = useRef(0);

  const handleStripReassemble = useCallback(() => {
    reassembleCountRef.current += 1;
    if (reassembleCountRef.current >= stripCount) {
      reassembleCountRef.current = 0;
      setAnimState("idle");
    }
  }, [stripCount]);

  /* ─── Pointer handlers ─── */

  function handlePointerMove(e: React.PointerEvent) {
    if (!ref.current || prefersReducedMotion) return;
    // Only tilt in idle/hover
    if (animState === "scattered" || animState === "reassembling") return;

    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.clientX - cx) / (rect.width / 2);
    const y = (e.clientY - cy) / (rect.height / 2);

    // Softer tilt than before: 4° horizontal, 3° vertical
    setTiltY(x * 4);
    setTiltX(-y * 3);
  }

  function handlePointerEnter() {
    if (prefersReducedMotion) return;
    if (animState === "idle") {
      setAnimState("hover");
    }
  }

  function handlePointerLeave() {
    setTiltX(0);
    setTiltY(0);
    if (animState === "hover") {
      setAnimState("idle");
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (prefersReducedMotion) return;
    e.preventDefault();

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const yRatio = clickY / rect.height;

    setClickYRatio(yRatio);
    setContainerWidth(rect.width);

    // IMMEDIATE scatter — no delay
    const scattered = computeScatter(stripsRef.current, yRatio, rect.width);
    setStrips(scattered);
    setAnimState("scattered");
    reassembleCountRef.current = 0;

    // Spawn minimal particles
    spawnParticles(clickX, clickY);
  }

  function handlePointerUp() {
    if (animState === "scattered") {
      setAnimState("reassembling");
      reassembleCountRef.current = 0;
      // Reset tilt while reassembling
      setTiltX(0);
      setTiltY(0);
    }
  }

  /* ─── Touch handlers ─── */

  function handleTouchStart(e: React.TouchEvent) {
    if (prefersReducedMotion) return;
    const touch = e.touches[0];
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = touch.clientX - rect.left;
    const clickY = touch.clientY - rect.top;
    const yRatio = clickY / rect.height;

    setClickYRatio(yRatio);
    setContainerWidth(rect.width);

    const scattered = computeScatter(stripsRef.current, yRatio, rect.width);
    setStrips(scattered);
    setAnimState("scattered");
    reassembleCountRef.current = 0;
    spawnParticles(clickX, clickY);
  }

  function handleTouchEnd() {
    if (animState === "scattered") {
      setAnimState("reassembling");
      reassembleCountRef.current = 0;
      setTiltX(0);
      setTiltY(0);
    }
  }

  /* ─── Particles — minimal, gold dots ─── */

  function spawnParticles(cx: number, cy: number) {
    const count = isMobile ? MOBILE_PARTICLE_COUNT : PARTICLE_COUNT;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(60, 160);
      newParticles.push({
        id: Date.now() + i,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(30, 80),
        size: random(2, 4),
      });
    }
    setParticles(newParticles);

    particleTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setParticles([]);
    }, PARTICLE_LIFETIME_MS);
  }

  /* ─── Spring configs ─── */

  const scatterSpring = { stiffness: 140, damping: 14 };
  const reassembleSpring = { stiffness: 300, damping: 25 };

  /* ─── Render ─── */

  const isScattered = animState === "scattered";
  const isReassembling = animState === "reassembling";

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
        touchAction: "none",
      }}
      className="relative cursor-pointer select-none"
    >
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Sizer image — invisible, establishes container size */}
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

        {/* ── Glow / Bloom Layer ── */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: glowOpacity,
            filter: glowBlur,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            mixBlendMode: "screen",
            backgroundColor: glowColor,
          }}
        >
          <Image
            src="/assets/images/logo.png"
            alt=""
            width={800}
            height={340}
            sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
            className="h-48 w-auto sm:h-64 lg:h-80"
            priority
            aria-hidden
          />
        </motion.div>

        {/* ── Idle breathing: whole logo subtle scale pulse ── */}
        <motion.div
          className="absolute inset-0"
          animate={
            animState === "idle" && !prefersReducedMotion
              ? { scale: [1, 1.008, 1] }
              : { scale: 1 }
          }
          transition={
            animState === "idle"
              ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ── Strip Fragments ── */}
          {currentStrips.map((strip) => {
            // Reduced motion: simple opacity
            if (prefersReducedMotion) {
              return (
                <motion.div
                  key={strip.id}
                  className="absolute inset-0 logo-fragment"
                  style={{ clipPath: strip.clipPath }}
                  animate={{
                    opacity: isScattered ? 0.6 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src="/assets/images/logo.png"
                    alt=""
                    width={800}
                    height={340}
                    sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
                    className="h-48 w-auto sm:h-64 lg:h-80"
                    priority
                    aria-hidden
                  />
                </motion.div>
              );
            }

            // Scatter animation target
            const target = isScattered
              ? {
                  x: strip.scatter.x,
                  y: strip.scatter.y,
                  z: strip.scatter.z,
                  rotateX: strip.scatter.rotateX,
                  opacity: strip.scatter.opacity,
                }
              : isReassembling
              ? { x: 0, y: 0, z: 0, rotateX: 0, opacity: 1 }
              : {}; // idle/hover — no per-fragment animation

            const transition = isScattered
              ? {
                  type: "spring" as const,
                  ...scatterSpring,
                }
              : isReassembling
              ? {
                  type: "spring" as const,
                  ...reassembleSpring,
                  // Top-to-bottom stagger: 30ms per strip
                  delay: strip.index * 0.03,
                  onComplete:
                    strip.index === stripCount - 1
                      ? handleStripReassemble
                      : undefined,
                }
              : {};

            return (
              <motion.div
                key={strip.id}
                className="absolute inset-0 logo-fragment"
                style={{
                  clipPath: strip.clipPath,
                  overflow: "hidden",
                  transformOrigin: "center center",
                }}
                animate={target}
                transition={transition}
              >
                <Image
                  src="/assets/images/logo.png"
                  alt=""
                  width={800}
                  height={340}
                  sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
                  className="h-48 w-auto sm:h-64 lg:h-80"
                  priority
                  aria-hidden
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Particles — minimal gold dots ── */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: particle.size,
                height: particle.size,
                background: "rgba(214, 180, 120, 0.8)",
                left: particle.x,
                top: particle.y,
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: particle.vx,
                y: particle.vy + 80,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
