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
  idlePhase: number;   // random phase offset for ambient floating
  idlePeriod: number;  // 4-7 seconds per fragment
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

type AnimationState = "idle" | "hovering" | "pressed" | "exploding" | "reassembling";

/* ───────────────────────────────────────────────
   Constants — per plan: 8×4 desktop, 6×3 mobile
   ─────────────────────────────────────────────── */

const GRID_COLS = 8;
const GRID_ROWS = 4;
const MOBILE_GRID_COLS = 6;
const MOBILE_GRID_ROWS = 3;

const PARTICLE_COUNT_DESKTOP = 36;
const PARTICLE_COUNT_MOBILE = 18;
const PARTICLE_LIFETIME_MS = 800;

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getClipPath(col: number, row: number, totalCols: number, totalRows: number): string {
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
          x: 0,
          y: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 1,
          opacity: 1,
        },
        delay: 0,
        idlePhase: random(0, Math.PI * 2),
        idlePeriod: random(4, 7), // 4-7 seconds as per plan
      });
    }
  }
  return fragments;
}

/* ───────────────────────────────────────────────
   Scatter vector computation — radiates from click
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
  return fragments.map((fragment) => {
    // Fragment center relative to container
    const fragmentCenterX = ((fragment.col + 0.5) / cols) * containerWidth;
    const fragmentCenterY = ((fragment.row + 0.5) / rows) * containerHeight;

    // Direction from click point to fragment center
    const dx = fragmentCenterX - clickX;
    const dy = fragmentCenterY - clickY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const directionX = distance > 0 ? dx / distance : random(-1, 1);
    const directionY = distance > 0 ? dy / distance : random(-1, 1);

    // Distance factor for organic variation
    const distanceFactor = random(0.6, 1.4);

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
      delay: distance * 0.02, // wave stagger
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
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion = useReducedMotion();

  // Mobile detection — stable after mount
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const gridCols = isMobile ? MOBILE_GRID_COLS : GRID_COLS;
  const gridRows = isMobile ? MOBILE_GRID_ROWS : GRID_ROWS;

  // Keep fragments in sync with grid size
  const currentFragments = useMemo(() => {
    if (fragments.length !== gridCols * gridRows) {
      return generateFragments(gridCols, gridRows);
    }
    return fragments;
  }, [fragments.length, gridCols, gridRows]);

  /* ─── Glow helpers ─── */

  const glowOpacity = useMemo(() => {
    if (prefersReducedMotion) return 0.12;
    switch (animationState) {
      case "idle":         return 0.12;
      case "hovering":     return 0.25;
      case "pressed":      return 0.55;
      case "exploding":    return 0.55;
      case "reassembling": return 0.25;
      default:             return 0.12;
    }
  }, [animationState, prefersReducedMotion]);

  const glowColor = useMemo(() => {
    if (animationState === "exploding" || animationState === "pressed") {
      return "rgba(214, 180, 120, 0.4)"; // warm amber
    }
    return "rgba(255, 255, 255, 0.3)";    // neutral white
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
    setAnimationState("hovering");
  }

  function handlePointerLeave() {
    setRotateX(0);
    setRotateY(0);
    setIsHovering(false);
    clearTimers();
    setAnimationState("idle");
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (prefersReducedMotion) return;
    e.preventDefault();
    setAnimationState("pressed");

    // Record click position for scatter & shockwave
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setClickPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    // Explode after 150ms hold (per plan state machine)
    holdTimerRef.current = setTimeout(() => {
      triggerExplosion(e);
    }, 150);
  }

  function handlePointerUp() {
    clearTimers();
    if (animationState === "exploding") {
      setAnimationState("reassembling");
    } else {
      setAnimationState(isHovering ? "hovering" : "idle");
    }
  }

  /* ─── Touch handlers (mobile) ─── */

  function handleTouchStart(e: React.TouchEvent) {
    if (prefersReducedMotion) return;
    const touch = e.touches[0];
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = touch.clientX - rect.left;
    const clickY = touch.clientY - rect.top;
    setClickPosition({ x: clickX, y: clickY });
    setAnimationState("pressed");

    holdTimerRef.current = setTimeout(() => {
      triggerExplosionAtPoint(clickX, clickY, rect.width, rect.height);
    }, 150);
  }

  function handleTouchEnd() {
    clearTimers();
    if (animationState === "exploding") {
      setAnimationState("reassembling");
    } else {
      setAnimationState("idle");
    }
  }

  /* ─── Explosion logic ─── */

  function triggerExplosion(e: React.PointerEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    triggerExplosionAtPoint(clickX, clickY, rect.width, rect.height);
  }

  function triggerExplosionAtPoint(
    clickX: number,
    clickY: number,
    containerWidth: number,
    containerHeight: number
  ) {
    // Compute scatter vectors
    const scatteredFragments = computeScatter(
      currentFragments,
      clickX,
      clickY,
      containerWidth,
      containerHeight,
      gridCols,
      gridRows
    );
    setFragments(scatteredFragments);
    setAnimationState("exploding");

    // Spawn particles
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
      });
    }
    setParticles(newParticles);

    // Remove particles after lifetime
    particleTimerRef.current = setTimeout(() => {
      setParticles([]);
    }, PARTICLE_LIFETIME_MS);
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
  }

  // Reassemble completion
  const handleReassembleComplete = useCallback(() => {
    setAnimationState("idle");
  }, []);

  /* ─── Spring configs ─── */

  const scatterSpring = { stiffness: 120, damping: 12 };
  const reassembleSpring = { stiffness: 350, damping: 25 };

  /* ─── Render ─── */

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
          rotateX,
          rotateY,
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
            className="h-48 w-auto sm:h-64 lg:h-80"
            priority
            aria-hidden
          />
        </motion.div>

        {/* ── Layer 2: Fragment Grid ── */}
        {currentFragments.map((fragment) => {
          // Determine the animation target for this fragment
          const isExploding = animationState === "exploding";
          const isReassembling = animationState === "reassembling";
          const isIdle = animationState === "idle" || animationState === "hovering";

          // Idle ambient float: subtle y oscillation per fragment
          const idleAnimate = isIdle && !prefersReducedMotion
            ? { y: [-1.5, 1.5, -1.5] }
            : {};

          const idleTransition = isIdle && !prefersReducedMotion
            ? {
                duration: fragment.idlePeriod,
                repeat: Infinity,
                ease: "easeInOut",
                delay: fragment.idlePhase,
              }
            : {};

          // Scatter / reassemble targets
          const stateAnimate = isExploding
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
            : isReassembling
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

          const stateTransition = isExploding
            ? {
                type: "spring" as const,
                ...scatterSpring,
                delay: fragment.delay,
              }
            : isReassembling
            ? {
                type: "spring" as const,
                ...reassembleSpring,
                onComplete: fragment.id === 0 ? handleReassembleComplete : undefined,
              }
            : {};

          // Reduced motion: simple opacity only
          const reducedAnimate = prefersReducedMotion
            ? { opacity: isExploding ? 0.6 : 1 }
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
              }}
              animate={prefersReducedMotion ? reducedAnimate! : { ...idleAnimate, ...stateAnimate }}
              transition={prefersReducedMotion ? reducedTransition! : { ...idleTransition, ...stateTransition }}
            >
              {/* Exploding state: add floating drift inside each fragment */}
              {isExploding && !prefersReducedMotion && (
                <motion.div
                  animate={{
                    y: [
                      Math.sin(fragment.idlePhase) * 8,
                      Math.sin(fragment.idlePhase + Math.PI) * 8,
                    ],
                    rotateZ: [0, random(-3, 3)],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ width: "100%", height: "100%" }}
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
              )}
              {!isExploding && (
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
              )}
            </motion.div>
          );
        })}

        {/* ── Layer 3: Shockwave Ring ── */}
        <AnimatePresence>
          {(animationState === "exploding" || animationState === "pressed") && (
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

        {/* ── Layer 4: Particle Canvas ── */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: particle.size,
                height: particle.size,
                background: "radial-gradient(circle, rgba(255,220,160,0.9), transparent)",
                left: particle.x,
                top: particle.y,
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: particle.vx,
                y: particle.vy + 120, // gravity-like arc
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
