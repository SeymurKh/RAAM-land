"use client";

import { useCallback, useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface VantaEffectHandle {
  destroy: () => void;
}

const BASE_CHAOS = 3.2;
const MAX_CHAOS = 8;
const SCROLL_THRESHOLD = 50;
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.85;

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffectHandle | null>(null);
  const chaosRef = useRef(BASE_CHAOS);
  const velocityRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());

  const animateSpring = useCallback(() => {
    if (!effectRef.current) return;

    const current = chaosRef.current;
    const target =
      BASE_CHAOS +
      Math.min(velocityRef.current / SCROLL_THRESHOLD, 1) *
        (MAX_CHAOS - BASE_CHAOS);
    const delta = target - current;

    chaosRef.current = current + delta * SPRING_STIFFNESS;
    velocityRef.current *= SPRING_DAMPING;

    if (velocityRef.current < 0.5) {
      velocityRef.current = 0;
    }

    try {
      (effectRef.current as any).setChaos?.(chaosRef.current);
    } catch {
      // setChaos may not be available on all versions
    }

    if (
      Math.abs(chaosRef.current - BASE_CHAOS) > 0.01 ||
      velocityRef.current > 0.5
    ) {
      rafRef.current = requestAnimationFrame(animateSpring);
    }
  }, []);

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
        chaos: BASE_CHAOS,
      });
    }

    initVanta();

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      const now = Date.now();
      const dt = Math.max(now - lastScrollTimeRef.current, 1);
      const scrollY = window.scrollY;
      const delta = Math.abs(scrollY - lastScrollYRef.current);
      const velocity = (delta / dt) * 16;

      velocityRef.current = Math.min(velocity, 200);
      lastScrollYRef.current = scrollY;
      lastScrollTimeRef.current = now;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animateSpring);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [animateSpring]);

  return (
    <div
      ref={vantaRef}
      className="pointer-events-none fixed inset-0 z-0 bg-black"
      aria-hidden="true"
    />
  );
}