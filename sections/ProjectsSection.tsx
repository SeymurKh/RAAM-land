"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { YouTubeModal } from "@/components/YouTubeModal";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { contactLinks, projects } from "@/data/site";

export function ProjectsSection() {
  const columns = [1, 2, 3, 4, 5] as const;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [modalState, setModalState] = useState<{
    url: string;
    title: string;
  } | null>(null);

  return (
    <SectionFrame
      id="projects"
      eyebrow="Projects"
      intro="A tighter view of the formats that currently define RAAM's public platform."
      bgImage="/assets/images/projects.png"
    >
      {/* ── Mobile: horizontal scroll carousel ── */}
      {isMobile ? (
        <div className="-mx-4 flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 scroll-hide">
          {columns.map((column, index) => {
            const project = projects.find((item) => item.column === column);
            if (!project) return null;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() =>
                  project.youtubeUrl
                    ? setModalState({ url: project.youtubeUrl, title: project.title })
                    : undefined
                }
                className={`min-w-[82vw] snap-center relative flex flex-col justify-between overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0a09]/92 p-5${project.youtubeUrl ? " cursor-pointer" : ""}`}
              >
                {project.bgImage && (
                    <Image
                      src={project.bgImage}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 82vw, 0px"
                      className="pointer-events-none object-cover opacity-35"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a09] via-[#0b0a09]/70 to-transparent" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.32em] text-stone-300/50">
                      {project.category}
                    </p>
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-100">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>

                  <h3 className="mt-8 text-2xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-50">
                    {project.title}
                  </h3>

                  <div className="mt-4 space-y-3 text-sm leading-6 text-stone-200/62">
                    {project.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="relative mt-6 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-stone-200/58">
                    {project.status}
                  </span>
                  <span className="rounded-full bg-stone-100/8 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-stone-200/58">
                    {project.accent}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Linktree card — mobile only */}
          <a
            href={contactLinks.find((l) => l.kind === "linktree")?.href}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-[41vw] snap-center flex flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-white/10 bg-[#0b0a09]/92 p-5 text-center transition hover:border-white/20"
          >
            <Image
              src="/assets/icons/logolinktree.png"
              alt="Linktree"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <h3 className="text-lg font-semibold uppercase tracking-wide text-stone-50">
              Linktree
            </h3>
            <p className="text-xs leading-5 text-stone-200/58">
              All RAAM links in one place
            </p>
          </a>
        </div>
      ) : (
        /* ── Desktop: grid layout ── */
        <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {columns.map((column, index) => {
            const project = projects.find((item) => item.column === column);

            if (!project) {
              return null;
            }

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, rotateY: -15, x: -20 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformStyle: "preserve-3d" }}
                onClick={() =>
                  project.youtubeUrl
                    ? setModalState({ url: project.youtubeUrl, title: project.title })
                    : undefined
                }
                className={`group relative flex min-h-[560px] flex-col justify-between overflow-hidden bg-[#0b0a09]/92 p-6 transition duration-500 hover:bg-[#14110f]${project.youtubeUrl ? " cursor-pointer" : ""}`}
              >
                {project.bgImage && (
                    <Image
                      src={project.bgImage}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 20vw, 0px"
                      className="pointer-events-none object-cover opacity-35 transition duration-500 group-hover:opacity-45"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a09] via-[#0b0a09]/70 to-transparent" />
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-stone-100/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-5">
                    <p className="text-xs uppercase tracking-[0.32em] text-stone-300/50">
                      {project.category}
                    </p>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-100 transition group-hover:rotate-45 group-hover:bg-white/10">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>

                  <h3 className="mt-12 text-4xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-50">
                    {project.title}
                  </h3>

                  <div className="mt-8 space-y-4 text-sm leading-6 text-stone-200/62">
                    {project.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="relative mt-12 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/58">
                    {project.status}
                  </span>
                  <span className="rounded-full bg-stone-100/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/58">
                    {project.accent}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <YouTubeModal
        youtubeUrl={modalState?.url}
        title={modalState?.title ?? ""}
        isOpen={!!modalState}
        onClose={() => setModalState(null)}
      />
    </SectionFrame>
  );
}
