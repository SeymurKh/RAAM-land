"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { YouTubeModal } from "@/components/YouTubeModal";
import { cn, parseImagePosition } from "@/lib/utils";
import type { Project } from "@/types/content";

/**
 * Описание проекта. Скролл с fade-маской — только на мобиле (max-sm), где текст
 * не влезает в карточку; на десктопе текст идёт целиком, без overflow, поэтому
 * колесо мыши над текстом скроллит страницу как обычно. Вертикальный жест на
 * мобиле не переключает слайды — см. swipe-хендлеры сцены: свайп засчитывается
 * только для горизонтально-доминантных жестов.
 */
function ScrollableDescription({ paragraphs }: { paragraphs: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const check = () => {
      setOverflowing(scroller.scrollHeight > scroller.clientHeight + 1);
    };
    check();

    // Перенос строк (контент) и вьюпорт (max-h) меняются — следим за обоими
    const observer = new ResizeObserver(check);
    observer.observe(scroller);
    const content = scroller.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "scroll-hide max-sm:max-h-44 max-sm:overflow-y-auto max-sm:overscroll-contain",
        overflowing &&
          "[-webkit-mask-image:linear-gradient(to_bottom,#000_75%,transparent)] [mask-image:linear-gradient(to_bottom,#000_75%,transparent)]",
      )}
      style={{ touchAction: "pan-y" }}
    >
      <div className="space-y-3 text-base leading-8 text-stone-100/72 sm:text-lg sm:leading-9">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVideo, setModalVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: Project[]) =>
        setProjects([...data].sort((a, b) => a.order - b.order)),
      );
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
    setActiveIndex((c) =>
      projects.length === 0 ? 0 : (c + direction + projects.length) % projects.length,
    );
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") { event.preventDefault(); goTo(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); goTo(1); }
  }

  const total = projects.length;

  return (
    <SectionFrame
      id="projects"
      eyebrow="Projects"
      intro="A focused gallery of the formats that currently define RAAM's public platform."
      transition="bottom"
    >
      <section
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none"
        aria-label="Projects gallery"
      >
        {total === 0 ? (
          <MotionReveal className="flex min-h-90 items-center justify-center rounded-3xl border border-white/10 bg-[#0b0a09]/86 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-300/55">
              Projects will appear here soon
            </p>
          </MotionReveal>
        ) : (
          <div className="relative mx-auto max-w-5xl">
            {/* Side arrows — desktop only */}
            <button
              type="button"
              onClick={() => goTo(-1)}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/10 hover:border-white/20"
              aria-label="Previous project"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(1)}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-3 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/10 hover:border-white/20"
              aria-label="Next project"
            >
              <ChevronRight size={20} />
            </button>

            <div
              className="relative flex items-center justify-center min-h-105 sm:min-h-140"
              style={{ touchAction: "pan-y" }}
              onPointerDown={(e) => {
                const el = e.currentTarget;
                el.dataset.swipeX = String(e.clientX);
                el.dataset.swipeY = String(e.clientY);
              }}
              onPointerMove={(e) => {
                const el = e.currentTarget;
                if (!el.dataset.swipeX) return;
              }}
              onPointerUp={(e) => {
                const el = e.currentTarget;
                const startX = Number(el.dataset.swipeX || 0);
                const startY = Number(el.dataset.swipeY || 0);
                el.dataset.swipeX = "";
                el.dataset.swipeY = "";
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                // Свайп засчитываем только для горизонтально-доминантных жестов:
                // вертикальный скролл описания внутри карточки не переключает слайды
                if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy)) return;
                if (dx < 0) goTo(1);
                if (dx > 0) goTo(-1);
              }}
              onPointerCancel={(e) => {
                const el = e.currentTarget;
                el.dataset.swipeX = "";
                el.dataset.swipeY = "";
              }}
            >
              {projects.map((project, index) => {
                let pos = index - activeIndex;
                if (pos < 0) pos += total;
                if (pos > total / 2) pos -= total;
                if (Math.abs(pos) > 1) return null;

                const isCenter = pos === 0;
                const isLeft = pos === -1 || pos === total - 1;
                const isRight = pos === 1;

                const videos = (project.videos && project.videos.length > 0)
                  ? project.videos
                  : project.youtubeUrl
                    ? [{ id: "watch", title: project.title, url: project.youtubeUrl }]
                    : [];

                return (
                  <article
                    key={project.id}
                    className="absolute w-full max-w-176 origin-center rounded-[1.35rem] border border-white/12 bg-[#0b0a09]/95 shadow-[0_20px_100px_rgba(0,0,0,0.55)] overflow-hidden"
                    style={{
                      transition: "transform 0.3s cubic-bezier(0,0,0.2,1), opacity 0.3s cubic-bezier(0,0,0.2,1)",
                      transform: `scale(${isCenter ? 1 : 0.85}) translateX(${isLeft ? "-24%" : isRight ? "24%" : "0%"})`,
                      opacity: isCenter ? 1 : 0.55,
                      zIndex: isCenter ? 3 : 1,
                      pointerEvents: isCenter ? "auto" : "none",
                      willChange: "transform, opacity",
                    }}
                  >
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt=""
                        fill
                        className="object-cover saturate-[0.4]"
                        style={(() => {
                          const { position, zoom } = parseImagePosition(project.imagePosition);
                          return {
                            transformOrigin: position,
                            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                            filter: `brightness(${(project.brightness ?? 25) / 100})`,
                          };
                        })()}
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        priority={isCenter}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.05),transparent_50%)]" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/30 to-black/80" />

                    <div className="relative z-10 flex min-h-110 flex-col p-5 sm:min-h-130 sm:p-7 lg:p-9">
                      {isCenter ? (
                        <>
                          <div>
                            <p className="text-xs uppercase tracking-[0.42em] text-stone-300/60">
                              {project.category}
                            </p>
                            <h3 className="mt-3 max-w-xl text-3xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-50 sm:text-4xl lg:text-5xl">
                              {project.title}
                            </h3>
                          </div>
                          <div className="mt-5 flex-1 sm:mt-6">
                            <ScrollableDescription paragraphs={project.description} />
                          </div>

                          <div className="mt-auto pt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/64">
                              {project.status}
                            </span>
                            <span className="rounded-full bg-stone-100/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/64">
                              {project.accent}
                            </span>
                          </div>

                          {(videos.length > 0 || project.youtubeUrl) && (
                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  if (videos[0]?.url) {
                                    setModalVideo({ url: videos[0].url, title: project.title });
                                  }
                                }}
                                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-stone-200/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                              >
                                <Play size={14} />
                                Watch
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex min-h-50 flex-col justify-center px-4">
                          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-stone-300/30">
                            {project.category}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-100/50 sm:text-2xl">
                            {project.title}
                          </h3>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Navigation: ← dots → counter */}
            <div className="mt-5 flex items-center justify-center gap-3 px-2">
              <button
                type="button"
                onClick={() => goTo(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition hover:bg-white/10 sm:hidden"
                aria-label="Previous project"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex flex-wrap gap-2">
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

              <button
                type="button"
                onClick={() => goTo(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition hover:bg-white/10 sm:hidden"
                aria-label="Next project"
              >
                <ChevronRight size={16} />
              </button>

              <span className="hidden text-xs uppercase tracking-[0.28em] text-stone-300/45 md:inline">
                {paddedIndex} / {paddedTotal}
              </span>
            </div>
          </div>
        )}

        <YouTubeModal
          youtubeUrl={modalVideo?.url}
          title={modalVideo?.title ?? ""}
          isOpen={!!modalVideo}
          onClose={() => setModalVideo(null)}
          videos={(activeProject?.videos && activeProject.videos.length > 0)
            ? activeProject.videos
            : activeProject?.youtubeUrl
              ? [{ id: "watch", title: activeProject.title, url: activeProject.youtubeUrl }]
              : []}
        />
      </section>
    </SectionFrame>
  );
}