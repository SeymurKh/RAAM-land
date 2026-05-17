"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */

interface FragmentData {
  id: number;
  col: number;
  row: number;
  clipPath: string;
  scatter: {
    x: number;
    y: number;
    z: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    scale: number;
    opacity: number;
  };
  delay: number;
  reassembleDelay: number; // staggered reassemble delay
  idlePhase: number;       // random phase offset for ambient floating
  idlePeriod: number;      // 4-7 seconds per fragment
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

type AnimationState =
  | "idle"
  | "hovering"
  | "pressed"
  | "exploding"
  | "explodingFloat"
  | "reassembling";

/* ───────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────── */

const GRID_COLS = 8;
const GRID_ROWS = 4;
const MOBILE_GRID_COLS = 6;
const MOBILE_GRID_ROWS = 3;

const PARTICLE_COUNT_DESKTOP = 36;
const PARTICLE_COUNT_MOBILE = 18;
const PARTICLE_LIFETIME_MS = 800;

const SPARKLE_COUNT = 15;
const SPARKLE_LIFETIME_MS = 300;

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getClipPath(
  col: number,
  row: number,
  totalCols: number,
  totalRows: number
): string {
  const top = (row / totalRows) * 100;
  const bottom = ((totalRows - row - 1) / totalRows) * 100;
  const left = (col / totalCols) * 100;
  const right = ((totalCols - col - 1) / totalCols) * 100;
  return `inset(${top}% ${right}% ${bottom}% ${left}%)`;
}

/* ───────────────────────────────────────────────
   Fragment generation (idle defaults)
   ─────────────────────────────────────────────── */

function generateFragments(cols: number, rows: number): FragmentData[] {
  const fragments: FragmentData[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = row * cols + col;
      fragments.push({
        id,
        col,
        row,
        clipPath: getClipPath(col, row, cols, rows),
        scatter: {
          x: 0, y: 0, z: 0,
          rotateX: 0, rotateY: 0, rotateZ: 0,
          scale: 1, opacity: 1,
        },
        delay: 0,
        reassembleDelay: 0,
        idlePhase: random(0, Math.PI * 2),
        idlePeriod: random(4, 7),
      });
    }
  }
  return fragments;
}

/* ───────────────────────────────────────────────
   Scatter computation — radiates from click
   ─────────────────────────────────────────────── */

function computeScatter(
  fragments: FragmentData[],
  clickX: number,
  clickY: number,
  containerWidth: number,
  containerHeight: number,
  cols: number,
  rows: number
): FragmentData[] {
  // Pre-compute container center for reassemble stagger
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  return fragments.map((fragment) => {
    const fragmentCenterX = ((fragment.col + 0.5) / cols) * containerWidth;
    const fragmentCenterY = ((fragment.row + 0.5) / rows) * containerHeight;

    // Direction from click to fragment
    const dx = fragmentCenterX - clickX;
    const dy = fragmentCenterY - clickY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const directionX = distance > 0 ? dx / distance : random(-1, 1);
    const directionY = distance > 0 ? dy / distance : random(-1, 1);

    const distanceFactor = random(0.6, 1.4);

    // Reassemble stagger: distance from center (farthest first)
    const distFromCenter = Math.sqrt(
      (fragmentCenterX - centerX) ** 2 + (fragmentCenterY - centerY) ** 2
    );

    return {
      ...fragment,
      scatter: {
        x: directionX * random(120, 280) * distanceFactor,
        y: directionY * random(120, 280) * distanceFactor,
        z: random(80, 250),
        rotateX: random(-45, 45),
        rotateY: random(-45, 45),
        rotateZ: random(-30, 30),
        scale: random(0.3, 0.7),
        opacity: random(0.15, 0.5),
      },
      delay: distance * 0.02,
      reassembleDelay: distFromCenter * 0.008, // Enhancement 6
    };
  });
}

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */

