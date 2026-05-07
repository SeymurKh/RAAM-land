import Image from "next/image";
import { FluidButton } from "@/components/FluidButton";
import { LogoMark } from "@/components/LogoMark";
import { siteConfig } from "@/data/site";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden px-5 pb-20 pt-16"
    >
      <Image
        src={siteConfig.heroImage}
        alt="Black and white close-up of DJ turntable equipment"
        fill
        priority
        sizes="100vw"
        className="scale-110 object-cover grayscale motion-safe:animate-slow-zoom"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.78)_62%,#080706_96%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--cursor-x,50%)_var(--cursor-y,45%),rgba(120,96,72,0.2),transparent_23%)]" />
      <div className="absolute inset-0 vignette" />

      <div className="hero-copy absolute inset-x-0 top-1/2 z-10 mx-auto flex w-[calc(100%-40px)] max-w-[44rem] -translate-y-1/2 flex-col items-center text-center">
        <LogoMark className="h-24 w-24 text-base sm:h-28 sm:w-28" />
        <p className="mt-8 text-xs uppercase tracking-[0.58em] text-stone-200/58">
          {siteConfig.expandedName}
        </p>
        <h1 className="mt-6 text-5xl font-semibold uppercase leading-[0.88] tracking-normal text-white sm:text-7xl lg:text-8xl">
          RAAM
        </h1>
        <p className="mt-7 w-full max-w-[19rem] px-1 text-sm leading-7 text-stone-100/72 sm:max-w-[34rem] sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <FluidButton href="#artists">Residents</FluidButton>
          <FluidButton href="#projects" className="bg-black/20">
            Projects
          </FluidButton>
        </div>
      </div>

    </section>
  );
}
