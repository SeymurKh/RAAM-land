"use client";

import { useCallback, useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface VantaEffectHandle {
  destroy: () => void;
}

const BASE_CHAOS = 3.2;
const MAX_CHAOS = 9;
const SCROLL_THRESHOLD = 12;
const RAMP_UP = 0.35;
const DECAY_RATE = 0.92;
const SCROLL_IDLE_MS = 120;

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffectHandle | null>(null);
  const chaosRef = useRef(BASE_CHAOS);
  const velocityRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animate = useCallback(() => {
    if (!effectRef.current) return;

    if (isScrollingRef.current) {
      const target =
        BASE_CHAOS +
        Math.min(velocityRef.current / SCROLL_THRESHOLD, 1) *
        (MAX_CHAOS - BASE_CHAOS);
      chaosRef.current += (target - chaosRef.current) * RAMP_UP;
    } else {
      chaosRef.current =
        BASE_CHAOS + (chaosRef.current - BASE_CHAOS) * DECAY_RATE;
      if (chaosRef.current - BASE_CHAOS < 0.05) {
        chaosRef.current = BASE_CHAOS;
      }
    }

    velocityRef.current *= 0.88;
    if (velocityRef.current < 0.3) {
      velocityRef.current = 0;
    }

    try {
      (effectRef.current as any).setChaos?.(chaosRef.current);
    } catch {
      // setChaos may not be available
    }

    const needsMore =
      isScrollingRef.current ||
      chaosRef.current - BASE_CHAOS > 0.05 ||
      velocityRef.current > 0.3;

    if (needsMore) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      rafRef.current = 0;
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
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, SCROLL_IDLE_MS);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [animate]);

  return (
    <div
      ref={vantaRef}
      className="pointer-events-none fixed inset-0 z-0 bg-black"
      aria-hidden="true"
    />
  );
}