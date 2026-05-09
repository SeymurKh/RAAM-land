import Image from "next/image";
import { siteConfig } from "@/data/site";

export function TransitionSection() {
  return (
    <section className="relative isolate flex min-h-[60vh] w-full items-center justify-center overflow-hidden">
      <Image
        src="/assets/images/lilbl.png"
        alt="RAAM visual atmosphere"
        fill
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080706] via-transparent to-[#080706]" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.58em] text-stone-200/50">
          Room All About Music
        </p>
        <h2 className="mt-6 text-3xl font-semibold uppercase leading-[0.92] tracking-normal text-stone-100/80 sm:text-5xl lg:text-6xl">
          {siteConfig.tagline}
        </h2>
        <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-stone-200/30 to-transparent" />
      </div>
    </section>
  );
}
