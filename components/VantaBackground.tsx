"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface VantaEffectHandle {
  destroy: () => void;
}

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffectHandle | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!(window as any).p5) {
      return;
    }

    let cancelled = false;

    async function initVanta() {
      const VANTA = await import("vanta/dist/vanta.trunk.min");

      if (cancelled || !vantaRef.current || effectRef.current) {
        return;
      }

      effectRef.current = VANTA.default({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xbbb4b5,
        backgroundColor: 0x0,
        spacing: 2.0,
        chaos: 3.2,
      });
    }

    initVanta();

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="pointer-events-none fixed inset-0 z-0 bg-black"
      aria-hidden="true"
    />
  );
}
