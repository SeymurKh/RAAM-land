"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FluidButton } from "@/components/FluidButton";
import { Logo3D } from "@/components/Logo3D";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { siteConfig } from "@/data/site";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax for text content only (Vanta handles its own background motion)
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.3]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 0.88 : 0.72]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, isMobile ? 0.3 : 0.15]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.8], [0, isMobile ? 3 : 6]);
  const contentFilter = useTransform(contentBlur, (v) => `blur(${v}px)`);

  // Initialize Vanta.js TRUNK effect
  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // p5.js is loaded globally via CDN <Script> in layout.tsx
    if (!(window as any).p5) return;

    let isCancelled = false;

    const initVanta = async () => {
      const VANTA = await import("vanta/dist/vanta.trunk.min");
      if (isCancelled || !vantaRef.current) return;

      const effect = VANTA.default({
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
        chaos: 3.5,
      });

      setVantaEffect(effect);
    };

    initVanta();

    return () => {
      isCancelled = true;
      if (vantaEffect) vantaEffect.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vantaEffect]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate flex min-h-screen max-h-[92vh] w-full items-center overflow-hidden sm:max-h-none"
    >
      {/* Vanta TRUNK canvas */}
      <div ref={vantaRef} className="absolute inset-0" />

      {/* Gradient overlays on top of Vanta canvas */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.78)_62%,#080706_96%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--cursor-x,50%)_var(--cursor-y,45%),rgba(120,96,72,0.2),transparent_23%)]" />

      {/* Scroll-based darkening overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 vignette" />

      {/* Hero content */}
      <motion.div
        className="hero-copy relative z-10 mx-auto flex w-full max-w-[56rem] flex-col items-center px-5 text-center"
        style={{ y: textY, scale: contentScale, opacity: contentOpacity, filter: contentFilter }}
      >
        <Logo3D />
        <p className="mt-1 text-xs uppercase tracking-[0.58em] text-stone-200/58">
          {siteConfig.expandedName}
        </p>
        <p className="mt-2 w-full max-w-[19rem] px-1 text-sm leading-7 text-stone-100/72 sm:max-w-[34rem] sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row">
          <FluidButton href="#artists" className="min-w-[140px] sm:min-w-[160px]">Artists</FluidButton>
          <FluidButton href="#projects" className="min-w-[140px] bg-black/20 sm:min-w-[160px]">
            Projects
          </FluidButton>
        </div>
      </motion.div>
    </section>
  );
}
