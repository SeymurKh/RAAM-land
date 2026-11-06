"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, RadioTower } from "lucide-react";
import { TiltCard } from "@/components/TiltCard";
import type { VenuePageContent } from "@/types/content";

type VenueTeaserData = Pick<
  VenuePageContent,
  "name" | "headline" | "tags" | "contacts"
>;

/** Скелетон карточки, пока отвечает /api/venue. */
function VenueTeaserSkeleton() {
  return (
    <TiltCard index={0}>
      <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/25 sm:mb-8 sm:h-11 sm:w-11">
        <div className="animate-shimmer h-3 w-3 rounded-full bg-white/5" />
      </div>
      <div className="animate-shimmer h-4 w-2/3 rounded-full bg-white/5 sm:h-5" />
      <div className="mt-3 space-y-2">
        <div className="animate-shimmer h-2.5 w-full rounded-full bg-white/5" />
        <div className="animate-shimmer h-2.5 w-4/5 rounded-full bg-white/5" />
      </div>
      <div className="animate-shimmer mt-4 h-10 w-44 rounded-full bg-white/5" />
    </TiltCard>
  );
}

/**
 * Тизер Radio Stream Bar под текстом Ecosystem (левая колонка).
 * Контент грузится клиентски из /api/venue — правки из админки видны сразу,
 * без пересборки (та же конвенция, что и на остальной главной).
 */
export function VenueTeaser() {
  const [venue, setVenue] = useState<VenueTeaserData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/venue")
      .then((response) => {
        if (!response.ok) throw new Error("venue fetch failed");
        return response.json();
      })
      .then((data: VenueTeaserData) => {
        if (!cancelled) setVenue(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Сетевая ошибка — оставляем пустоту на месте (void не мигает скелетоном вечно)
  if (failed) return null;
  if (!venue) return <VenueTeaserSkeleton />;

  return (
    <TiltCard index={0}>
      <div className="flex h-full flex-col">
        <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100 sm:mb-8 sm:h-11 sm:w-11">
          <RadioTower size={14} />
        </div>
        <h3 className="text-sm font-medium text-white sm:text-xl">{venue.name}</h3>
        <p className="mt-1.5 text-[0.65rem] leading-4 text-stone-200/58 sm:mt-3 sm:text-sm sm:leading-6">
          {venue.headline}
        </p>

        {venue.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
            {venue.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-stone-200/64"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Контакты прижаты к низу карточки, когда она растянута на весь void */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 text-[0.65rem] text-stone-200/58 sm:pt-4 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0" />
            {venue.contacts.address}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} className="shrink-0" />
            {venue.contacts.hours}
          </span>
        </div>
      </div>
    </TiltCard>
  );
}