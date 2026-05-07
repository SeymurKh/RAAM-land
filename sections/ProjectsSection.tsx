import { ArrowUpRight } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { projects } from "@/data/site";

export function ProjectsSection() {
  const columns = [1, 2, 3, 4] as const;

  return (
    <SectionFrame
      id="projects"
      eyebrow="Projects"
      title="Four directions"
      intro="A tighter view of the formats that currently define RAAM's public platform."
    >
      <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column, index) => {
          const project = projects.find((item) => item.column === column);

          if (!project) {
            return null;
          }

          return (
            <MotionReveal
              key={project.id}
              delay={index * 0.06}
              className="group relative flex min-h-[560px] flex-col justify-between bg-[#0b0a09]/92 p-6 transition duration-500 hover:bg-[#14110f]"
            >
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-stone-100/30 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div>
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

              <div className="mt-12 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/58">
                  {project.status}
                </span>
                <span className="rounded-full bg-stone-100/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-200/58">
                  {project.accent}
                </span>
              </div>
            </MotionReveal>
          );
        })}
      </div>
    </SectionFrame>
  );
}
