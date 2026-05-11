"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function Logo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  function handlePointerMove(e: React.PointerEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2); // -1 to 1
    const y = (e.clientY - centerY) / (rect.height / 2); // -1 to 1
    setRotateY(x * 15); // max 15deg
    setRotateX(-y * 15);
    setGlowX(((e.clientX - rect.left) / rect.width) * 100);
    setGlowY(((e.clientY - rect.top) / rect.height) * 100);
  }

  function handlePointerLeave() {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Image
          src="/assets/images/logo.png"
          alt="RAAM"
          width={800}
          height={340}
          sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
          className="h-48 w-auto sm:h-64 lg:h-80"
          priority
          style={{
            filter: `drop-shadow(0 ${20 + Math.abs(rotateY) * 2}px ${30 + Math.abs(rotateY) * 3}px rgba(0,0,0,0.6))`,
          }}
        />
        {/* Cursor-following highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.12), transparent 60%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
