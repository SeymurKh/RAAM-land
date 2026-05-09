import Image from "next/image";
import type { ReactNode } from "react";
import { MotionReveal } from "@/components/MotionReveal";
import { cn } from "@/lib/utils";

interface SectionFrameProps {
  id: string;
  eyebrow: string;
  title?: string;
  intro?: string;
  bgImage?: string;
  children: ReactNode;
  className?: string;
}

export function SectionFrame({
  id,
  eyebrow,
  title,
  intro,
  bgImage,
  children,
  className,
}: SectionFrameProps) {
  return (
    <section
      id={id}
      className={cn("relative isolate scroll-mt-24 px-5 pt-10 pb-24 sm:px-8 lg:px-12", className)}
    >
      {bgImage ? (
        <>
          <Image src={bgImage} alt="" fill sizes="100vw" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_23%),linear-gradient(180deg,#080706_0%,rgba(8,7,6,0.55)_42%,#080706_100%)]" />
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
        </>
      ) : null}
      <div className="mx-auto max-w-7xl">
        <MotionReveal className="mb-12 grid gap-6 md:grid-cols-[0.72fr_1.28fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
              {eyebrow}
            </p>
            {title ? (
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold uppercase leading-[0.9] tracking-normal text-stone-100 sm:text-6xl lg:text-7xl">
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
