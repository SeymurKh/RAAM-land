"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import type { HeroMedia, VenuePageContent } from "@/types/content";

/** Декоративная звуковая волна в заголовке (как в макете). */
function SoundWave({ className }: { className?: string }) {
  const bars = [6, 12, 20, 10, 26, 14, 22, 8, 18, 12, 24, 10, 16, 6];
  // Разная скорость/фаза — полосы «пляшут» как настоящий эквалайзер
  const durations = [0.9, 1.15, 0.8, 1.05, 1.25, 0.95, 1.1, 0.85, 1.2, 1.0, 0.9, 1.15, 1.05, 0.95];
  return (
    <svg
      viewBox="0 0 120 32"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {bars.map((height, index) => (
        <rect
          key={index}
          x={index * 8.5}
          y={(32 - height) / 2}
          width="3"
          height={height}
          rx="1.5"
          className="eq-bar"
          style={{
            animationDuration: `${durations[index]}s`,
            animationDelay: `${-index * 0.13}s`,
          }}
        />
      ))}
    </svg>
  );
}

/** Одна колонка фона 9:16: фото, видео или градиент-заглушка. */
function HeroColumn({ media }: { media?: HeroMedia }) {
  return (
    <div className="relative aspect-auto h-[42vh] w-full shrink-0 snap-center overflow-hidden rounded-2xl border border-[#E82919]/55 sm:aspect-[9/16] sm:h-auto sm:max-h-full sm:rounded-3xl">
      {media?.kind === "video" ? (
        <video
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : media?.kind === "image" ? (
        <Image
          src={media.src}
          alt={media.alt ?? ""}
          fill
          sizes="(min-width: 640px) 33vw, 85vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(226,59,59,0.14),transparent_55%),linear-gradient(180deg,#141010,#080706_85%)]" />
      )}
    </div>
  );
}

/** Фон hero: 3 колонки 9:16 (десктоп) / snap-скролл (мобайл). */
function HeroColumns({ columns }: { columns: HeroMedia[] }) {
  const slots: (HeroMedia | undefined)[] = [0, 1, 2].map((i) => columns[i]);

  return (
    <div className="relative flex w-full justify-center overflow-hidden px-3 pb-2 pt-16 sm:absolute sm:inset-x-0 sm:bottom-20 sm:top-16 sm:px-0 sm:pb-0 sm:pt-0">
      {/* Красное свечение позади колонок в трёх местах */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[16%] top-[26%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(232,41,25,0.55),transparent_65%)] blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,41,25,0.5),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[16%] right-[12%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(232,41,25,0.55),transparent_65%)] blur-3xl" />
      </div>
      <div className="flex w-full max-w-7xl snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 sm:snap-none sm:gap-4 sm:overflow-visible sm:px-6 lg:px-12">
        {slots.map((media, index) => (
          <div
            key={media?.id ?? `empty-${index}`}
            className="flex h-full w-[85vw] items-center sm:w-1/3 sm:min-w-0"
          >
            <HeroColumn media={media} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface VenueHeroProps {
  venue: VenuePageContent;
}

export function VenueHero({ venue }: VenueHeroProps) {
  const words = venue.name.trim().split(/\s+/);
  const firstWord = words[0] ?? venue.name;
  const restWords = words.slice(1).join(" ");

  return (
    <section
      id="venue-hero"
      className="relative isolate flex min-h-[100svh] w-full flex-col items-stretch overflow-hidden sm:flex-row sm:items-end"
    >
      {/* Background: 3 колонки 9:16 (фото/видео), фолбэк — heroImage или градиент */}
      {venue.heroColumns.length > 0 ? (
        <HeroColumns columns={venue.heroColumns} />
      ) : venue.heroImage ? (
        <Image
          src={venue.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(226,59,59,0.14),transparent_55%),linear-gradient(180deg,#141010,#080706_85%)]" />
      )}

      {/* Overlays — лёгкие: видео колонок должны просвечивать, текст читается за счёт нижнего скрима */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.5),rgba(0,0,0,0.15)_55%,rgba(0,0,0,0.3))]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25),transparent_28%,rgba(8,7,6,0.8))]" />
      <div className="pointer-events-none absolute inset-0 vignette opacity-40" />

      {/* Content */}
      <MotionReveal
        direction="none"
        className="relative z-10 mx-auto w-full min-w-0 max-w-7xl px-5 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-32 lg:px-12"
      >
        <h1 className="font-bebas text-[clamp(3.2rem,10vw,8.5rem)] leading-[0.86] tracking-wide text-stone-50">
          <span className="inline-flex flex-wrap items-center gap-x-[0.1em] gap-y-2 sm:gap-x-[0.16em]">
            {firstWord.toUpperCase()}
            <SoundWave className="h-7 w-28 text-[#E82919] sm:h-9 sm:w-40" />
          </span>
          {restWords ? (
            <span className="block">{restWords.toUpperCase()}</span>
          ) : null}
        </h1>

        <p className="mt-6 max-w-xl break-words text-base uppercase leading-7 tracking-[0.06em] text-stone-100/85 sm:text-lg">
          {venue.headline}
        </p>

        {venue.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            {venue.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-4 text-xs uppercase tracking-[0.32em] text-stone-200/75"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#E82919]" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <a
          href="#venue-live"
          className="group mt-8 inline-flex items-center gap-4 sm:absolute sm:bottom-4 sm:left-6 sm:z-20 lg:left-12"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-stone-100 transition group-hover:border-white/60 group-hover:bg-white/8">
            <ArrowDown
              size={16}
              className="transition-transform duration-500 group-hover:translate-y-1"
            />
          </span>
          <span className="text-xs uppercase tracking-[0.32em] text-stone-200/80">
            Explore the space
          </span>
        </a>
      </MotionReveal>
    </section>
  );
}