export function Logo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [fragments, setFragments] = useState<FragmentData[]>(() =>
    generateFragments(GRID_COLS, GRID_ROWS)
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Bug 1 fix: ref to always hold latest fragments
  const fragmentsRef = useRef<FragmentData[]>(fragments);
  fragmentsRef.current = fragments;

  // Bug 8 fix: mounted flag for cleanup
  const mountedRef = useRef(true);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enhancement 1: cursor parallax tracking
  const cursorRef = useRef({ x: 0, y: 0 });
  const parallaxFrameRef = useRef<number | null>(null);

  const prefersReducedMotion = useReducedMotion();

  /* ─── Mobile detection (Bug 4 fix: reactive) ─── */

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    // Debounced resize (200ms per performance notes)
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

  const gridCols = isMobile ? MOBILE_GRID_COLS : GRID_COLS;
  const gridRows = isMobile ? MOBILE_GRID_ROWS : GRID_ROWS;

  // Keep fragments in sync with grid size
  const currentFragments = useMemo(() => {
    if (fragments.length !== gridCols * gridRows) {
      return generateFragments(gridCols, gridRows);
    }
    return fragments;
  }, [fragments, gridCols, gridRows]);

  /* ─── Bug 6 fix: reassemble counter ─── */

  const reassembleCompleteCountRef = useRef(0);
  const totalFragmentsRef = useRef(currentFragments.length);
  totalFragmentsRef.current = currentFragments.length;

  const handleFragmentReassembleComplete = useCallback(() => {
    reassembleCompleteCountRef.current += 1;
    if (reassembleCompleteCountRef.current >= totalFragmentsRef.current) {
      reassembleCompleteCountRef.current = 0;
      setAnimationState("idle");
    }
  }, []);

  /* ─── Bug 8 fix: cleanup on unmount ─── */

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (particleTimerRef.current) clearTimeout(particleTimerRef.current);
      if (sparkleTimerRef.current) clearTimeout(sparkleTimerRef.current);
      if (parallaxFrameRef.current) cancelAnimationFrame(parallaxFrameRef.current);
    };
  }, []);

  /* ─── Enhancement 1: cursor-follow parallax on exploded fragments ─── */

  useEffect(() => {
    if (animationState !== "exploding" && animationState !== "explodingFloat") {
      return;
    }
    const container = ref.current;
    if (!container) return;

    let rafId: number;
    const onMove = (e: PointerEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove);

    const update = () => {
      if (!mountedRef.current) return;
      if (!ref.current) { rafId = requestAnimationFrame(update); return; }

      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = (cursorRef.current.x - cx) / rect.width;
      const my = (cursorRef.current.y - cy) / rect.height;

      // Apply subtle CSS custom properties for parallax
      ref.current.style.setProperty("--parallax-x", `${mx * 15}px`);
      ref.current.style.setProperty("--parallax-y", `${my * 15}px`);

      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [animationState]);

  /* ─── Glow helpers ─── */

  const glowOpacity = useMemo(() => {
    if (prefersReducedMotion) return 0.12;
    switch (animationState) {
      case "idle":           return 0.12;
      case "hovering":       return 0.25;
      case "pressed":        return 0.55;
      case "exploding":      return 0.55;
      case "explodingFloat": return 0.4;
      case "reassembling":   return 0.25;
      default:               return 0.12;
    }
  }, [animationState, prefersReducedMotion]);

  const glowColor = useMemo(() => {
    if (
      animationState === "exploding" ||
      animationState === "explodingFloat" ||
      animationState === "pressed"
    ) {
      return "rgba(214, 180, 120, 0.4)";
    }
    return "rgba(255, 255, 255, 0.3)";
  }, [animationState]);

  /* ─── Enhancement 4: haptic pulse on press ─── */

  const hapticScale = useMemo(() => {
    if (animationState === "pressed") return 0.98;
    return 1;
  }, [animationState]);

  /* ─── Pointer handlers ─── */

  function handlePointerMove(e: React.PointerEvent) {
    if (!ref.current || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setRotateY(x * 6);
    setRotateX(-y * 6);
  }

  function handlePointerEnter() {
    if (prefersReducedMotion) return;
    setIsHovering(true);
    if (animationState === "idle" || animationState === "reassembling") {
      setAnimationState("hovering");
    }
  }

  function handlePointerLeave() {
    setRotateX(0);
    setRotateY(0);
    setIsHovering(false);
    clearTimers();
    if (
      animationState === "hovering" ||
      animationState === "pressed"
    ) {
      setAnimationState("idle");
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (prefersReducedMotion) return;
    e.preventDefault();

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Bug 2 fix: store container dimensions at click time
    setContainerSize({ width: rect.width, height: rect.height });
    setClickPosition({ x: clickX, y: clickY });
    setAnimationState("pressed");

    // Bug 1 fix: compute scatter HERE before scheduling, using ref
    const scattered = computeScatter(
      fragmentsRef.current,
      clickX,
      clickY,
      rect.width,
      rect.height,
      gridCols,
      gridRows
    );

    // Explode after 100ms hold (v2 state machine)
    holdTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setFragments(scattered);
      setAnimationState("exploding");
      spawnParticles(clickX, clickY);
      spawnSparkles(scattered);

      // After scatter settles, transition to explodingFloat
      setTimeout(() => {
        if (!mountedRef.current) return;
        if (
          fragmentsRef.current.some((f) => f.scatter.x !== 0)
        ) {
          setAnimationState("explodingFloat");
        }
      }, 600);
    }, 100);
  }

  function handlePointerUp() {
    clearTimers();
    if (
      animationState === "exploding" ||
      animationState === "explodingFloat"
    ) {
      setAnimationState("reassembling");
      reassembleCompleteCountRef.current = 0;
    } else {
      setAnimationState(isHovering ? "hovering" : "idle");
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
    setContainerSize({ width: rect.width, height: rect.height });
    setClickPosition({ x: clickX, y: clickY });
    setAnimationState("pressed");

    const scattered = computeScatter(
      fragmentsRef.current,
      clickX,
      clickY,
      rect.width,
      rect.height,
      gridCols,
      gridRows
    );

    holdTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setFragments(scattered);
      setAnimationState("exploding");
      spawnParticles(clickX, clickY);
      spawnSparkles(scattered);

      setTimeout(() => {
        if (!mountedRef.current) return;
        setAnimationState("explodingFloat");
      }, 600);
    }, 100);
  }

  function handleTouchEnd() {
    clearTimers();
    if (
      animationState === "exploding" ||
      animationState === "explodingFloat"
    ) {
      setAnimationState("reassembling");
      reassembleCompleteCountRef.current = 0;
    } else {
      setAnimationState("idle");
    }
  }

  /* ─── Particle spawning ─── */

  function spawnParticles(clickX: number, clickY: number) {
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(100, 250);
      newParticles.push({
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(60, 150),
        size: random(3, 6),
        rotation: random(0, 360),
        rotationSpeed: random(-180, 180),
      });
    }
    setParticles(newParticles);

    particleTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setParticles([]);
    }, PARTICLE_LIFETIME_MS);
  }

  /* ─── Enhancement 3: sparkle trail particles ─── */

  function spawnSparkles(scattered: FragmentData[]) {
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const frag = scattered[Math.floor(Math.random() * scattered.length)];
      const angle = random(0, Math.PI * 2);
      const speed = random(30, 80);
      newSparkles.push({
        id: Date.now() + 10000 + i,
        x: ((frag.col + 0.5) / gridCols) * containerSize.width,
        y: ((frag.row + 0.5) / gridRows) * containerSize.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
    setSparkles(newSparkles);

    sparkleTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setSparkles([]);
    }, SPARKLE_LIFETIME_MS);
  }

  /* ─── Cleanup ─── */

  function clearTimers() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (particleTimerRef.current) {
      clearTimeout(particleTimerRef.current);
      particleTimerRef.current = null;
    }
    if (sparkleTimerRef.current) {
      clearTimeout(sparkleTimerRef.current);
      sparkleTimerRef.current = null;
    }
  }

  /* ─── Spring configs ─── */

  // Enhancement 2: gravity pull-back with bounce
  const scatterSpring = { stiffness: 120, damping: 12 };
  const reassembleSpring = { stiffness: 400, damping: 18 }; // bounce spring

  /* ─── Render ─── */

  const isExploded =
    animationState === "exploding" || animationState === "explodingFloat";

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
        // Enhancement 1: parallax CSS vars (applied via rAF)
        "--parallax-x": "0px",
        "--parallax-y": "0px",
      } as React.CSSProperties}
      className="relative cursor-pointer select-none"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          // Enhancement 4: haptic scale pulse
          scale: hapticScale,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 30 }}
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

        {/* ── Layer 1: Glow / Bloom ── */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: glowOpacity,
            filter: "blur(24px)",
          }}
          transition={{ duration: 0.3 }}
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
            className={
              animationState === "idle" || animationState === "hovering"
                ? "h-48 w-auto sm:h-64 lg:h-80 logo-glow-pulse"
                : "h-48 w-auto sm:h-64 lg:h-80"
            }
            priority
            aria-hidden
          />
        </motion.div>

        {/* ── Layer 2: Fragment Grid ── */}
        {currentFragments.map((fragment) => {
          const isIdle =
            animationState === "idle" || animationState === "hovering";

          // Idle ambient float on the fragment div itself (Bug 5 fix)
          const idleAnimate =
            isIdle && !prefersReducedMotion
              ? { y: [-1.5, 1.5, -1.5] }
              : {};

          const idleTransition =
            isIdle && !prefersReducedMotion
              ? {
                  duration: fragment.idlePeriod,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: fragment.idlePhase,
                }
              : {};

          // Scatter targets — include parallax offset (Enhancement 1)
          const stateAnimate = isExploded
            ? {
                x: fragment.scatter.x,
                y: fragment.scatter.y,
                z: fragment.scatter.z,
                rotateX: fragment.scatter.rotateX,
                rotateY: fragment.scatter.rotateY,
                rotateZ: fragment.scatter.rotateZ,
                scale: fragment.scatter.scale,
                opacity: fragment.scatter.opacity,
              }
            : animationState === "reassembling"
            ? {
                x: 0,
                y: 0,
                z: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
                opacity: 1,
              }
            : {};

          const stateTransition = isExploded
            ? {
                type: "spring" as const,
                ...scatterSpring,
                delay: fragment.delay,
              }
            : animationState === "reassembling"
            ? {
                type: "spring" as const,
                // Enhancement 2: per-fragment stiffness based on distance from center
                stiffness: 400 - fragment.reassembleDelay * 30,
                damping: 18,
                // Enhancement 6: staggered reassemble (outer first)
                delay: fragment.reassembleDelay,
                onComplete: handleFragmentReassembleComplete,
              }
            : {};

          // Enhancement 7: fragment shadow during explosion
          const shadowStyle: React.CSSProperties = isExploded
            ? { filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }
            : {};

          // Reduced motion fallback
          const reducedAnimate = prefersReducedMotion
            ? { opacity: isExploded ? 0.6 : 1 }
            : null;
          const reducedTransition = prefersReducedMotion
            ? { duration: 0.2 }
            : null;

          return (
            <motion.div
              key={fragment.id}
              className="absolute inset-0 logo-fragment"
              style={{
                clipPath: fragment.clipPath,
                overflow: "hidden",
                ...shadowStyle,
              }}
              animate={
                prefersReducedMotion
                  ? reducedAnimate!
                  : { ...idleAnimate, ...stateAnimate }
              }
              transition={
                prefersReducedMotion
                  ? reducedTransition!
                  : { ...idleTransition, ...stateTransition }
              }
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

        {/* ── Layer 3: Shockwave Ring ── */}
        <AnimatePresence>
          {animationState === "exploding" && (
            <>
              {/* Primary ring */}
              <motion.div
                key={`shockwave-1-${clickPosition.x}-${clickPosition.y}`}
                className="absolute pointer-events-none"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.3)",
                  left: clickPosition.x - 20,
                  top: clickPosition.y - 20,
                }}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              {/* Secondary ring with 100ms delay */}
              <motion.div
                key={`shockwave-2-${clickPosition.x}-${clickPosition.y}`}
                className="absolute pointer-events-none"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.2)",
                  left: clickPosition.x - 20,
                  top: clickPosition.y - 20,
                }}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* ── Layer 4: Burst Particles ── */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: particle.size,
                height: particle.size,
                background:
                  "radial-gradient(circle, rgba(255,220,160,0.9), transparent)",
                left: particle.x,
                top: particle.y,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                rotate: particle.rotation,
              }}
              animate={{
                x: particle.vx,
                y: particle.vy + 120,
                opacity: 0,
                // Bug 7 fix: accumulate rotation over lifetime
                rotate: particle.rotation + particle.rotationSpeed * 0.8,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* ── Layer 5: Sparkle Trail Particles (Enhancement 3) ── */}
        <AnimatePresence>
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 2,
                height: 2,
                background: "rgba(255,240,200,0.9)",
                left: sparkle.x,
                top: sparkle.y,
                boxShadow: "0 0 3px rgba(255,220,160,0.6)",
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: sparkle.vx,
                y: sparkle.vy + 40,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
