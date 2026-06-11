import type { ReactNode } from "react";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionTransition } from "@/components/SectionTransition";
import { cn } from "@/lib/utils";

interface SectionFrameProps {
  id: string;
  eyebrow: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}

export function SectionFrame({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
}: SectionFrameProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate min-h-screen scroll-mt-24 px-4 pt-6 pb-14 sm:px-5 sm:pt-10 sm:pb-24 lg:px-12",
        className,
      )}
    >
      {/* Gradient transitions for smooth section boundaries */}
      <SectionTransition position="top" />
      <SectionTransition position="bottom" />

      <div className="relative mx-auto max-w-7xl">
        <MotionReveal className="mb-6 grid gap-4 sm:mb-12 sm:gap-6 md:grid-cols-[0.72fr_1.28fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
              {eyebrow}
            </p>
            {title ? (
              <h2 className="mt-3 max-w-3xl text-2xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-100 sm:mt-4 sm:text-4xl md:text-6xl lg:text-7xl">
                {title}
              </h2>
            ) : null}
          </div>
          {intro ? (
            <p className="max-w-2xl text-base leading-7 text-stone-200/62 md:justify-self-end">
              {intro}
            </p>
          ) : null}
        </MotionReveal>
        {children}
      </div>
    </section>
  );
}