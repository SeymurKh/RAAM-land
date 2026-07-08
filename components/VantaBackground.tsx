"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface VantaEffectHandle {
  destroy: () => void;
}

const BASE_CHAOS = 3.2;
const MAX_CHAOS = 6.5;
const SCROLL_THRESHOLD = 30;
const RAMP_UP = 0.2;
const DECAY_RATE = 0.94;
const SCROLL_IDLE_MS = 120;
const CHAOS_REST_THRESHOLD = 0.08; // slightly higher to stop RAF sooner

let visibilityObserver: IntersectionObserver | null = null;

function observeVisibility(el: Element, onHidden: () => void, onVisible: () => void) {
  if (typeof IntersectionObserver === "undefined") return;
  visibilityObserver?.disconnect();
  visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) onVisible();
      else onHidden();
    },
    { threshold: 0 },
  );
  visibilityObserver.observe(el);
}

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

  // Fixed pixel height — never changes on toolbar show/hide
  const [vh, setVh] = useState<number | null>(null);
  const lastWidthRef = useRef<number>(0);

  useEffect(() => {
    function measure() {
      // Only update if width changed (orientation change), ignore toolbar
      if (lastWidthRef.current !== window.innerWidth) {
        lastWidthRef.current = window.innerWidth;
        setVh(window.innerHeight);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
      if (chaosRef.current - BASE_CHAOS < CHAOS_REST_THRESHOLD) {
        chaosRef.current = BASE_CHAOS;
      }
    }

    velocityRef.current *= 0.88;
    if (velocityRef.current < 0.3) {
      velocityRef.current = 0;
    }

    try {
      const effect = effectRef.current as any;
      if (effect.options) {
        effect.options.chaos = chaosRef.current;
      }
    } catch {
      // options may not be available
    }

    const needsMore =
      isScrollingRef.current ||
      chaosRef.current - BASE_CHAOS > CHAOS_REST_THRESHOLD ||
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

    // Pause when tab is hidden / element not visible
    if (vantaRef.current) {
      observeVisibility(
        vantaRef.current,
        () => {
          // hidden — cancel any running RAF
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
          }
        },
        () => {
          // visible again — restart if needed
        },
      );
    }

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
      className="pointer-events-none fixed inset-x-0 top-0 z-0 bg-black"
      style={vh !== null ? { height: `${vh}px` } : { height: "100dvh" }}
      aria-hidden="true"
    />
  );
}