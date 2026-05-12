"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

interface LogoPart {
  id: string;
  clip: string;
  scatter: {
    x: number;
    y: number;
    rotate: number;
    scale: number;
    opacity: number;
  };
}

const logoParts: LogoPart[] = [
  {
    id: "symbol",
    clip: "inset(0% 78% 0% 0%)",
    scatter: { x: -160, y: -12, rotate: -18, scale: 0.72, opacity: 0.6 },
  },
  {
    id: "R",
    clip: "inset(0% 60% 0% 22%)",
    scatter: { x: -70, y: -8, rotate: 12, scale: 0.78, opacity: 0.65 },
  },
  {
    id: "A1",
    clip: "inset(0% 42% 0% 38%)",
    scatter: { x: 10, y: 5, rotate: -4, scale: 0.74, opacity: 0.62 },
  },
  {
    id: "A2",
    clip: "inset(0% 24% 0% 54%)",
    scatter: { x: 80, y: 8, rotate: 10, scale: 0.8, opacity: 0.68 },
  },
  {
    id: "M",
    clip: "inset(0% 0% 0% 70%)",
    scatter: { x: 160, y: 12, rotate: 18, scale: 0.76, opacity: 0.58 },
  },
];

export function Logo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  function handlePointerMove(e: React.PointerEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2); // -1 to 1
    const y = (e.clientY - centerY) / (rect.height / 2); // -1 to 1
    setRotateY(x * 6); // max 6deg
    setRotateX(-y * 6);
  }

  function handlePointerLeave() {
    setRotateX(0);
    setRotateY(0);
    setIsPressed(false);
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    setIsPressed(true);
  }

  function handlePointerUp() {
    setIsPressed(false);
  }

  const scatterSpring = { stiffness: 140, damping: 10 };
  const reassembleSpring = { stiffness: 320, damping: 28 };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
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
        {logoParts.map((part) => (
          <motion.div
            key={part.id}
            className="absolute inset-0"
            style={{
              clipPath: part.clip,
              overflow: "hidden",
            }}
            animate={
              prefersReducedMotion
                ? { opacity: isPressed ? 0.6 : 1 }
                : isPressed
                ? part.scatter
                : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
            }
            transition={{
              type: "spring",
              ...(isPressed ? scatterSpring : reassembleSpring),
            }}
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
        ))}
      </motion.div>
    </motion.div>
  );
}
