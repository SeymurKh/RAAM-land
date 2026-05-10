import Image from "next/image";
import { FluidButton } from "@/components/FluidButton";
import { siteConfig } from "@/data/site";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden px-5"
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

      <div className="hero-copy relative z-10 mx-auto flex w-[calc(100%-40px)] max-w-[56rem] flex-col items-center text-center">
        <Image
          src="/assets/images/logo.png"
          alt="RAAM"
          width={800}
          height={340}
          className="h-56 w-auto sm:h-72 lg:h-96"
          priority
        />
        <p className="mt-1 text-xs uppercase tracking-[0.58em] text-stone-200/58">
          {siteConfig.expandedName}
        </p>
        <p className="mt-2 w-full max-w-[19rem] px-1 text-sm leading-7 text-stone-100/72 sm:max-w-[34rem] sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <FluidButton href="#artists">Artists</FluidButton>
          <FluidButton href="#projects" className="bg-black/20">
            Projects
          </FluidButton>
        </div>
      </div>

    </section>
  );
}
