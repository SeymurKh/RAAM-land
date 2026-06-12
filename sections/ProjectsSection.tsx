"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { YouTubeModal } from "@/components/YouTubeModal";
import type { Project } from "@/types/content";

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalState, setModalState] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data: Project[]) => {
        setProjects([...data].sort((a, b) => a.order - b.order));
      });
  }, []);

  const activeProject = projects[activeIndex];

  const paddedIndex = useMemo(
    () => String(activeIndex + 1).padStart(2, "0"),
    [activeIndex],
  );

  const paddedTotal = useMemo(
    () => String(projects.length).padStart(2, "0"),
    [projects.length],
  );

  function goTo(direction: 1 | -1) {
    setActiveIndex((current) => {
      if (projects.length === 0) {
        return 0;
      }
      return (current + direction + projects.length) % projects.length;
    });
  }

  function openProject(project: Project | undefined) {
    if (!project?.youtubeUrl) {
      return;
    }
    setModalState({ url: project.youtubeUrl, title: project.title });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(1);
    }
    if (event.key === "Enter") {
      openProject(activeProject);
    }
  }

  return (
    <SectionFrame
      id="projects"
      eyebrow="Projects"
      intro="A focused gallery of the formats that currently define RAAM's public platform."
    >
      <section
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none"
        aria-label="Projects gallery"
      >
        {projects.length === 0 ? (
          <MotionReveal className="flex min-h-[360px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-[#0b0a09]/86 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-300/55">
              Projects will appear here soon
            </p>
          </MotionReveal>
        ) : (
          <div className="relative mx-auto max-w-5xl">
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] border border-white/5 bg-black/20 blur-xl" />

            <div className="relative overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#090909]/88 shadow-[0_28px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={activeProject.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.08}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 80) {
                      goTo(-1);
                    }
                    if (info.offset.x < -80) {
                      goTo(1);
                    }
                  }}
                  initial={{ opacity: 0, x: 48, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -48, filter: "blur(10px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative min-h-[560px]"
                >
                  {/* Background image */}
                  {activeProject.image ? (
                    <Image
                      src={activeProject.image}
                      alt=""
                      fill
                      className="object-cover brightness-[0.3] saturate-50"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.06),transparent_50%)]" />
                  )}

                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

                  {/* Content — top to bottom */}
                  <div className="relative z-10 flex min-h-[560px] flex-col p-6 sm:p-8 lg:p-10">
                    {/* Top: category + title */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.42em] text-stone-300/60">
                        {activeProject.category}
                      </p>
                      <h3 className="mt-3 max-w-xl text-3xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-50 sm:text-4xl lg:text-5xl">
                        {activeProject.title}
                      </h3>
                    </div>

                    {/* Middle: description */}
                    <div className="mt-6 flex-1 space-y-4 text-base leading-8 text-stone-100/72 sm:text-lg sm:leading-9 line-clamp-6">
                      {activeProject.description.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Bottom: tags + buttons */}
                    <div className="mt-auto pt-8">
                      <div className="mb-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/64">
                          {activeProject.status}
                        </span>
                        <span className="rounded-full bg-stone-100/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/64">
                          {activeProject.accent}
                        </span>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => openProject(activeProject)}
                          disabled={!activeProject.youtubeUrl}
                          className="group inline-flex h-12 items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.08] px-6 text-sm font-medium uppercase tracking-[0.22em] text-white transition hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Play size={15} />
                          Playlist
                          <ArrowUpRight
                            size={14}
                            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </button>

                        <div className="flex items-center gap-4">
                          <span className="text-xs uppercase tracking-[0.28em] text-stone-300/45">
                            {paddedIndex} / {paddedTotal}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => goTo(-1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white transition hover:bg-white/10"
                              aria-label="Previous project"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => goTo(1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white transition hover:bg-white/10"
                              aria-label="Next project"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition ${
                    index === activeIndex
                      ? "w-10 bg-stone-100"
                      : "w-2.5 bg-stone-100/28 hover:bg-stone-100/55"
                  }`}
                  aria-label={`Show ${project.title}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <YouTubeModal
        youtubeUrl={modalState?.url}
        title={modalState?.title ?? ""}
        isOpen={!!modalState}
        onClose={() => setModalState(null)}
      />
    </SectionFrame>
  );
}