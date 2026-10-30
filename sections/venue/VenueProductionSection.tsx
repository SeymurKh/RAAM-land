"use client";

import { MotionReveal } from "@/components/MotionReveal";
import type { VenuePageContent } from "@/types/content";

interface VenueProductionSectionProps {
  production: VenuePageContent["production"];
}

/** Секция Production: пакеты услуг + прайс-лист (стиль меню бара). */
export function VenueProductionSection({ production }: VenueProductionSectionProps) {
  const packages = [...production.packages].sort((a, b) => a.order - b.order);
  const groups = [...production.services].sort((a, b) => a.order - b.order);

  return (
    <section
      id="venue-production"
      className="relative isolate scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <MotionReveal>
          <p className="text-xs uppercase tracking-[0.48em] text-[#E82919]">
            {production.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold uppercase leading-[0.95] tracking-normal text-stone-100 sm:text-5xl">
            {production.title}
          </h2>
          {production.description.map((paragraph, index) => (
            <p key={index} className="mt-5 max-w-2xl text-base leading-7 text-stone-200/65">
              {paragraph}
            </p>
          ))}
        </MotionReveal>

        {/* Карточки пакетов */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <MotionReveal key={pkg.id}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/3">
                <div className="rounded-t-2xl bg-[#E82919] px-5 py-3">
                  <p className="font-bebas text-2xl uppercase tracking-wide text-white">
                    {pkg.title}
                  </p>
                  {pkg.label ? (
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-white/75">
                      {pkg.label}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {pkg.tagline ? (
                    <p className="text-sm italic text-stone-300/80">{pkg.tagline}</p>
                  ) : null}
                  {pkg.description ? (
                    <p className="mt-2.5 text-sm leading-5 text-stone-400">{pkg.description}</p>
                  ) : null}
                  {pkg.bullets.length > 0 ? (
                    <ul className="mt-4 space-y-1">
                      {pkg.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-sm leading-5 text-stone-200/85"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E82919]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {pkg.result ? (
                    <p className="mt-3 text-sm italic text-stone-400/80">{pkg.result}</p>
                  ) : null}
                  <div className="mt-auto pt-5">
                    <p className="font-bebas text-3xl tracking-wide text-[#E82919]">
                      {pkg.price ?? "Custom"}
                    </p>
                  </div>
                </div>
              </div>
            </MotionReveal>
          ))}
        </div>

        {/* Прайс-лист услуг для Custom */}
        {groups.length > 0 ? (
          <div className="mt-16">
            <h3 className="font-bebas text-2xl uppercase tracking-wide text-stone-100 sm:text-3xl">
              {production.servicesTitle}
            </h3>
            <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
              {groups.map((group) => (
                <div key={group.id}>
                  <h4 className="bg-[#E82919] px-4 py-2 font-bebas text-xl uppercase tracking-wide text-white">
                    {group.title}
                  </h4>
                  <div className="mt-3 space-y-2.5">
                    {[...group.items]
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="text-[0.95rem] leading-6 text-stone-100">
                            <span className="text-stone-400">· </span>
                            {item.name}
                          </span>
                          <span
                            aria-hidden="true"
                            className="min-w-6 flex-1 translate-y-px border-b border-dotted border-white/25"
                          />
                          <span className="shrink-0 text-[0.95rem] leading-6 text-stone-200/80">
                            … {item.price}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
