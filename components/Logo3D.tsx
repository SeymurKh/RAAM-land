"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function Logo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

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
        transition={{ type: "spring", stiffness: 120, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Image
          src="/assets/images/logo.png"
          alt="RAAM"
          width={800}
          height={340}
          sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
          className="h-48 w-auto sm:h-64 lg:h-80 mix-blend-screen"
          priority
        />
      </motion.div>
    </motion.div>
  );
}
