"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { capabilities, siteConfig } from "@/data/site";
import { MotionReveal } from "@/components/MotionReveal";

function TiltCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = ((centerY - y) / centerY) * 6;

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, rotateY: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
      className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-stone-100/24 hover:bg-white/[0.065]"
    >
      {children}
    </motion.div>
  );
}

export function EcosystemSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: "-10% 0px" });

  return (
    <section id="ecosystem" className="relative isolate scroll-mt-24 overflow-hidden px-5 pt-10 pb-20 sm:px-8 lg:px-12">
      <Image
        src="/assets/images/artists.png"
        alt="RAAM ecosystem background"
        fill
        sizes="100vw"
        className="object-cover opacity-30"
        priority
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_23%),linear-gradient(180deg,#080706_0%,rgba(8,7,6,0.55)_42%,#080706_100%)]" />
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 border-y border-white/10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <MotionReveal direction="left">
          <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
            We are building
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold uppercase leading-[0.92] tracking-normal text-stone-100 sm:text-6xl">
            The ecosystem
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-200/64">
            {siteConfig.tagline}
          </p>
        </MotionReveal>

        <div ref={gridRef} className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <TiltCard key={item.id} index={index}>
                <div className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100">
                  <Icon size={18} />
                </div>
                <h3 className="text-xl font-medium text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-200/58">
                  {item.description}
                </p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
