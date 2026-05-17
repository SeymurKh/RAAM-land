"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

interface FragmentData {
  id: number;
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
  floatPhase: number;
  floatSpeed: number;
  rotateSpeed: number;
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

type AnimationState = "idle" | "hovering" | "pressed" | "exploding" | "reassembling";

// Grid configuration - increased for more dramatic effect
const GRID_COLS = 12;
const GRID_ROWS = 6;
const MOBILE_GRID_COLS = 8;
const MOBILE_GRID_ROWS = 4;

// Helper to generate clip path for a grid cell
function getClipPath(col: number, row: number, totalCols: number, totalRows: number): string {
  const top = (row / totalRows) * 100;
  const bottom = ((totalRows - row - 1) / totalRows) * 100;
  const left = (col / totalCols) * 100;
  const right = ((totalCols - col - 1) / totalCols) * 100;
  return `inset(${top}% ${right}% ${bottom}% ${left}%)`;
}

// Helper to generate random number in range
function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Generate fragment data for the grid
function generateFragments(cols: number, rows: number): FragmentData[] {
  const fragments: FragmentData[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = row * cols + col;
      fragments.push({
        id,
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
        floatPhase: random(0, Math.PI * 2),
        floatSpeed: random(0.5, 1.5),
        rotateSpeed: random(-2, 2),
      });
    }
  }
  return fragments;
}

