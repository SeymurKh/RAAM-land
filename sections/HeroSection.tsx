"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FluidButton } from "@/components/FluidButton";
import { siteConfig } from "@/data/site";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.3]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate flex min-h-screen w-full items-center overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <Image
          src={siteConfig.heroImage}
          alt="Black and white close-up of DJ turntable equipment"
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover grayscale motion-safe:animate-slow-zoom"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.78)_62%,#080706_96%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--cursor-x,50%)_var(--cursor-y,45%),rgba(120,96,72,0.2),transparent_23%)]" />
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 vignette" />

      <motion.div
        className="hero-copy relative z-10 ml-[8%] mr-auto flex w-full max-w-[48rem] flex-col items-center px-5 text-center"
        style={{ y: textY, scale: contentScale, opacity: contentOpacity }}
      >
        <Image
          src="/assets/images/logo.png"
          alt="RAAM"
          width={800}
          height={340}
          sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
          className="h-48 w-auto sm:h-64 lg:h-80"
          priority
        />
        <p className="mt-1 text-xs uppercase tracking-[0.58em] text-stone-200/58">
          {siteConfig.expandedName}
        </p>
        <p className="mt-2 w-full max-w-[19rem] px-1 text-sm leading-7 text-stone-100/72 sm:max-w-[34rem] sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <FluidButton href="#artists">Artists</FluidButton>
          <FluidButton href="#projects" className="bg-black/20">
            Projects
          </FluidButton>
        </div>
      </motion.div>

    </section>
  );
}
