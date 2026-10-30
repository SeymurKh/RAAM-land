"use client";

import { MotionReveal } from "@/components/MotionReveal";
import type { VenuePageContent } from "@/types/content";

interface VenueCoachingSectionProps {
  coaching: VenuePageContent["coaching"];
}

/** Секция Coaching: DJ-курсы RAAM с ценовыми строками. */
export function VenueCoachingSection({ coaching }: VenueCoachingSectionProps) {
  const courses = [...coaching.courses].sort((a, b) => a.order - b.order);

  return (
    <section
      id="venue-coaching"
      className="relative isolate scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <MotionReveal>
          <p className="text-xs uppercase tracking-[0.48em] text-[#E82919]">
            {coaching.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold uppercase leading-[0.95] tracking-normal text-stone-100 sm:text-5xl">
            {coaching.title}
          </h2>
          {coaching.description.map((paragraph, index) => (
            <p key={index} className="mt-5 max-w-2xl text-base leading-7 text-stone-200/65">
              {paragraph}
            </p>
          ))}
        </MotionReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {courses.map((course) => (
            <MotionReveal key={course.id}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/3">
                <div className="rounded-t-2xl bg-[#E82919] px-5 py-3">
                  <p className="font-bebas text-2xl uppercase tracking-wide text-white">
                    {course.title}
                  </p>
                  {course.note ? (
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-white/75">
                      {course.note}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2.5 p-5">
                  {[...course.prices]
                    .sort((a, b) => a.order - b.order)
                    .map((price) => (
                      <div key={price.id} className="flex items-center gap-2">
                        <span className="text-[0.95rem] leading-6 text-stone-100">
                          {price.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="min-w-6 flex-1 translate-y-px border-b border-dotted border-white/25"
                        />
                        <span className="shrink-0 text-[0.95rem] leading-6 text-stone-200/80">
                          … {price.price}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
