import { ArrowUpRight } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { projects } from "@/data/site";

export function ProjectsSection() {
  const columns = [1, 2, 3] as const;

  return (
    <SectionFrame
      id="projects"
      eyebrow="Formats"
      title="Projects in motion"
      intro="RAAM creates distinctive music formats that blend sound, ambiance, and visual narrative across venues, landscapes, and educational spaces."
    >
      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        {columns.map((column, columnIndex) => (
          <div
            key={column}
            className={columnIndex === 1 ? "space-y-5 lg:pt-20" : "space-y-5"}
          >
            {projects
              .filter((project) => project.column === column)
              .map((project, index) => (
                <MotionReveal
                  key={project.id}
                  delay={(columnIndex + index) * 0.05}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-stone-100/24 hover:bg-white/[0.065]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-100/35 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-stone-300/50">
                        {project.category}
                      </p>
                      <h3 className="mt-4 text-3xl font-semibold uppercase leading-[0.92] tracking-normal text-stone-50">
                        {project.title}
                      </h3>
                    </div>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100 transition group-hover:rotate-45 group-hover:bg-white/10">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>

                  <div className="mt-7 space-y-4 text-sm leading-6 text-stone-200/62">
                    {project.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/58">
                      {project.status}
                    </span>
                    <span className="rounded-full bg-stone-100/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/58">
                      {project.accent}
                    </span>
                  </div>
                </MotionReveal>
              ))}
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