// Compute scatter vectors based on click position
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
    const row = Math.floor(fragment.id / cols);
    const col = fragment.id % cols;
    
    // Calculate fragment center relative to container
    const fragmentCenterX = ((col + 0.5) / cols) * containerWidth;
    const fragmentCenterY = ((row + 0.5) / rows) * containerHeight;
    
    // Direction from click to fragment
    const dx = fragmentCenterX - clickX;
    const dy = fragmentCenterY - clickY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const directionX = distance > 0 ? dx / distance : 0;
    const directionY = distance > 0 ? dy / distance : 0;
    
    // Distance factor for wave effect
    const distanceFactor = random(0.8, 1.6);
    
    return {
      ...fragment,
      scatter: {
        x: directionX * random(150, 350) * distanceFactor,
        y: directionY * random(150, 350) * distanceFactor,
        z: random(100, 300),
        rotateX: random(-60, 60),
        rotateY: random(-60, 60),
        rotateZ: random(-45, 45),
        scale: random(0.4, 0.8),
        opacity: random(0.3, 0.7),
      },
      delay: distance * 0.015,
    };
  });
}

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
  const [holdTime, setHoldTime] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const prefersReducedMotion = useReducedMotion();
  
  // Check if mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const gridCols = isMobile ? MOBILE_GRID_COLS : GRID_COLS;
  const gridRows = isMobile ? MOBILE_GRID_ROWS : GRID_ROWS;
  
  // Regenerate fragments when grid size changes
  const currentFragments = useMemo(() => {
    if (fragments.length !== gridCols * gridRows) {
      return generateFragments(gridCols, gridRows);
    }
    return fragments;
  }, [fragments.length, gridCols, gridRows]);
  
  // Glow opacity based on state
  const glowOpacity = useMemo(() => {
    if (prefersReducedMotion) return 0.12;
    switch (animationState) {
      case "idle": return 0.12;
      case "hovering": return 0.25;
      case "pressed": return 0.55;
      case "exploding": return 0.55;
      case "reassembling": return 0.25;
      default: return 0.12;
    }
  }, [animationState, prefersReducedMotion]);
  
  // Glow color based on state
  const glowColor = useMemo(() => {
    if (animationState === "exploding") {
      return "rgba(214, 180, 120, 0.4)";
    }
    return "rgba(255, 255, 255, 0.3)";
  }, [animationState]);
  
  // Handle pointer move for 3D tilt
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
  
  // Handle pointer enter
  function handlePointerEnter() {
    if (prefersReducedMotion) return;
    setIsHovering(true);
    setAnimationState("hovering");
  }
  
  // Handle pointer leave
  function handlePointerLeave() {
    setRotateX(0);
    setRotateY(0);
    setIsHovering(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setHoldTime(0);
    setAnimationState("idle");
  }
  
  // Handle pointer down
  function handlePointerDown(e: React.PointerEvent) {
    if (prefersReducedMotion) return;
    e.preventDefault();
    setAnimationState("pressed");
    
    // Store click position for scatter calculation
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setClickPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    
    // Start timer for explosion
    holdTimerRef.current = setTimeout(() => {
      triggerExplosion(e);
    }, 100);
  }
  
  // Handle pointer up
  function handlePointerUp() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setHoldTime(0);
    
    if (animationState === "exploding") {
      setAnimationState("reassembling");
    } else {
      setAnimationState(isHovering ? "hovering" : "idle");
    }
  }
  
  // Trigger explosion
  function triggerExplosion(e: React.PointerEvent) {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Compute scatter vectors
    const scatteredFragments = computeScatter(
      currentFragments,
      clickX,
      clickY,
      rect.width,
      rect.height,
      gridCols,
      gridRows
    );
    
    setFragments(scatteredFragments);
    setAnimationState("exploding");
    
    // Spawn particles
    const particleCount = isMobile ? 30 : 50;
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(150, 350);
      newParticles.push({
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(80, 200),
        size: random(3, 8),
        rotation: random(0, 360),
        rotationSpeed: random(-180, 180),
      });
    }
    setParticles(newParticles);
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 1200);
  }
  
  // Reset fragments when reassembling
  const handleReassembleComplete = useCallback(() => {
    setAnimationState("idle");
  }, []);
  
  const scatterSpring = { stiffness: 120, damping: 12 };
  const reassembleSpring = { stiffness: 350, damping: 25 };
  
  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
        touchAction: "none",
      }}
      className="relative"
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
        {/* Sizer image: in-flow, invisible, establishes container dimensions */}
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
        
        {/* Glow Layer */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: glowOpacity,
            filter: `blur(24px)`,
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
        
        {/* Fragment Grid */}
        {currentFragments.map((fragment) => (
          <motion.div
            key={fragment.id}
            className="absolute inset-0 logo-fragment"
            style={{
              clipPath: fragment.clipPath,
              overflow: "hidden",
            }}
            animate={
              prefersReducedMotion
                ? { opacity: animationState === "exploding" ? 0.6 : 1 }
                : animationState === "exploding"
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
                : {}
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.2 }
                : animationState === "exploding"
                ? {
                    type: "spring",
                    ...scatterSpring,
                    delay: fragment.delay,
                  }
                : animationState === "reassembling"
                ? {
                    type: "spring",
                    ...reassembleSpring,
                    onComplete: fragment.id === 0 ? handleReassembleComplete : undefined,
                  }
                : {}
            }
          >
            {/* Floating and rotating animation while exploded */}
            {animationState === "exploding" && !prefersReducedMotion && (
              <motion.div
                animate={{
                  y: [
                    Math.sin(fragment.floatPhase) * 8,
                    Math.sin(fragment.floatPhase + Math.PI) * 8,
                  ],
                  rotateZ: fragment.rotateSpeed * 360,
                }}
                transition={{
                  duration: 3 / fragment.floatSpeed,
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
                  className="h-48 w-auto sm:h-64 lg:h-80 mix-blend-screen"
                  priority
                  aria-hidden
                />
              </motion.div>
            )}
            {animationState !== "exploding" && (
              <Image
                src="/assets/images/logo.png"
                alt=""
                width={800}
                height={340}
                sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
                className="h-48 w-auto sm:h-64 lg:h-80 mix-blend-screen"
                priority
                aria-hidden
              />
            )}
          </motion.div>
        ))}
        
        {/* Shockwave Rings */}
        <AnimatePresence>
          {animationState === "exploding" && (
            <>
              <motion.div
                className="absolute rounded-full border border-white/30 pointer-events-none"
                initial={{
                  width: 0,
                  height: 0,
                  x: clickPosition.x,
                  y: clickPosition.y,
                  opacity: 0.6,
                }}
                animate={{
                  width: "300%",
                  height: "300%",
                  x: clickPosition.x - ref.current!.getBoundingClientRect().width * 1.5,
                  y: clickPosition.y - ref.current!.getBoundingClientRect().height * 1.5,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  transform: "translate(-50%, -50%)",
                }}
              />
              <motion.div
                className="absolute rounded-full border border-white/20 pointer-events-none"
                initial={{
                  width: 0,
                  height: 0,
                  x: clickPosition.x,
                  y: clickPosition.y,
                  opacity: 0.5,
                }}
                animate={{
                  width: "300%",
                  height: "300%",
                  x: clickPosition.x - ref.current!.getBoundingClientRect().width * 1.5,
                  y: clickPosition.y - ref.current!.getBoundingClientRect().height * 1.5,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.12 }}
                style={{
                  transform: "translate(-50%, -50%)",
                }}
              />
            </>
          )}
        </AnimatePresence>
        
        {/* Particles */}
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
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: particle.vx * 1.0,
                y: particle.vy * 1.0 + 150,
                opacity: 0,
                rotate: particle.rotationSpeed,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
