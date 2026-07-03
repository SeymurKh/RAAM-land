"use client";

import { useRef, useState, useCallback } from "react";

interface ImagePositionPickerProps {
  imageUrl: string;
  value?: string; // "X% Y%", default "50% 50%"
  onChange: (position: string) => void;
}

export function ImagePositionPicker({
  imageUrl,
  value = "50% 50%",
  onChange,
}: ImagePositionPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // Parse current position
  const [xPercent, yPercent] = value
    .split(" ")
    .map((s) => parseFloat(s) || 50);

  const updateFromMouse = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.max(0, Math.min(100, Math.round(x)));
      const clampedY = Math.max(0, Math.min(100, Math.round(y)));
      onChange(`${clampedX}% ${clampedY}%`);
    },
    [onChange],
  );

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setDragging(true);
    updateFromMouse(e.clientX, e.clientY);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    updateFromMouse(e.clientX, e.clientY);
  }

  function handleMouseUp() {
    setDragging(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative h-40 w-full cursor-crosshair overflow-hidden rounded-xl border border-white/10 bg-black/50 select-none"
      style={{ touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: value,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-white" />
      </div>

      {/* Crosshair */}
      <div
        className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.6)]" />
        {/* Inner dot */}
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_4px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Position label */}
      <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs text-stone-300/80 backdrop-blur-sm">
        {value}
      </div>
    </div>
  );
}