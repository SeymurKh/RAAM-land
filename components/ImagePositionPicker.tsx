"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type PickerShape = "avatar" | "modal-photo" | "project-card";

interface ImagePositionPickerProps {
  imageUrl: string;
  value?: string;
  onChange: (position: string) => void;
  shape: PickerShape;
}

const shapeClasses: Record<PickerShape, string> = {
  avatar: "aspect-square rounded-full",
  "modal-photo": "aspect-[4/5] rounded-[1.6rem]",
  "project-card": "aspect-[4/3] rounded-[1.35rem]",
};

export function ImagePositionPicker({
  imageUrl,
  value = "50% 50% 1",
  onChange,
  shape,
}: ImagePositionPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const parts = value.split(" ");
  const xPercent = parseFloat(parts[0]) || 50;
  const yPercent = parseFloat(parts[1]) || 50;
  const zoom = parseFloat(parts[2]) || 1;

  const emitChange = useCallback(
    (x: number, y: number, z: number) => {
      onChange(`${Math.round(x)}% ${Math.round(y)}% ${z.toFixed(1)}`);
    },
    [onChange],
  );

  const updateFromMouse = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      emitChange(clampedX, clampedY, zoom);
    },
    [zoom, emitChange],
  );

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setDragging(true);
    updateFromMouse(e.clientX, e.clientY);
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      updateFromMouse(e.clientX, e.clientY);
    },
    [dragging, updateFromMouse],
  );

  function handleMouseUp() {
    setDragging(false);
  }

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.005;
      const newZoom = Math.max(1, Math.min(3, zoom + delta));
      emitChange(xPercent, yPercent, newZoom);
    },
    [zoom, xPercent, yPercent, emitChange],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragging || e.touches.length !== 1) return;
      updateFromMouse(e.touches[0].clientX, e.touches[0].clientY);
    },
    [dragging, updateFromMouse],
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-sm cursor-grab overflow-hidden border border-white/10 bg-black/50 select-none ${shapeClasses[shape]}`}
      style={{ touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          setDragging(true);
          updateFromMouse(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setDragging(false)}
    >
      {/* Background image — fills the shape with zoom */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${zoom * 100}%`,
          backgroundPosition: `${xPercent}% ${yPercent}%`,
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Overlay edge ring — subtle white border-like glow */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5" />

      {/* Info badge */}
      <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-[0.65rem] text-stone-300/80 backdrop-blur-sm pointer-events-none">
        {Math.round(xPercent)}% {Math.round(yPercent)}% · {zoom.toFixed(1)}×
      </div>
      <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[0.6rem] text-stone-300/50 backdrop-blur-sm pointer-events-none">
        Drag · Scroll
      </div>
    </div>
  );
}